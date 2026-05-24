import { createHash } from 'node:crypto'
import { BusinessRuleError, NotFoundError, ValidationError } from '../../errors/errors.js'
import { prisma } from '../../prisma/prismaClient.js'
import { verifyRecaptchaToken } from '../lib/recaptcha.js'
import {
  createOrder,
  getOrder,
  getPublicKey,
  type CreateOrderInput,
  type CreditCardCharge,
  type OrderResponse,
  type PagBankPhone,
} from './order.js'
import type {
  CreateCreditCardOrderInput,
  CreatePixOrderInput,
} from './pagbank.schema.js'

function toCents(value: { toString(): string }): number {
  return Math.round(parseFloat(value.toString()) * 100)
}

function parsePhone(telefone: string): PagBankPhone | undefined {
  const digits = telefone.replace(/\D/g, '')
  if (digits.length < 10) return undefined

  return {
    country: '55',
    area: digits.slice(0, 2),
    number: digits.slice(2),
    type: 'MOBILE',
  }
}

type CompraStatus = 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado'

const STATUS_MAP: Record<string, CompraStatus> = {
  AUTHORIZED: 'Aprovado',
  PAID: 'Aprovado',
  CANCELED: 'Rejeitado',
  DECLINED: 'Rejeitado',
  EXPIRED: 'Rejeitado',
  REFUNDED: 'Rejeitado',
  WAITING: 'Pendente',
  IN_ANALYSIS: 'Pendente',
}

type CompraStatusRow = {
  id: string
  status_pagamento: CompraStatus
  catalogo_id: string | null
}

const RESERVATION_DURATION_MS = 10 * 60 * 1000

function getRawOrderStatus(order: OrderResponse): string | undefined {
  const chargeStatus = order.charges?.[0]?.status
  if (chargeStatus) return chargeStatus

  const qrCode = order.qr_codes?.[0]
  if (!qrCode?.status) return undefined

  if (
    qrCode.status === 'WAITING' &&
    qrCode.expiration_date &&
    new Date(qrCode.expiration_date).getTime() <= Date.now()
  ) {
    return 'EXPIRED'
  }

  return qrCode.status
}

export function resolvePagBankOrderStatus(order: OrderResponse): CompraStatus | undefined {
  const rawStatus = getRawOrderStatus(order)
  return rawStatus ? STATUS_MAP[rawStatus] : undefined
}

async function returnStockOnce(compra: CompraStatusRow) {
  if (!compra.catalogo_id) return

  await prisma.catalogo.updateMany({
    where: { id: compra.catalogo_id },
    data: { estoque: { increment: 1 } },
  })
}

async function requireActiveReservation(
  compra: CompraStatusRow & { data_compra: Date }
) {
  if (compra.status_pagamento !== 'Pendente') {
    throw new BusinessRuleError('Esta tentativa de pagamento nao esta mais ativa')
  }

  const active = await prisma.compras.findFirst({
    where: { id: compra.id, status_pagamento: 'Pendente' },
    select: { id: true },
  })
  if (!active) {
    throw new BusinessRuleError('Esta tentativa de pagamento nao esta mais ativa')
  }

  const expiration = new Date(
    compra.data_compra.getTime() + RESERVATION_DURATION_MS
  )
  if (expiration.getTime() > Date.now()) return expiration

  const expired = await prisma.compras.updateMany({
    where: { id: compra.id, status_pagamento: 'Pendente' },
    data: { status_pagamento: 'Rejeitado' },
  })
  if (expired.count > 0) {
    await returnStockOnce(compra).catch(() => {})
  }

  throw new BusinessRuleError('O tempo para finalizar este presente expirou')
}

export async function syncCompraStatusFromOrder(
  compra: CompraStatusRow,
  order: OrderResponse
): Promise<CompraStatus> {
  const nextStatus = resolvePagBankOrderStatus(order)
  if (!nextStatus || compra.status_pagamento === nextStatus) {
    return compra.status_pagamento
  }

  if (compra.status_pagamento === 'Cancelado') {
    return compra.status_pagamento
  }

  if (compra.status_pagamento === 'Aprovado' && nextStatus !== 'Aprovado') {
    return compra.status_pagamento
  }

  const updated = await prisma.compras.updateMany({
    where: { id: compra.id, status_pagamento: compra.status_pagamento },
    data: { status_pagamento: nextStatus },
  })

  if (updated.count === 0) {
    const current = await prisma.compras.findUnique({
      where: { id: compra.id },
      select: { status_pagamento: true },
    })
    return current?.status_pagamento ?? compra.status_pagamento
  }

  if (updated.count > 0 && nextStatus === 'Rejeitado') {
    await returnStockOnce(compra).catch(() => {})
  }

  return nextStatus
}

