import type { FastifyInstance } from 'fastify'
import { listasController } from './listas.controller.js'

export async function listasRoutes(app: FastifyInstance) {
  app.post('/listas', async (request, reply) => {
    return listasController.createListas(request, reply)
  })

  app.get('/listas/:id', async (request, reply) => {
    return listasController.getListasByID(request, reply)
  })

  app.get('/listas/codigo/:codigo', async (request, reply) => {
    return listasController.getListasByCodigo(request, reply)
  })

  app.get('/listas/user/:user_id', async (request, reply) => {
    return listasController.getListasByNoivo(request, reply)
  })

  app.put('/listas/:id', async (request, reply) => {
    return listasController.updateListas(request, reply)
  })

  app.delete('/listas/:id', async (request, reply) => {
    return listasController.deleteListas(request, reply)
  })
}
