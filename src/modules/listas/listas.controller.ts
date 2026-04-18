import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  listasService,
  type CreateListasSchemaDTO,
  type UpdateListasSchemaDTO,
} from './listas.service.js'
import { MissingFieldError } from '../../../errors/errors.js'

export class ListasController {
  async createListas(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateListasSchemaDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

    const lista = await listasService.createListas(data)

    return reply.status(201).send({
      message: 'Sucesso ao criar a lista',
      success: true,
      data: lista,
    })
  }

  async getListasByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const lista = await listasService.getListasByID(id)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar a lista',
      success: true,
      data: lista,
    })
  }

  async updateListas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = request.body as UpdateListasSchemaDTO

    const lista = await listasService.updateListasById(id, data)

    return reply.status(200).send({
      message: 'Sucesso ao atualizar a lista',
      success: true,
      data: lista,
    })
  }

  async deleteListas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await listasService.deleteListas(id)

    return reply.status(200).send({
      message: 'Sucesso ao deletar a lista',
      success: true,
    })
  }
}

export const listasController = new ListasController()