function buildIdempotencyKey(
  compraId: string,
  paymentType: 'pix' | 'credit-card',
  amountInCents: number
) {
  return createHash('sha256')
    .update(`laprovence:${paymentType}:${compraId}:${amountInCents}`)
    .digest('hex')
}

function getNotificationUrls(): string[] | undefined {
  const webhookUrl = process.env.PAGBANK_WEBHOOK_URL?.trim()
  if (!webhookUrl) return undefined

  let url: URL
  try {
    url = new URL(webhookUrl)
  } catch {
    throw new ValidationError('PAGBANK_WEBHOOK_URL invalida')
  }

  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  if (url.protocol !== 'https:' && !isLocalhost) {
    throw new ValidationError('PAGBANK_WEBHOOK_URL precisa usar HTTPS')
  }

  return [webhookUrl]
}

function ensureValidAmount(amountInCents: number) {
  if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
    throw new ValidationError('Valor da compra invalido')
  }
}

export class PagBankService {
  async createPixOrder({ compra_id, recaptcha_token }: CreatePixOrderInput) {
    await verifyRecaptchaToken(recaptcha_token, 'pagbank_pix_order')

    const compra = await prisma.compras.findUnique({
      where: { id: compra_id },
      include: { catalogo: true },
    })

    if (!compra) throw new NotFoundError('Compra')
    if (!compra.email) throw new ValidationError('E-mail do convidado e obrigatorio para pagamento')
    if (compra.status_pagamento === 'Aprovado') {
      throw new ValidationError('Esta compra ja foi paga')
    }
    if (compra.status_pagamento === 'Rejeitado') {
      throw new ValidationError('Esta tentativa de pagamento ja foi encerrada')
    }
    if (compra.status_pagamento === 'Cancelado') {
      throw new ValidationError('Esta tentativa de pagamento foi cancelada')
    }

    if (compra.pagbank_order_id) {
      const order = await getOrder(compra.pagbank_order_id)
      await syncCompraStatusFromOrder(compra, order)
      return order
    }

    const reservationExpiration = await requireActiveReservation(compra)
    const amountInCents = toCents(compra.valor_pago)
    ensureValidAmount(amountInCents)

    const phone = parsePhone(compra.telefone)
    const expiration_date = reservationExpiration.toISOString()
    const notification_urls = getNotificationUrls()

    const payload: CreateOrderInput = {
      reference_id: compra.id,
      customer: {
        name: compra.nome_convidado,
        email: compra.email,
        tax_id: compra.cpf,
        ...(phone && { phones: [phone] }),
      },
      items: [
        {
          reference_id: compra.catalogo_id ?? 'cartao-presente',
          name: compra.catalogo?.nome ?? 'Cartao Presente',
          quantity: 1,
          unit_amount: amountInCents,
        },
      ],
      qr_codes: [{ amount: { value: amountInCents }, expiration_date }],
      ...(notification_urls && { notification_urls }),
    }

    const order = await createOrder(
      payload,
      buildIdempotencyKey(compra.id, 'pix', amountInCents)
    )

    await prisma.compras.update({
      where: { id: compra_id },
      data: { pagbank_order_id: order.id, forma_pagamento: 'PIX' },
    })

    return order
  }

