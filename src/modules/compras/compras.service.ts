import {
  MissingFieldError,
  NotFoundError,
  ValidationError,
} from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreateComprasSchemaInput,
  UpdateComprasSchemaInput,
} from './compras.schema.js'

export interface CreateComprasSchemaDTO extends CreateComprasSchemaInput {}
export interface UpdateComprasSchemaDTO extends UpdateComprasSchemaInput {}

export class ComprasService {
  async createCompras(data: CreateComprasSchemaDTO) {
    if (
      !data.catalogo_id ||
      !data.cpf ||
      !data.forma_pagamento ||
      !data.is_new_gestor ||
      !data.is_new_noivo ||
      !data.lista_id ||
      !data.nome_convidado ||
      !data.status_pagamento ||
      !data.telefone ||
      !data.valor_pago
    ) {
      throw new MissingFieldError()
    }
    const catalogo = await prisma.catalogo.findUnique({
      where: { id: data.catalogo_id },
    })

    if (!catalogo) throw new ValidationError('ID de catálogo inválida')

    const lista = await prisma.listas.findUnique({
      where: { id: data.lista_id },
    })

    if (!lista) throw new ValidationError('ID de lista inválido')

    try {
      const compras = await prisma.compras.create({
        data: {
          lista_id: data.lista_id,
          catalogo_id: data.catalogo_id,
          nome_convidade: data.nome_convidado,
          cpf: data.cpf,
          telefone: data.telefone,
          valor_pago: data.valor_pago,
          forma_pagamento: data.forma_pagamento,
          status_pagamento: data.status_pagamento,
          is_new_gestor: data.is_new_gestor,
          is_new_noivo: data.is_new_noivo,
        },
      })
      return compras
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a compra', err)
    }
  }

  async getComprasByID(id: string) {
    try {
      const compras = await prisma.compras.findUnique({
        where: { id },
      })

      if (!compras) {
        throw new NotFoundError('Não foi possivel encontrar a compra')
      }

      return compras
    } catch (err: any) {
      throw new ValidationError('Erro ao encontrar a compra', err)
    }
  }

  async getComprasByCpf(cpf: string) {
    try {
      const compras = await prisma.compras.findMany({
        where: { cpf },
      })

      if (!compras || compras.length === 0) {
        throw new NotFoundError('Nenhuma compra encontrada com este CPF')
      }

      return compras
    } catch (err: any) {
      throw new ValidationError('Erro ao encontrar a compra', err)
    }
  }

  async updateCompras(data: UpdateComprasSchemaDTO, id: string) {
    try {
      const compras = await prisma.compras.update({
        where: { id },
        data: {
          nome_convidade: data.nome_convidado,
          cpf: data.cpf,
          telefone: data.telefone,
          valor_pago: data.valor_pago,
          forma_pagamento: data.forma_pagamento,
          status_pagamento: data.status_pagamento,
          is_new_gestor: data.is_new_gestor,
          is_new_noivo: data.is_new_noivo,
        },
      })

      return compras
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a compra', err)
    }
  }

  async deleteCompras(id: string) {
    try {
      const compras = await prisma.compras.findUnique({
        where: { id },
      })

      if (!compras) {
        throw new NotFoundError('Compra não encontrada')
      }

      await prisma.compras.delete({
        where: { id },
      })

      return { message: 'Compra removida com sucesso' }
    } catch (err: any) {
      throw new ValidationError('Não foi possível remover a Compra', err)
    }
  }
}

export const comprasService = new ComprasService()
