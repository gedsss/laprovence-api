import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  CancelOrderSchema,
  CreateCreditCardOrderSchema,
  CreatePixOrderSchema,
  GetOrderStatusSchema,
} from './pagbank.schema.js'
import { pagBankService } from './pagbank.service.js'
import { processWebhook } from './webhook.js'

export class PagBankController {
  async createPixOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = CreatePixOrderSchema.parse(request.body)
    const order = await pagBankService.createPixOrder(data)
    return reply.status(201).send({ success: true, data: order })
  }

  async createCreditCardOrder(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateCreditCardOrderSchema.parse(request.body)
    const order = await pagBankService.createCreditCardOrder(data)
    return reply.status(201).send({ success: true, data: order })
  }

  async getOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { compra_id } = GetOrderStatusSchema.parse(request.params)
    const status = await pagBankService.getOrderStatus(compra_id)
    return reply.send({ success: true, data: status })
  }

  async cancelOrder(request: FastifyRequest, reply: FastifyReply) {
    const { compra_id } = CancelOrderSchema.parse(request.params)
    const status = await pagBankService.cancelPendingOrder(compra_id)
    return reply.send({ success: true, data: status })
  }

  async getPublicKey(_request: FastifyRequest, reply: FastifyReply) {
    const result = await pagBankService.getPublicKey()
    return reply.send({ success: true, data: result })
  }

  async webhook(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as { id: string; reference_id?: string }
    processWebhook(payload).catch(() => {})
    return reply.status(200).send()
  }
}

export const pagBankController = new PagBankController()
