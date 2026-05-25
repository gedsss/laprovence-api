import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  requireActor,
  requireCompraOwnerOrGestor,
  requireListOwnerOrGestor,
} from '../../lib/access-control.js'
import { CreateComprasSchema, UpdateComprasSchema } from './compras.schema.js'
import { comprasService } from './compras.service.js'

export class ComprasController {
  async createCompras(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateComprasSchema.parse(request.body)

    const compras = await comprasService.createCompras(data)

    return reply.status(201).send({
      success: true,
      message: 'Sucesso ao criar a compra',
      data: {
        id: compras.id,
        reserva_expira_em: compras.reserva_expira_em,
        checkout_access_token: compras.checkout_access_token,
      },
    })
  }

  async getComprasByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await requireCompraOwnerOrGestor(requireActor(request.actor), id)

    const compras = await comprasService.getComprasByID(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao encontrar a compra',
      data: compras,
    })
  }

  async getComprasByCpf(request: FastifyRequest, reply: FastifyReply) {
    const { cpf } = request.params as { cpf: string }

    const compras = await comprasService.getComprasByCpf(cpf)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao encontrar a compra',
      data: compras,
    })
  }

  async getComprasByLista(request: FastifyRequest, reply: FastifyReply) {
    const { lista } = request.params as { lista: string }
    await requireListOwnerOrGestor(requireActor(request.actor), lista)

    const compras = await comprasService.getComprasByLista(lista)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao encontrar a compra',
      data: compras,
    })
  }

  async getDisponibilidadeByLista(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { lista } = request.params as { lista: string }
    const compras = await comprasService.getDisponibilidadeByLista(lista)

    return reply.status(200).send({
      success: true,
      data: compras,
    })
  }

  async updateCompras(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = UpdateComprasSchema.parse(request.body)
    await requireCompraOwnerOrGestor(requireActor(request.actor), id)

    const compras = await comprasService.updateCompras(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao atualizar a compra',
      data: compras,
    })
  }

  async deleteCompras(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await requireCompraOwnerOrGestor(requireActor(request.actor), id)

    await comprasService.deleteCompras(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao deletar a compra',
    })
  }
}

export const comprasController = new ComprasController()
