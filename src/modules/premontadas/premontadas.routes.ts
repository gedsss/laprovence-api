import type { FastifyInstance } from 'fastify'
import { premontadasController } from './premontadas.controller.js'

export async function premontadasRoutes(app: FastifyInstance) {
  app.post(
    '/premontadas',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return premontadasController.createPremontadas(request, reply)
    }
  )

  app.get('/premontadas/:id', async (request, reply) => {
    return premontadasController.getPremontadasByID(request, reply)
  })

  app.get('/premontadas', async (request, reply) => {
    return premontadasController.getPremontadas(request, reply)
  })

  app.put(
    '/premontadas/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return premontadasController.updatePremontadas(request, reply)
    }
  )

  app.delete(
    '/premontadas/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return premontadasController.deletePremontadas(request, reply)
    }
  )
}
