import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  catalogoService,
  type CreateCatalogoSchemaDTO,
  type UpdateCatalogoSchemaDTO,
} from './catalogo.service.js'
import { MissingFieldError } from '../../../errors/errors.js'

export class CatalogoController {
  async createCatalogo(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateCatalogoSchemaDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

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

  async getCatalogoByNome(request: FastifyRequest, reply: FastifyReply) {
    const { nome } = request.params as { nome: string }

    const catalogo = await catalogoService.getCatalogoByNome(nome)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar o item',
      success: true,
      data: catalogo,
    })
  }

  async getCatalogoByMarca(request: FastifyRequest, reply: FastifyReply) {
    const { marca } = request.params as { marca: string }

    const catalogo = await catalogoService.getCatalogoByMarca(marca)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar o item',
      success: true,
      data: catalogo,
    })
  }

  async getCatalogoByDescricao(request: FastifyRequest, reply: FastifyReply) {
    const { descricao } = request.params as { descricao: string }

    const catalogo = await catalogoService.getCatalogoByDescricao(descricao)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar o item',
      success: true,
      data: catalogo,
    })
  }

  async updateCatalogo(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const data = request.body as UpdateCatalogoSchemaDTO

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
