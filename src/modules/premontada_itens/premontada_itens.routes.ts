import type { FastifyInstance } from 'fastify'
import { premontadaItensController } from './premontada_itens.controller.js'

export async function premontadaItensRoutes(app: FastifyInstance) {
  app.post(
    '/premontada-itens',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return premontadaItensController.addPremontadaItem(request, reply)
    }
  )

  app.get('/premontadas/:premontada_id/itens', async (request, reply) => {
    return premontadaItensController.getPremontadaItensById(request, reply)
  })

  app.delete(
    '/premontada-itens/:premontada_id/:catalogo_id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return premontadaItensController.removePremontadaItem(request, reply)
    }
  )
}
