import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  catalogoImagesService,
  type CreateCatalogoImagesSchemaDTO,
  type UpdateCatalogoImagesSchemaDTO,
} from './catalogo.images.service.js'
import { MissingFieldError } from '../../../errors/errors.js'

export class CatalogoImagesController {
  async createCatalogoImages(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateCatalogoImagesSchemaDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

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
    const data = request.body as UpdateCatalogoImagesSchemaDTO

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
