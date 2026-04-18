import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type { CreateListasInput, UpdateListasInput } from './listas.schema.js'

export interface CreateListasSchemaDTO extends CreateListasInput {}

export interface UpdateListasSchemaDTO extends UpdateListasInput {}

export class ListasService {
  async createListas(data: CreateListasSchemaDTO) {
    try {
      const lista = await prisma.listas.create({
        data: {
          codigo: data.codigo,
          nome_noivos: data.nome_noivos,
          status: data.status,
          user_id: data.user_id,
          telefone: data.telefone,
          data_casamento: data.data_casamento,
          mensagem_boas_vindas: data.mensagem_boas_vindas,
          foto_casal: data.foto_casal,
        },
      })

      return lista
    } catch (err: any) {
      throw new ValidationError('Não foi possível criar a lista', err)
    }
  }

  async getListasByID(id: string) {
    try {
      const lista = await prisma.listas.findUnique({
        where: { id },
      })

      if (!lista) {
        throw new NotFoundError('Erro ao encontrar a lista')
      }

      return lista
    } catch (err: any) {
      throw new ValidationError('Não foi possível encontrar a lista', err)
    }
  }

  async updateListasById(id: string, data: UpdateListasSchemaDTO) {
    try {
      const lista = await prisma.listas.update({
        where: { id },
        data: {
          codigo: data.codigo,
          nome_noivos: data.nome_noivos,
          status: data.status,
          telefone: data.telefone,
          data_casamento: data.data_casamento,
          mensagem_boas_vindas: data.mensagem_boas_vindas,
          foto_casal: data.foto_casal,
        },
      })

      return lista
    } catch (err: any) {
      throw new ValidationError('Não foi possível atualizar a lista', err)
    }
  }

  async deleteListas(id: string) {
    try {
      await prisma.listas.delete({
        where: { id },
      })

      return { message: 'Sucesso ao deletar a lista' }
    } catch (err: any) {
      throw new ValidationError('Não foi possível deletar a lista', err)
    }
  }
}

export const listasService = new ListasService()
