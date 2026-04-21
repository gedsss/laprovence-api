import type { FastifyRequest, FastifyReply } from 'fastify'
import { catalogoImagesService } from './catalogo.images.service.js'
import {
  CreateCatalogoImagesSchema,
  UpdateCatalogoImagesSchema,
} from './catalogo.images.schema.js'

export class CatalogoImagesController {
  async createCatalogoImages(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateCatalogoImagesSchema.parse(request.body)

    const image = await catalogoImagesService.createCatalogoImages(data)

    return reply.status(201).send({
      message: 'Sucesso ao criar a imagem',
      success: true,
      data: image,
    })
  }

  async getCatalogoImages(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const image = await catalogoImagesService.getCatalogoImagesByID(id)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar a imagem',
      success: true,
      data: image,
    })
  }

  async updateCatalogoImages(request: FastifyRequest, reply: FastifyReply) {
    const data = UpdateCatalogoImagesSchema.parse(request.body)

    const { id } = request.params as { id: string }

    const image = await catalogoImagesService.updateCatalogoImages(id, data)

    return reply.status(200).send({
      message: 'Sucesso ao atualizar a imagem',
      success: true,
      data: image,
    })
  }

  async deleteCatalogoImages(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await catalogoImagesService.deleteCatalogoImages(id)

    return reply.status(200).send({
      message: 'Sucesso ao deletar a imagem',
      success: true,
    })
  }
}

export const catalogoImagesController = new CatalogoImagesController()
