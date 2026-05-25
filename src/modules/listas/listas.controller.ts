import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  requireActor,
  requireListOwnerOrGestor,
  requireSelfOrGestor,
} from '../../lib/access-control.js'
import { CreateListasSchema, UpdateListasSchema } from './listas.schema.js'
import { listasService } from './listas.service.js'

export class ListasController {
  async createListas(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateListasSchema.parse(request.body)
    requireSelfOrGestor(requireActor(request.actor), data.user_id)

    const lista = await listasService.createListas(data)

    return reply.status(201).send({
      message: 'Sucesso ao criar a lista',
      success: true,
      data: lista,
    })
  }

  async getListasByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await requireListOwnerOrGestor(requireActor(request.actor), id)

    const lista = await listasService.getListasByID(id)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar a lista',
      success: true,
      data: lista,
    })
  }

  async getListas(_request: FastifyRequest, reply: FastifyReply) {
    const lista = await listasService.getListas()

    return reply.status(200).send({
      message: 'Sucesso ao encontrar as listas',
      success: true,
      data: lista,
    })
  }

  async getListasByCodigo(request: FastifyRequest, reply: FastifyReply) {
    const { codigo } = request.params as { codigo: string }

    const lista = await listasService.getListaByCodigo(codigo)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar a lista',
      success: true,
      data: lista,
    })
  }

  async getListasByNoivo(request: FastifyRequest, reply: FastifyReply) {
    const { user_id } = request.params as { user_id: string }
    requireSelfOrGestor(requireActor(request.actor), user_id)

    const lista = await listasService.getListaByNoivo(user_id)

    return reply.status(200).send({
      message: 'Sucesso ao encontrar a lista',
      success: true,
      data: lista,
    })
  }

  async updateListas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = UpdateListasSchema.parse(request.body)
    await requireListOwnerOrGestor(requireActor(request.actor), id)

    const lista = await listasService.updateListasById(id, data)

    return reply.status(200).send({
      message: 'Sucesso ao atualizar a lista',
      success: true,
      data: lista,
    })
  }

  async deleteListas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await requireListOwnerOrGestor(requireActor(request.actor), id)

    await listasService.deleteListas(id)

    return reply.status(200).send({
      message: 'Sucesso ao deletar a lista',
      success: true,
    })
  }
}

export const listasController = new ListasController()