  async createCreditCardOrder({
    compra_id,
    installments,
    card_encrypted,
    card_holder_name,
    recaptcha_token,
  }: CreateCreditCardOrderInput) {
    await verifyRecaptchaToken(recaptcha_token, 'pagbank_card_order')

    const compra = await prisma.compras.findUnique({
      where: { id: compra_id },
      include: { catalogo: true },
    })

    if (!compra) throw new NotFoundError('Compra')
    if (!compra.email) throw new ValidationError('E-mail do convidado e obrigatorio para pagamento')
    if (compra.status_pagamento === 'Aprovado') {
      throw new ValidationError('Esta compra ja foi paga')
    }
    if (compra.status_pagamento === 'Rejeitado') {
      throw new ValidationError('Esta tentativa de pagamento ja foi encerrada')
    }
    if (compra.status_pagamento === 'Cancelado') {
      throw new ValidationError('Esta tentativa de pagamento foi cancelada')
    }

    if (compra.pagbank_order_id) {
      const order = await getOrder(compra.pagbank_order_id)
      await syncCompraStatusFromOrder(compra, order)
      return order
    }

    await requireActiveReservation(compra)
    const amountInCents = toCents(compra.valor_pago)
    ensureValidAmount(amountInCents)

    if (installments > 1 && amountInCents <= 100000) {
      throw new BusinessRuleError(
        'Parcelamento disponivel apenas para compras acima de R$ 1.000,00'
      )
    }

    const phone = parsePhone(compra.telefone)
    const notification_urls = getNotificationUrls()

    const charge: CreditCardCharge = {
      reference_id: compra.id,
      description: compra.catalogo?.nome ?? 'Cartao Presente',
      amount: { value: amountInCents, currency: 'BRL' },
      payment_method: {
        type: 'CREDIT_CARD',
        installments,
        capture: true,
        card: {
          encrypted: card_encrypted,
          store: false,
        },
        holder: {
          name: card_holder_name,
          tax_id: compra.cpf,
        },
      },
    }

    const payload: CreateOrderInput = {
      reference_id: compra.id,
      customer: {
        name: compra.nome_convidado,
        email: compra.email,
        tax_id: compra.cpf,
        ...(phone && { phones: [phone] }),
      },
      items: [
        {
          reference_id: compra.catalogo_id ?? 'cartao-presente',
          name: compra.catalogo?.nome ?? 'Cartao Presente',
          quantity: 1,
          unit_amount: amountInCents,
        },
      ],
      charges: [charge],
      ...(notification_urls && { notification_urls }),
    }

    const order = await createOrder(
      payload,
      buildIdempotencyKey(compra.id, 'credit-card', amountInCents)
    )
    const nextStatus = resolvePagBankOrderStatus(order)

    await prisma.compras.update({
      where: { id: compra_id },
      data: {
        pagbank_order_id: order.id,
        forma_pagamento: 'Cartao de Credito',
      },
    })

    if (nextStatus) await syncCompraStatusFromOrder(compra, order)

    return order
  }

  async getOrderStatus(compra_id: string): Promise<{
    compra_status: string
    pagbank_order: OrderResponse | null
  }> {
    const compra = await prisma.compras.findUnique({ where: { id: compra_id } })
    if (!compra) throw new NotFoundError('Compra')

    let compra_status = compra.status_pagamento

    if (!compra.pagbank_order_id) {
      return { compra_status, pagbank_order: null }
    }

    let pagbank_order: OrderResponse | null = null
    try {
      pagbank_order = await getOrder(compra.pagbank_order_id)
      compra_status = await syncCompraStatusFromOrder(compra, pagbank_order)
    } catch {
      // Retorna o status local se o PagBank estiver indisponivel.
    }

    return { compra_status, pagbank_order }
  }

  async cancelPendingOrder(compra_id: string) {
    const compra = await prisma.compras.findUnique({ where: { id: compra_id } })
    if (!compra) throw new NotFoundError('Compra')

    let compra_status = compra.status_pagamento
    if (compra.pagbank_order_id) {
      try {
        const order = await getOrder(compra.pagbank_order_id)
        compra_status = await syncCompraStatusFromOrder(compra, order)
      } catch {
        // Se o PagBank nao responder, nao encerra uma tentativa ativa.
      }
    }

    if (compra_status === 'Aprovado') {
      throw new ValidationError('Esta compra ja foi paga')
    }

    if (compra_status === 'Cancelado') {
      return { compra_status: 'Cancelado' }
    }

    if (compra.pagbank_order_id && compra_status === 'Pendente') {
      return { compra_status: 'Pendente' }
    }

    if (compra_status !== 'Rejeitado') {
      const updated = await prisma.compras.updateMany({
        where: { id: compra_id, status_pagamento: 'Pendente' },
        data: { status_pagamento: 'Rejeitado' },
      })

      if (updated.count > 0) {
        await returnStockOnce(compra).catch(() => {})
      }
    }

    return { compra_status: 'Rejeitado' }
  }

  async getPublicKey() {
    const result = await getPublicKey()
    return { public_key: result.public_key }
  }
}

export const pagBankService = new PagBankService()
