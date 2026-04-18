import type { FastifyInstance } from 'fastify'
import { catalogoImagesController } from './catalogo.images.controller.js'

export async function userRoutes(app: FastifyInstance) {
  app.post('/catalogo-images', async (request, reply) => {
    return catalogoImagesController.createCatalogoImages(request, reply)
  })

  app.get('/catalogo-images/:id', async (request, reply) => {
    return catalogoImagesController.getCatalogoImages(request, reply)
  })

  app.put('/catalogo-images/:id', async (request, reply) => {
    return catalogoImagesController.updateCatalogoImages(request, reply)
  })

  app.delete('/catalogo-images/:id', async (request, reply) => {
    return catalogoImagesController.deleteCatalogoImages(request, reply)
  })
}
