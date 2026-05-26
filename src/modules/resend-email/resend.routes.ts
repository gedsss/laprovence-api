import type { FastifyInstance } from 'fastify'
import { resendController } from './resend.controller.js'

export async function resendRoutes(app: FastifyInstance) {
  app.post('/email/recuperar-senha', async (request, reply) => {
    return resendController.sendRecuperarSenha(request, reply)
  })
}
