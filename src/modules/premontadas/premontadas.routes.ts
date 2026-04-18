import type { FastifyInstance } from 'fastify'
import { premontadasController } from './premontadas.controller.js'

export async function premontadasRoutes(app: FastifyInstance) {
  app.post('/premontadas', async (request, reply) => {
    return premontadasController.createPremontadas(request, reply)
  })

  app.get('/premontadas/:id', async (request, reply) => {
    return premontadasController.getPremontadas(request, reply)
  })

  app.put('/premontadas/:id', async (request, reply) => {
    return premontadasController.updatePremontadas(request, reply)
  })

  app.delete('/premontadas/:id', async (request, reply) => {
    return premontadasController.deletePremontadas(request, reply)
  })
}
