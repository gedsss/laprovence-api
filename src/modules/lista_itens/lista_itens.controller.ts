import type { FastifyRequest, FastifyReply } from 'fastify'
import { listaItensService } from './lista_itens.service.js'
import { CreateListaItensSchema } from './lista_itens.schema.js'

export class ListaItensController {
  async createListaItem(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateListaItensSchema.parse(request.body)

    const listaItem = await listaItensService.createListaItem(data)

    return reply.status(201).send({
      message: 'Item adicionado à lista com sucesso',
      success: true,
      data: listaItem,
    })
  }

  async getListaItensById(request: FastifyRequest, reply: FastifyReply) {
    const { listas_id } = request.params as { listas_id: string }

    const itens = await listaItensService.getListaItensById(listas_id)

    return reply.status(200).send({
      message: 'Itens da lista recuperados com sucesso',
      success: true,
      data: itens,
    })
  }

  async deleteListaItem(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await listaItensService.deleteListaItem(id)

    return reply.status(200).send({
      message: 'Item removido com sucesso',
      success: true,
    })
  }
}

export const listaItensController = new ListaItensController()
