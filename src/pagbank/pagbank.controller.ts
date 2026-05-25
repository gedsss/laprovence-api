import type { FastifyReply, FastifyRequest } from 'fastify'
import type { OrderResponse } from './order.js'
import {
  CancelOrderSchema,
  CreateCreditCardOrderSchema,
  CreatePixOrderSchema,
  CreateThreeDsSessionSchema,
  GetOrderStatusSchema,
} from './pagbank.schema.js'
import { pagBankService } from './pagbank.service.js'
import { processWebhook } from './webhook.js'
import {
  PAGBANK_SIGNATURE_HEADER,
  validatePagBankWebhookSignature,
} from './webhook-auth.js'

type WebhookRequest = FastifyRequest & { rawBody?: string }

function checkoutToken(request: FastifyRequest) {
  const token = request.headers['x-checkout-token']
  return Array.isArray(token) ? token[0] : token
}

function publicPaymentOrder(order: OrderResponse) {
  return {
    ...(order.qr_codes && { qr_codes: order.qr_codes }),
    ...(order.charges && {
      charges: order.charges.map(charge => ({ status: charge.status })),
    }),
  }
}

export class PagBankController {
  async createPixOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = CreatePixOrderSchema.parse(request.body)
    const order = await pagBankService.createPixOrder(
      data,
      checkoutToken(request)
    )
    return reply
      .status(201)
      .send({ success: true, data: publicPaymentOrder(order) })
  }

  async createCreditCardOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateCreditCardOrderSchema.parse(request.body)
    const order = await pagBankService.createCreditCardOrder(
      data,
      checkoutToken(request)
    )
    return reply
      .status(201)
      .send({ success: true, data: publicPaymentOrder(order) })
  }

  async createThreeDsSession(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateThreeDsSessionSchema.parse(request.body)
    const session = await pagBankService.createThreeDsSession(
      data,
      checkoutToken(request)
    )
    return reply.status(201).send({ success: true, data: session })
  }

  async getOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { compra_id } = GetOrderStatusSchema.parse(request.params)
    const status = await pagBankService.getOrderStatus(
      compra_id,
      checkoutToken(request)
    )
    return reply.send({ success: true, data: status })
  }

  async cancelOrder(request: FastifyRequest, reply: FastifyReply) {
    const { compra_id } = CancelOrderSchema.parse(request.params)
    const status = await pagBankService.cancelPendingOrder(
      compra_id,
      checkoutToken(request)
    )
    return reply.send({ success: true, data: status })
  }

  async getPublicKey(_request: FastifyRequest, reply: FastifyReply) {
    const result = await pagBankService.getPublicKey()
    return reply.send({ success: true, data: result })
  }

  async webhook(request: WebhookRequest, reply: FastifyReply) {
    const rawBody = request.rawBody ?? JSON.stringify(request.body ?? {})
    const isValidSignature = validatePagBankWebhookSignature(
      rawBody,
      request.headers[PAGBANK_SIGNATURE_HEADER]
    )

    if (!isValidSignature) {
      request.log.warn('[PagBank webhook] assinatura invalida')
      return reply.status(401).send()
    }

    const payload = request.body as
      | { id?: string; reference_id?: string }
      | undefined
    if (!payload?.id) {
      return reply
        .status(400)
        .send({ success: false, message: 'Payload invalido' })
    }

    processWebhook(payload).catch(() => {
      request.log.error('[PagBank webhook] falha ao processar')
    })

    return reply.status(200).send()
  }
}

export const pagBankController = new PagBankController()
