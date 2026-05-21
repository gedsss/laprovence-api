import { BusinessRuleError, NotFoundError, ValidationError } from '../../errors/errors.js'
import { prisma } from '../../prisma/prismaClient.js'
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

type CompraStatus = 'Pendente' | 'Aprovado' | 'Rejeitado'

const STATUS_MAP: Record<string, CompraStatus> = {
  PAID: 'Aprovado',
  AUTHORIZED: 'Aprovado',
  DECLINED: 'Rejeitado',
  CANCELED: 'Rejeitado',
  EXPIRED: 'Rejeitado',
  WAITING: 'Pendente',
  IN_ANALYSIS: 'Pendente',
}

type CompraStatusRow = {
  id: string
  status_pagamento: CompraStatus
  catalogo_id: string | null
}

function resolveOrderStatus(order: OrderResponse): CompraStatus | undefined {
  const rawStatus = order.charges?.[0]?.status ?? order.qr_codes?.[0]?.status
  return rawStatus ? STATUS_MAP[rawStatus] : undefined
}

async function syncCompraStatusFromOrder(
  compra: CompraStatusRow,
  order: OrderResponse
): Promise<CompraStatus> {
  const nextStatus = resolveOrderStatus(order)
  if (!nextStatus || compra.status_pagamento === nextStatus) {
    return compra.status_pagamento
  }
  if (compra.status_pagamento === 'Aprovado' && nextStatus !== 'Aprovado') {
    return compra.status_pagamento
  }

  const updated = await prisma.compras.updateMany({
    where: { id: compra.id, status_pagamento: { not: nextStatus } },
    data: { status_pagamento: nextStatus },
  })

  if (updated.count > 0 && nextStatus === 'Rejeitado' && compra.catalogo_id) {
    prisma.catalogo
      .updateMany({
        where: { id: compra.catalogo_id },
        data: { estoque: { increment: 1 } },
      })
      .catch(() => {})
  }

  return nextStatus
}

export class PagBankService {
  async createPixOrder({ compra_id }: CreatePixOrderInput) {
    const compra = await prisma.compras.findUnique({
      where: { id: compra_id },
      include: { catalogo: true },
    })

    if (!compra) throw new NotFoundError('Compra')
    if (!compra.email) throw new ValidationError('E-mail do convidado é obrigatório para pagamento')
    if (compra.status_pagamento === 'Aprovado') {
      throw new ValidationError('Esta compra já foi paga')
    }

    const amountInCents = toCents(compra.valor_pago)
    const phone = parsePhone(compra.telefone)
    // QR code expira em 30 minutos
    const expiration_date = new Date(Date.now() + 30 * 60 * 1000).toISOString()

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
          name: compra.catalogo?.nome ?? 'Cartão Presente',
          quantity: 1,
          unit_amount: amountInCents,
        },
      ],
      qr_codes: [{ amount: { value: amountInCents }, expiration_date }],
      ...(process.env.PAGBANK_WEBHOOK_URL && {
        notification_urls: [process.env.PAGBANK_WEBHOOK_URL],
      }),
    }

    const order = await createOrder(payload)

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
  }: CreateCreditCardOrderInput) {
    const compra = await prisma.compras.findUnique({
      where: { id: compra_id },
      include: { catalogo: true },
    })

    if (!compra) throw new NotFoundError('Compra')
    if (!compra.email) throw new ValidationError('E-mail do convidado é obrigatório para pagamento')
    if (compra.status_pagamento === 'Aprovado') {
      throw new ValidationError('Esta compra já foi paga')
    }

    const amountInCents = toCents(compra.valor_pago)

    if (installments > 1 && amountInCents <= 100000) {
      throw new BusinessRuleError(
        'Parcelamento disponível apenas para compras acima de R$ 1.000,00'
      )
    }

    const phone = parsePhone(compra.telefone)

    const charge: CreditCardCharge = {
      amount: { value: amountInCents, currency: 'BRL' },
      payment_method: {
        type: 'CREDIT_CARD',
        installments,
        capture: true,
        card: {
          encrypted: card_encrypted,
          store: false,
        },
        // holder fica fora de card, dentro de payment_method
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
          name: compra.catalogo?.nome ?? 'Cartão Presente',
          quantity: 1,
          unit_amount: amountInCents,
        },
      ],
      charges: [charge],
      ...(process.env.PAGBANK_WEBHOOK_URL && {
        notification_urls: [process.env.PAGBANK_WEBHOOK_URL],
      }),
    }

    const order = await createOrder(payload)
    const nextStatus = resolveOrderStatus(order)

    await prisma.compras.update({
      where: { id: compra_id },
      data: {
        pagbank_order_id: order.id,
        forma_pagamento: 'Cartão de Crédito',
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
      // se o PagBank não responder, retorna só o status local
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
        // se o PagBank não responder, usa o status local para decidir
      }
    }

    if (compra_status === 'Aprovado') {
      throw new ValidationError('Esta compra já foi paga')
    }

    if (compra_status !== 'Rejeitado') {
      const updated = await prisma.compras.updateMany({
        where: { id: compra_id, status_pagamento: 'Pendente' },
        data: { status_pagamento: 'Rejeitado' },
      })

      if (updated.count > 0 && compra.catalogo_id) {
        prisma.catalogo
          .updateMany({
            where: { id: compra.catalogo_id },
            data: { estoque: { increment: 1 } },
          })
          .catch(() => {})
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
