import type { FastifyInstance } from 'fastify'
import { comprasController } from './compras.controller.js'

export async function comprasRoutes(app: FastifyInstance) {
  app.post(
    '/compras',
    {
      bodyLimit: 16 * 1024,
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      return comprasController.createCompras(request, reply)
    }
  )

  app.get(
    '/compras/:id',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return comprasController.getComprasByID(request, reply)
    }
  )

  app.get(
    '/compras/cpf/:cpf',
    { preHandler: [app.authenticate, app.requireGestor] },
    async (request, reply) => {
      return comprasController.getComprasByCpf(request, reply)
    }
  )

  app.get(
    '/compras/lista/:lista/disponibilidade',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (request, reply) => {
      return comprasController.getDisponibilidadeByLista(request, reply)
    }
  )

  app.get(
    '/compras/lista/:lista',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return comprasController.getComprasByLista(request, reply)
    }
  )

  app.put(
    '/compras/:id',
    { preHandler: [app.authenticate, app.requireCsrf] },
    async (request, reply) => {
      return comprasController.updateCompras(request, reply)
    }
  )

  app.delete(
    '/compras/:id',
    { preHandler: [app.authenticate, app.requireCsrf] },
    async (request, reply) => {
      return comprasController.deleteCompras(request, reply)
    }
  )
}
