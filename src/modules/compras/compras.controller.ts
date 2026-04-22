import type { FastifyRequest, FastifyReply } from 'fastify'
import { comprasService } from './compras.service.js'
import { CreateComprasSchema, UpdateComprasSchema } from './compras.schema.js'

export class ComprasController {
  async createCompras(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateComprasSchema.parse(request.body)

    const compras = await comprasService.createCompras(data)

    return reply.status(201).send({
      success: true,
      message: 'Sucesso ao criar a compra',
      data: compras,
    })
  }

  async getComprasByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

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

    const compras = await comprasService.getComprasByLista(lista)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao encontrar a compra',
      data: compras,
    })
  }

  async updateCompras(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = UpdateComprasSchema.parse(request.body)

    const compras = await comprasService.updateCompras(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao atualizar a compra',
      data: compras,
    })
  }

  async deleteCompras(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await comprasService.deleteCompras(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao deletar a compra',
    })
  }
}

export const comprasController = new ComprasController()
