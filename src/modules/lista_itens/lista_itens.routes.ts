import type { FastifyInstance } from 'fastify'
import { listaItensController } from './lista_itens.controller.js'

export async function listaItensRoutes(app: FastifyInstance) {
  app.post(
    '/lista-itens',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listaItensController.createListaItem(request, reply)
    }
  )

  app.get('/listas/:listas_id/itens', async (request, reply) => {
    return listaItensController.getListaItensById(request, reply)
  })

  app.delete(
    '/lista-itens/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listaItensController.deleteListaItem(request, reply)
    }
  )
}
