import type { FastifyRequest, FastifyReply } from 'fastify'
import { premontadaService } from './premontadas.service.js'
import {
  CreatePremontadasSchema,
  UpdatePremontadasSchema,
} from './premontadas.schema.js'

export class PremontadasController {
  async createPremontadas(request: FastifyRequest, reply: FastifyReply) {
    const data = CreatePremontadasSchema.parse(request.body)

    const premontadas = await premontadaService.createPremontadas(data)

    return reply.status(201).send({
      message: 'Lista premontada adicionada com sucesso',
      success: true,
      data: premontadas,
    })
  }

  async getPremontadasByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const premontadas = await premontadaService.getPremontadasByID(id)

    return reply.status(200).send({
      message: 'Sucesso ao buscar a lista premontada',
      success: true,
      data: premontadas,
    })
  }

  async getPremontadas(request: FastifyRequest, reply: FastifyReply) {
    const premontadas = await premontadaService.getPremontadas()

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao buscar as listas premontadas',
      data: premontadas,
    })
  }

  async updatePremontadas(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = UpdatePremontadasSchema.parse(request.body)

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
