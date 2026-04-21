import type { FastifyInstance } from 'fastify'
import { catalogoController } from './catalogo.controller.js'

export async function catalogoRoutes(app: FastifyInstance) {
  app.post('/catalogo', async (request, reply) => {
    return catalogoController.createCatalogo(request, reply)
  })

  app.get('/catalogo/:id', async (request, reply) => {
    return catalogoController.getCatalogoByID(request, reply)
  })

  app.put('/catalogo/:id', async (request, reply) => {
    return catalogoController.updateCatalogo(request, reply)
  })

  app.get('/catalogo', async (request, reply) => {
    return catalogoController.getCatalogo(request, reply)
  })

  app.delete('/catalogo/:id', async (request, reply) => {
    return catalogoController.deleteCatalogo(request, reply)
  })
}
