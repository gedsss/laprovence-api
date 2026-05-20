import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  CreateCreditCardOrderSchema,
  CreatePixOrderSchema,
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

  async webhook(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as { id: string; reference_id?: string }
    processWebhook(payload).catch(() => {})
    return reply.status(200).send()
  }
}

export const pagBankController = new PagBankController()
