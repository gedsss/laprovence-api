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

  app.post(
    '/forgot-password',
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '5 minutes',
        },
      },
    },
    async (request, reply) => {
      return authController.forgotPassword(request, reply)
    }
  )

  app.post(
    '/reset-password',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '5 minutes',
        },
      },
    },
    async (request, reply) => {
      return authController.resetPassword(request, reply)
    }
  )
}
