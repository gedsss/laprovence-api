import type { FastifyInstance } from 'fastify'
import { listasController } from './listas.controller.js'

export async function listasRoutes(app: FastifyInstance) {
  app.post(
    '/listas',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listasController.createListas(request, reply)
    }
  )

  app.get(
    '/listas',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listasController.getListas(request, reply)
    }
  )

  app.get(
    '/listas/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listasController.getListasByID(request, reply)
    }
  )

  app.get('/listas/codigo/:codigo', async (request, reply) => {
    return listasController.getListasByCodigo(request, reply)
  })

  app.get(
    '/listas/user/:user_id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listasController.getListasByNoivo(request, reply)
    }
  )

  app.put(
    '/listas/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listasController.updateListas(request, reply)
    }
  )

  app.delete(
    '/listas/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return listasController.deleteListas(request, reply)
    }
  )
}
