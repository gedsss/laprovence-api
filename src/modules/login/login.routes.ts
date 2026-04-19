import type { FastifyInstance } from 'fastify'
import { loginController } from './login.controller.js'

export async function loginRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    return loginController.login(request, reply)
  })
}
