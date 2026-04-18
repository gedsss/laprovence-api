import {
  MissingFieldError,
  NotFoundError,
  ValidationError,
} from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type { CreatePremontadaItensInput } from './premontada_itens.schema.js'

export interface CreatePremontadaItensSchemaDTO
  extends CreatePremontadaItensInput {}

export class PremontadaItensService {
  async addPremontadaItem(data: CreatePremontadaItensSchemaDTO) {
    if (!data.premontada_id || !data.catalogo_id) {
      throw new MissingFieldError()
    }

    try {
      const premontadaExiste = await prisma.premontadas.findUnique({
        where: { id: data.premontada_id },
      })

      if (!premontadaExiste) {
        throw new NotFoundError('Premontada não encontrada')
      }

      const catalogoExiste = await prisma.catalogo.findUnique({
        where: { id: data.catalogo_id },
      })

      if (!catalogoExiste) {
        throw new NotFoundError('Catálogo não encontrado')
      }

      const premontadaItem = await prisma.premontada_itens.create({
        data: {
          premontada_id: data.premontada_id,
          catalogo_id: data.catalogo_id,
        },
      })

      if (!premontadaItem) {
        throw new ValidationError('Erro ao adicionar item à premontada')
      }

      return premontadaItem
    } catch (err: any) {
      throw new ValidationError('Não foi possível adicionar o item', err)
    }
  }

  async getPremontadaItensById(premontada_id: string) {
    try {
      const premontada = await prisma.premontadas.findUnique({
        where: { id: premontada_id },
      })

      if (!premontada) {
        throw new NotFoundError('Premontada não encontrada')
      }

      const itens = await prisma.premontada_itens.findMany({
        where: { premontada_id },
        include: {
          catalogo: true,
        },
      })

      return itens
    } catch (err: any) {
      throw new ValidationError('Não foi possível buscar os itens', err)
    }
  }

  async removePremontadaItem(premontada_id: string, catalogo_id: string) {
    try {
      const premontadaItem = await prisma.premontada_itens.findUnique({
        where: {
          premontada_id_catalogo_id: {
            premontada_id,
            catalogo_id,
          },
        },
      })

      if (!premontadaItem) {
        throw new NotFoundError('Item não encontrado')
      }

      await prisma.premontada_itens.delete({
        where: {
          premontada_id_catalogo_id: {
            premontada_id,
            catalogo_id,
          },
        },
      })

      return { message: 'Item removido com sucesso' }
    } catch (err: any) {
      throw new ValidationError('Não foi possível remover o item', err)
    }
  }
}

export const premontadaItensService = new PremontadaItensService()
