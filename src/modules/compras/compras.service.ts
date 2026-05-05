import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreateComprasSchemaInput,
  UpdateComprasSchemaInput,
} from './compras.schema.js'

export interface CreateComprasSchemaDTO extends CreateComprasSchemaInput {}
export interface UpdateComprasSchemaDTO extends UpdateComprasSchemaInput {}

export class ComprasService {
  async createCompras(data: CreateComprasSchemaDTO) {
    if (data.catalogo_id) {
      const catalogo = await prisma.catalogo.findUnique({
        where: { id: data.catalogo_id },
      })
      if (!catalogo) throw new ValidationError('ID de catálogo inválida')
    }

    const lista = await prisma.listas.findUnique({
      where: { id: data.listas_id },
    })

    if (!lista) throw new ValidationError('ID de lista inválido')

    try {
      const compras = await prisma.compras.create({
        data: {
          listas_id: data.listas_id,
          catalogo_id: data.catalogo_id,
          nome_convidado: data.nome_convidado,
          cpf: data.cpf,
          telefone: data.telefone,
          valor_pago: data.valor_pago,
          forma_pagamento: data.forma_pagamento,
          status_pagamento: data.status_pagamento,
          is_new_gestor: data.is_new_gestor,
          is_new_noivo: data.is_new_noivo,
        },
      })

      // Reserva o estoque imediatamente ao criar a compra
      if (data.catalogo_id) {
        prisma.catalogo
          .updateMany({
            where: { id: data.catalogo_id, estoque: { gt: 0 } },
            data: { estoque: { decrement: 1 } },
          })
          .catch(() => {})
      }

      return compras
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a compra', err)
    }
  }

  async getComprasByID(id: string) {
    const compras = await prisma.compras.findUnique({
      where: { id },
    })

    if (!compras) {
      throw new NotFoundError('Não foi possivel encontrar a compra')
    }

    return compras
  }

  async getComprasByCpf(cpf: string) {
    const compras = await prisma.compras.findMany({
      where: { cpf },
    })

    if (!compras || compras.length === 0) {
      throw new NotFoundError('Nenhuma compra encontrada com este CPF')
    }

    return compras
  }

  async getComprasByLista(listas_id: string) {
    const compras = await prisma.compras.findMany({
      where: { listas_id },
    })
    return compras ?? []
  }

  async updateCompras(data: UpdateComprasSchemaDTO, id: string) {
    const compraAtual = await prisma.compras.findUnique({ where: { id } })
    if (!compraAtual) throw new NotFoundError('Compra não encontrada')

    let compras: any
    try {
      compras = await prisma.compras.update({
        where: { id },
        data: {
          ...(data.nome_convidado !== undefined && {
            nome_convidado: data.nome_convidado,
          }),
          ...(data.cpf !== undefined && { cpf: data.cpf }),
          ...(data.telefone !== undefined && { telefone: data.telefone }),
          ...(data.valor_pago !== undefined && { valor_pago: data.valor_pago }),
          ...(data.forma_pagamento !== undefined && {
            forma_pagamento: data.forma_pagamento,
          }),
          ...(data.status_pagamento !== undefined && {
            status_pagamento: data.status_pagamento,
          }),
          ...(data.is_new_gestor !== undefined && {
            is_new_gestor: data.is_new_gestor,
          }),
          ...(data.is_new_noivo !== undefined && {
            is_new_noivo: data.is_new_noivo,
          }),
        },
      })
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a compra', err)
    }

    // Devolve o estoque se a compra for rejeitada (já foi decrementado na criação)
    if (
      data.status_pagamento === 'Rejeitado' &&
      compraAtual.status_pagamento !== 'Rejeitado' &&
      compraAtual.catalogo_id
    ) {
      prisma.catalogo
        .updateMany({
          where: { id: compraAtual.catalogo_id },
          data: { estoque: { increment: 1 } },
        })
        .catch(() => {})
    }

    return compras
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
