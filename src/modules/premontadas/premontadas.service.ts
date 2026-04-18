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
          descricao: data.descricao,
          badge: data.badge,
          popular: data.popular,
          img: data.img,
        },
      })

      return premontadas
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a lista premontada', err)
    }
  }

  async getPremontadasByID(id: string) {
    try {
      const premontadas = await prisma.premontadas.findUnique({
        where: { id },
      })

      if (!premontadas) {
        throw new NotFoundError('Erro ao encontrar a lista premontada')
      }

      return premontadas
    } catch (err: any) {
      throw new ValidationError(
        'Não foi possível encontrar a lista premontada',
        err
      )
    }
  }

  async updatePremontadas(data: UpdatePremontadasInput, id: string) {
    try {
      const updateData: Partial<UpdatePremontadasInput> = {}

      if (data.nome) updateData.nome = data.nome
      if (data.descricao) updateData.descricao = data.descricao
      if (data.badge) updateData.badge = data.badge
      if (data.popular !== undefined) updateData.popular = data.popular
      if (data.img) updateData.img = data.img

      const premontadas = await prisma.premontadas.update({
        where: { id },
        data: updateData,
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
