import type { FastifyInstance } from 'fastify'
import { institucionalController } from './institucional.controller.js'

const adminPreHandlers = ['authenticateInstitucionalAdmin'] as const
const writePreHandlers = [
  'authenticateInstitucionalAdmin',
  'requireCsrf',
] as const

export async function institucionalRoutes(app: FastifyInstance) {
  app.post('/institucional/auth/login', async (request, reply) => {
    return institucionalController.login(request, reply)
  })

  app.get(
    '/institucional/auth/session',
    { preHandler: [app.authenticateInstitucionalAdmin] },
    async (request, reply) => {
      return institucionalController.session(request, reply)
    }
  )

  app.post(
    '/institucional/auth/logout',
    { preHandler: [app.authenticateInstitucionalAdmin, app.requireCsrf] },
    async (request, reply) => {
      return institucionalController.logout(request, reply)
    }
  )

  app.get('/institucional/categories', async (request, reply) => {
    return institucionalController.listCategories(request, reply)
  })

  app.get('/institucional/stores', async (request, reply) => {
    return institucionalController.listStores(request, reply)
  })

  app.get('/institucional/stores/:id', async (request, reply) => {
    return institucionalController.getStore(request, reply)
  })

  app.get('/institucional/media/:fileName', async (request, reply) => {
    return institucionalController.getMedia(request, reply)
  })

  app.get(
    '/institucional/admin/categories',
    { preHandler: adminPreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.listCategories(request, reply)
    }
  )

  app.post(
    '/institucional/admin/categories',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.createCategory(request, reply)
    }
  )

  app.put(
    '/institucional/admin/categories/:id',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.updateCategory(request, reply)
    }
  )

  app.delete(
    '/institucional/admin/categories/:id',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.deleteCategory(request, reply)
    }
  )

  app.get(
    '/institucional/admin/stores',
    { preHandler: adminPreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.listStores(request, reply)
    }
  )

  app.post(
    '/institucional/admin/stores',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.createStore(request, reply)
    }
  )

  app.put(
    '/institucional/admin/stores/:id',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.updateStore(request, reply)
    }
  )

  app.delete(
    '/institucional/admin/stores/:id',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.deleteStore(request, reply)
    }
  )

  app.patch(
    '/institucional/admin/stores/reorder',
    { preHandler: writePreHandlers.map(handler => app[handler]) },
    async (request, reply) => {
      return institucionalController.reorderStores(request, reply)
    }
  )

  app.post(
    '/institucional/admin/uploads',
    {
      bodyLimit: 8 * 1024 * 1024,
      preHandler: writePreHandlers.map(handler => app[handler]),
    },
    async (request, reply) => {
      return institucionalController.upload(request, reply)
    }
  )
}
