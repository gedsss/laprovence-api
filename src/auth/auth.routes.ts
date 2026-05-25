import type { FastifyInstance } from 'fastify'
import { authController } from './auth.controller.js'

export async function authRoutes(app: FastifyInstance) {
  app.get(
    '/session',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return authController.session(request, reply)
    }
  )

  app.post(
    '/logout',
    { preHandler: [app.requireCsrf] },
    async (request, reply) => {
      return authController.logout(request, reply)
    }
  )

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
