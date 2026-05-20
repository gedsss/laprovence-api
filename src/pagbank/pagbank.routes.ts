import type { FastifyInstance } from 'fastify'
import { pagBankController } from './pagbank.controller.js'

export async function pagBankRoutes(app: FastifyInstance) {
  app.post('/pagbank/orders/pix', async (request, reply) => {
    return pagBankController.createPixOrder(request, reply)
  })

  app.post('/pagbank/orders/credit-card', async (request, reply) => {
    return pagBankController.createCreditCardOrder(request, reply)
  })

  app.post('/pagbank/webhook', async (request, reply) => {
    return pagBankController.webhook(request, reply)
  })
}
