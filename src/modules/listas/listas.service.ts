import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import { cacheDel, cacheGet, cacheSet } from '../../lib/cache.js'
import type { CreateListasInput, UpdateListasInput } from './listas.schema.js'

export interface CreateListasSchemaDTO extends CreateListasInput {}

export interface UpdateListasSchemaDTO extends UpdateListasInput {}

const TTL = 120 // 2 min

export class ListasService {
  private generateCodigo(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async createListas(data: CreateListasSchemaDTO) {
    const codigo = data.codigo ?? this.generateCodigo()
    try {
      const lista = await prisma.listas.create({
        data: {
          codigo,
          nome_noivos: data.nome_noivos,
          status: data.status ?? 'Ativa',
          user_id: data.user_id,
          ...(data.telefone !== undefined && { telefone: data.telefone }),
          ...(data.data_casamento !== undefined && {
            data_casamento: data.data_casamento,
          }),
          ...(data.mensagem_boas_vindas !== undefined && {
            mensagem_boas_vindas: data.mensagem_boas_vindas,
          }),
          ...(data.foto_casal !== undefined && { foto_casal: data.foto_casal }),
        },
      })

      return lista
    } catch (err: any) {
      throw new ValidationError('Não foi possível criar a lista', err)
    }
  }

  async getListasByID(id: string) {
    const lista = await prisma.listas.findUnique({
      where: { id },
    })

    if (!lista) {
      throw new NotFoundError('Erro ao encontrar a lista')
    }

    return lista
  }

  async getListaByCodigo(codigo: string) {
    const key = `listas:codigo:${codigo}`
    const cached = await cacheGet(key)
    if (cached) return cached

    const lista = await prisma.listas.findUnique({
      where: { codigo },
    })

    if (!lista) throw new NotFoundError('Erro ao encontrar a lista')

    await cacheSet(key, lista, TTL)

    return lista
  }

  async getListaByNoivo(user_id: string) {
    let lista = await prisma.listas.findFirst({
      where: { user_id },
    })

    if (!lista) {
      const user = await prisma.user.findUnique({ where: { id: user_id } })
      if (!user) throw new NotFoundError('Usuário não encontrado')

      lista = await prisma.listas.create({
        data: {
          codigo: this.generateCodigo(),
          user_id,
          nome_noivos: `${user.nome_noiva} & ${user.nome_noivo}`,
          telefone: user.telefone,
          data_casamento: user.data_casamento,
          status: 'Ativa',
        },
      })
    }

    return lista
  }

  async getListas() {
    const lista = await prisma.listas.findMany({
      include: {
        lista_itens: true,
        user: {
          select: {
            id: true,
            nome_noiva: true,
            nome_noivo: true,
            email: true,
            telefone: true,
            data_casamento: true,
          },
        },
      },
    })

    if (!lista) throw new NotFoundError('Erro ao encontrar as listas')

    return lista
  }

  async updateListasById(id: string, data: UpdateListasSchemaDTO) {
    const existing = await prisma.listas.findUnique({ where: { id } })

    try {
      const lista = await prisma.listas.update({
        where: { id },
        data: {
          ...(data.codigo !== undefined && { codigo: data.codigo }),
          ...(data.nome_noivos !== undefined && {
            nome_noivos: data.nome_noivos,
          }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.telefone !== undefined && { telefone: data.telefone }),
          ...(data.data_casamento !== undefined && {
            data_casamento: data.data_casamento,
          }),
          ...(data.mensagem_boas_vindas !== undefined && {
            mensagem_boas_vindas: data.mensagem_boas_vindas,
          }),
          ...(data.foto_casal !== undefined && { foto_casal: data.foto_casal }),
        },
      })

      if (existing?.codigo) {
        await cacheDel(`listas:codigo:${existing.codigo}`)
      }

      return lista
    } catch (err: any) {
      throw new ValidationError('Não foi possível atualizar a lista', err)
    }
  }

  async deleteListas(id: string) {
    const existing = await prisma.listas.findUnique({ where: { id } })

    try {
      await prisma.listas.delete({
        where: { id },
      })

      if (existing?.codigo) {
        await cacheDel(`listas:codigo:${existing.codigo}`)
      }

      return { message: 'Sucesso ao deletar a lista' }
    } catch (err: any) {
      throw new ValidationError('Não foi possível deletar a lista', err)
    }
  }
}

export const listasService = new ListasService()
