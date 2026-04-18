import type { FastifyRequest, FastifyReply } from 'fastify'
import {
  premontadaService,
  type CreatePremontadasSchemaDTO,
  type UpdatePremontadasSchemaDTO,
} from './premontadas.service.js'
import { MissingFieldError } from '../../../errors/errors.js'

export class PremontadasController {
  async createPremontadas(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreatePremontadasSchemaDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

    const premontadas = await premontadaService.createPremontadas(data)

    return reply.status(201).send({
      message: 'Lista premontada adicionada com sucesso',
      success: true,
      data: premontadas,
    })
  }

  async getPremontadas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const premontadas = await premontadaService.getPremontadasByID(id)

    return reply.status(200).send({
      message: 'Sucesso ao buscar a lista premontada',
      success: true,
      data: premontadas,
    })
  }

  async updatePremontadas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = request.body as UpdatePremontadasSchemaDTO

    const premontadas = await premontadaService.updatePremontadas(data, id)

    return reply.status(200).send({
      message: 'Sucesso ao atualizar a lista premontada',
      success: true,
      data: premontadas,
    })
  }

  async deletePremontadas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await premontadaService.deletePremontadas(id)

    return reply.status(200).send({
      message: 'Sucesso ao deletar a lista premontada',
      success: true,
    })
  }
}

export const premontadasController = new PremontadasController()
