import type { FastifyInstance } from 'fastify'
import { comprasController } from './compras.controller.js'

export async function comprasRoutes(app: FastifyInstance) {
  app.post('/compras', async (request, reply) => {
    return comprasController.createCompras(request, reply)
  })

  app.get('/compras/:id', async (request, reply) => {
    return comprasController.getComprasByID(request, reply)
  })

  app.get('/compras/cpf/:cpf', async (request, reply) => {
    return comprasController.getComprasByCpf(request, reply)
  })

  app.get('/compras/cpf/:lista', async (request, reply) => {
    return comprasController.getComprasByLista(request, reply)
  })

  app.put('/compras/:id', async (request, reply) => {
    return comprasController.updateCompras(request, reply)
  })

  app.delete('/compras/:id', async (request, reply) => {
    return comprasController.deleteCompras(request, reply)
  })
}
