import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  catalogoService,
  type GetCatalogoFilterDTO,
} from './catalogo.service.js'
import {
  CreateCatalogoSchema,
  UpdateCatalogoSchema,
} from './catalogo.schema.js'

export class CatalogoController {
  async createCatalogo(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateCatalogoSchema.parse(request.body)

    const catalogo = await catalogoService.createCatalogo(data)

    return reply.status(201).send({
      message: 'Sucesso ao criar o item',
      success: true,
      data: catalogo,
    })
  }

  async getCatalogoByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const catalogo = await catalogoService.getCatalogoByID(id)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar o item',
      success: true,
      data: catalogo,
    })
  }

  async getCatalogo(request: FastifyRequest, reply: FastifyReply) {
    const filtros = request.query as GetCatalogoFilterDTO

    const catalogo = await catalogoService.getCatalogo(filtros)

    return reply.status(200).send({
      message: 'Sucesso ao buscar o catalogo',
      success: true,
      ...catalogo,
    })
  }

  async updateCatalogo(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const data = UpdateCatalogoSchema.parse(request.body)

    const catalogo = await catalogoService.updateCatalogo(data, id)

    return reply.status(200).send({
      message: 'Sucesso ao atualizar o item',
      success: true,
      data: catalogo,
    })
  }

  async deleteCatalogo(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await catalogoService.deleteCatalogo(id)

    return reply.status(200).send({
      message: 'Item deletado com sucesso',
      success: true,
    })
  }
}

export const catalogoController = new CatalogoController()
