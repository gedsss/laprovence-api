import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreatePremontadasInput,
  UpdatePremontadasInput,
} from './premontadas.schema.js'

export interface CreatePremontadasSchemaDTO extends CreatePremontadasInput {}

export interface UpdatePremontadasSchemaDTO extends UpdatePremontadasInput {}

export class PremontadasService {
  async createPremontadas(data: CreatePremontadasSchemaDTO) {
    try {
      const premontadas = await prisma.premontadas.create({
        data: {
          nome: data.nome,
          descricao: data.descricao ?? null,
          badge: data.badge ?? null,
          popular: data.popular ?? null,
          img: data.img ?? null,
        },
      })

      return premontadas
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a lista premontada', err)
    }
  }

  async getPremontadasByID(id: string) {
    const premontadas = await prisma.premontadas.findUnique({
      where: { id },
    })

    if (!premontadas) {
      throw new NotFoundError('Erro ao encontrar a lista premontada')
    }

    return premontadas
  }

  async getPremontadas() {
    const premontadas = await prisma.premontadas.findMany()

    return premontadas
  }

  async updatePremontadas(data: UpdatePremontadasInput, id: string) {
    try {
      const premontadas = await prisma.premontadas.update({
        where: { id },
        data: {
          ...(data.nome !== undefined && { nome: data.nome }),
          ...(data.descricao !== undefined && { descricao: data.descricao }),
          ...(data.badge !== undefined && { badge: data.badge }),
          ...(data.popular !== undefined && { popular: data.popular }),
          ...(data.img !== undefined && { img: data.img }),
        },
      })
      return premontadas
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a lista premontada', err)
    }
  }

  async deletePremontadas(id: string) {
    try {
      await prisma.premontadas.delete({
        where: { id },
      })

      return { message: 'Sucesso ao deletar a lista premontada' }
    } catch (err: any) {
      throw new ValidationError('Erro ao deletar a lista premontada', err)
    }
  }
}

export const premontadaService = new PremontadasService()
