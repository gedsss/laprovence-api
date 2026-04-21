import type { FastifyRequest, FastifyReply } from 'fastify'
import { premontadaItensService } from './premontada_itens.service.js'
import { CreatePremontadaItensSchema } from './premontada_itens.schema.js'

export class PremontadaItensController {
  async addPremontadaItem(request: FastifyRequest, reply: FastifyReply) {
    const data = CreatePremontadaItensSchema.parse(request.body)

    const premontadaItem = await premontadaItensService.addPremontadaItem(data)

    return reply.status(201).send({
      message: 'Item adicionado à premontada com sucesso',
      success: true,
      data: premontadaItem,
    })
  }

  async getPremontadaItensById(request: FastifyRequest, reply: FastifyReply) {
    const { premontada_id } = request.params as { premontada_id: string }

    const itens =
      await premontadaItensService.getPremontadaItensById(premontada_id)

    return reply.status(200).send({
      message: 'Itens da premontada recuperados com sucesso',
      success: true,
      data: itens,
    })
  }

  async removePremontadaItem(request: FastifyRequest, reply: FastifyReply) {
    const { premontada_id, catalogo_id } = request.params as {
      premontada_id: string
      catalogo_id: string
    }

    await premontadaItensService.removePremontadaItem(
      premontada_id,
      catalogo_id
    )

    return reply.status(200).send({
      message: 'Item removido com sucesso',
      success: true,
    })
  }
}

export const premontadaItensController = new PremontadaItensController()
