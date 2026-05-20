import { NotFoundError, ValidationError } from '../../errors/errors.js'
import { prisma } from '../../prisma/prismaClient.js'
import {
  createOrder,
  type CreateOrderInput,
  type CreditCardCharge,
  type PagBankPhone,
  type PixCharge,
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

export class PagBankService {
  async createPixOrder({ compra_id, email }: CreatePixOrderInput) {
    const compra = await prisma.compras.findUnique({
      where: { id: compra_id },
      include: { catalogo: true },
    })

    if (!compra) throw new NotFoundError('Compra')
    if (compra.status_pagamento === 'Aprovado') {
      throw new ValidationError('Esta compra já foi paga')
    }

    const amountInCents = toCents(compra.valor_pago)
    const phone = parsePhone(compra.telefone)

    const charge: PixCharge = {
      amount: { value: amountInCents, currency: 'BRL' },
      payment_method: { type: 'PIX' },
    }

    const payload: CreateOrderInput = {
      reference_id: compra.id,
      customer: {
        name: compra.nome_convidado,
        email,
        tax_id: compra.cpf,
        ...(phone && { phones: [phone] }),
      },
      items: [
        {
          name: compra.catalogo?.nome ?? 'Presente',
          quantity: 1,
          unit_amount: amountInCents,
        },
      ],
      charges: [charge],
      ...(process.env.PAGBANK_WEBHOOK_URL && {
        notification_urls: [process.env.PAGBANK_WEBHOOK_URL],
      }),
    }

    return createOrder(payload)
  }

  async createCreditCardOrder({
    compra_id,
    email,
    installments,
    card_encrypted,
    card_holder_name,
  }: CreateCreditCardOrderInput) {
    const compra = await prisma.compras.findUnique({
      where: { id: compra_id },
      include: { catalogo: true },
    })

    if (!compra) throw new NotFoundError('Compra')
    if (compra.status_pagamento === 'Aprovado') {
      throw new ValidationError('Esta compra já foi paga')
    }

    const amountInCents = toCents(compra.valor_pago)
    const phone = parsePhone(compra.telefone)

    const charge: CreditCardCharge = {
      amount: { value: amountInCents, currency: 'BRL' },
      payment_method: {
        type: 'CREDIT_CARD',
        installments,
        capture: true,
        card: {
          encrypted: card_encrypted,
          holder: { name: card_holder_name },
          store: false,
        },
      },
    }

    const payload: CreateOrderInput = {
      reference_id: compra.id,
      customer: {
        name: compra.nome_convidado,
        email,
        tax_id: compra.cpf,
        ...(phone && { phones: [phone] }),
      },
      items: [
        {
          name: compra.catalogo?.nome ?? 'Presente',
          quantity: 1,
          unit_amount: amountInCents,
        },
      ],
      charges: [charge],
      ...(process.env.PAGBANK_WEBHOOK_URL && {
        notification_urls: [process.env.PAGBANK_WEBHOOK_URL],
      }),
    }

    return createOrder(payload)
  }
}

export const pagBankService = new PagBankService()
