import { AppError } from '../../../errors/appError.js'
import {
  MissingFieldError,
  NotFoundError,
  ValidationError,
} from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import {
  type RequestActor,
  requireListOwnerOrGestor,
} from '../../lib/access-control.js'
import { cacheDel, cacheGet, cacheSet } from '../../lib/cache.js'
import type { CreateListaItensInput } from './lista_itens.schema.js'

export interface CreateListaItensSchemaDTO extends CreateListaItensInput {}

const TTL = 120 // 2 min

export class ListaItensService {
  async createListaItem(data: CreateListaItensSchemaDTO) {
    if (!data.listas_id || !data.catalogo_id) {
      throw new MissingFieldError()
    }

    const listaExiste = await prisma.listas.findUnique({
      where: { id: data.listas_id },
    })
    if (!listaExiste) throw new NotFoundError('Lista não encontrada')

    const catalogoExiste = await prisma.catalogo.findUnique({
      where: { id: data.catalogo_id },
    })
    if (!catalogoExiste) throw new NotFoundError('Catálogo não encontrado')

    try {
      const listaItem = await prisma.lista_itens.create({
        data: {
          listas_id: data.listas_id,
          catalogo_id: data.catalogo_id,
        },
      })

      // Invalida cache sem propagar falhas do serviço de cache
      cacheDel(`lista_itens:lista:${data.listas_id}`).catch(() => {})
      return listaItem
    } catch {
      throw new ValidationError('Não foi possível adicionar o item')
    }
  }

  async getListaItensById(listas_id: string) {
    const key = `lista_itens:lista:${listas_id}`
    const cached = await cacheGet(key)
    if (cached) return cached

    const lista = await prisma.listas.findUnique({
      where: { id: listas_id },
    })

    if (!lista) {
      throw new NotFoundError('Lista não encontrada')
    }

    const itens = await prisma.lista_itens.findMany({
      where: { listas_id },
      include: {
        catalogo: {
          include: { catalogo_images: true },
        },
      },
    })

    await cacheSet(key, itens, TTL)

    return itens
  }

  async deleteListaItem(id: string, actor: RequestActor) {
    try {
      const listaItem = await prisma.lista_itens.findUnique({
        where: { id },
      })

      if (!listaItem) {
        throw new NotFoundError('Item não encontrado')
      }

      await requireListOwnerOrGestor(actor, listaItem.listas_id)

      await prisma.lista_itens.delete({
        where: { id },
      })

      await cacheDel(`lista_itens:lista:${listaItem.listas_id}`)

      return { message: 'Item removido com sucesso' }
    } catch (err: unknown) {
      if (err instanceof AppError) throw err
      throw new ValidationError('Não foi possível remover o item')
    }
  }
}

export const listaItensService = new ListaItensService()
