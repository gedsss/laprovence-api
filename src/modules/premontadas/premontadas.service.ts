import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import { cacheDel, cacheDelPattern, cacheGet, cacheSet } from '../../lib/cache.js'
import type {
  CreatePremontadasInput,
  UpdatePremontadasInput,
} from './premontadas.schema.js'

export interface CreatePremontadasSchemaDTO extends CreatePremontadasInput {}

export interface UpdatePremontadasSchemaDTO extends UpdatePremontadasInput {}

const TTL = 600 // 10 min
// v2: cache keys include premontada_itens relation
const LIST_KEY = 'premontadas:v2:list'
const idKey = (id: string) => `premontadas:v2:id:${id}`

export class PremontadasService {
  async createPremontadas(data: CreatePremontadasSchemaDTO) {
    let premontadas
    try {
      premontadas = await prisma.premontadas.create({
        data: {
          nome: data.nome,
          descricao: data.descricao ?? null,
          badge: data.badge ?? null,
          popular: data.popular ?? null,
          img: data.img ?? null,
        },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a lista premontada', err)
    }

    cacheDel(LIST_KEY).catch(() => {})
    return premontadas
  }

  async getPremontadasByID(id: string) {
    const key = idKey(id)
    const cached = await cacheGet(key)
    if (cached) return cached

    const premontadas = await prisma.premontadas.findUnique({
      where: { id },
      include: { premontada_itens: true },
    })

    if (!premontadas) {
      throw new NotFoundError('Erro ao encontrar a lista premontada')
    }

    await cacheSet(key, premontadas, TTL)

    return premontadas
  }

  async getPremontadas() {
    const cached = await cacheGet(LIST_KEY)
    if (cached) return cached

    const premontadas = await prisma.premontadas.findMany({
      include: { premontada_itens: true },
    })

    await cacheSet(LIST_KEY, premontadas, TTL)

    return premontadas
  }

  async updatePremontadas(data: UpdatePremontadasInput, id: string) {
    let premontadas
    try {
      premontadas = await prisma.premontadas.update({
        where: { id },
        data: {
          ...(data.nome !== undefined && { nome: data.nome }),
          ...(data.descricao !== undefined && { descricao: data.descricao }),
          ...(data.badge !== undefined && { badge: data.badge }),
          ...(data.popular !== undefined && { popular: data.popular }),
          ...(data.img !== undefined && { img: data.img }),
        },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a lista premontada', err)
    }

    Promise.all([
      cacheDel(LIST_KEY),
      cacheDelPattern(`premontadas:v2:id:${id}`),
    ]).catch(() => {})

    return premontadas
  }

  async deletePremontadas(id: string) {
    try {
      await prisma.premontadas.delete({
        where: { id },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao deletar a lista premontada', err)
    }

    Promise.all([
      cacheDel(LIST_KEY),
      cacheDelPattern(`premontadas:v2:id:${id}`),
    ]).catch(() => {})

    return { message: 'Sucesso ao deletar a lista premontada' }
  }
}

export const premontadaService = new PremontadasService()
