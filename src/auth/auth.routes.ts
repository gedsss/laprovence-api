import type { FastifyInstance } from 'fastify'
import { authController } from './auth.controller.js'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      return authController.login(request, reply)
    }
  )

  app.post('/forgot-password', async (request, reply) => {
    return authController.forgotPassword(request, reply)
  })

  app.post('/reset-password', async (request, reply) => {
    return authController.resetPassword(request, reply)
  })
}
