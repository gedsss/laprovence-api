import type { FastifyInstance } from 'fastify'
import { pagBankController } from './pagbank.controller.js'

export async function pagBankRoutes(app: FastifyInstance) {
  app.get('/pagbank/public-key', async (request, reply) => {
    return pagBankController.getPublicKey(request, reply)
  })

  app.post('/pagbank/orders/pix', async (request, reply) => {
    return pagBankController.createPixOrder(request, reply)
  })

  app.post('/pagbank/orders/credit-card', async (request, reply) => {
    return pagBankController.createCreditCardOrder(request, reply)
  })

  app.get('/pagbank/orders/:compra_id/status', async (request, reply) => {
    return pagBankController.getOrderStatus(request, reply)
  })

  app.post('/pagbank/orders/:compra_id/cancel', async (request, reply) => {
    return pagBankController.cancelOrder(request, reply)
  })

  app.post('/pagbank/webhook', async (request, reply) => {
    return pagBankController.webhook(request, reply)
  })
}
