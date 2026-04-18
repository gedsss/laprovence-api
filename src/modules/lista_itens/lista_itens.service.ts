import {
  MissingFieldError,
  NotFoundError,
  ValidationError,
} from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type { CreateListaItensInput } from './lista_itens.schema.js'

export interface CreateListaItensSchemaDTO extends CreateListaItensInput {}

export class ListaItensService {
  async createListaItem(data: CreateListaItensSchemaDTO) {
    if (!data.listas_id || !data.catalogo_id) {
      throw new MissingFieldError()
    }

    try {
      const listaExiste = await prisma.listas.findUnique({
        where: { id: data.listas_id },
      })

      if (!listaExiste) {
        throw new NotFoundError('Lista não encontrada')
      }

      const catalogoExiste = await prisma.catalogo.findUnique({
        where: { id: data.catalogo_id },
      })

      if (!catalogoExiste) {
        throw new NotFoundError('Catálogo não encontrado')
      }

      const listaItem = await prisma.lista_itens.create({
        data: {
          listas_id: data.listas_id,
          catalogo_id: data.catalogo_id,
        },
      })

      if (!listaItem) {
        throw new ValidationError('Erro ao adicionar item à lista')
      }

      return listaItem
    } catch (err: any) {
      throw new ValidationError('Não foi possível adicionar o item', err)
    }
  }

  async getListaItensById(listas_id: string) {
    try {
      const lista = await prisma.listas.findUnique({
        where: { id: listas_id },
      })

      if (!lista) {
        throw new NotFoundError('Lista não encontrada')
      }

      const itens = await prisma.lista_itens.findMany({
        where: { listas_id },
        include: {
          catalogo: true,
        },
      })

      return itens
    } catch (err: any) {
      throw new ValidationError('Não foi possível buscar os itens', err)
    }
  }

  async deleteListaItem(id: string) {
    try {
      const listaItem = await prisma.lista_itens.findUnique({
        where: { id },
      })

      if (!listaItem) {
        throw new NotFoundError('Item não encontrado')
      }

      await prisma.lista_itens.delete({
        where: { id },
      })

      return { message: 'Item removido com sucesso' }
    } catch (err: any) {
      throw new ValidationError('Não foi possível remover o item', err)
    }
  }
}

export const listaItensService = new ListaItensService()
