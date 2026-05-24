import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import { cacheDel, cacheDelPattern } from '../../lib/cache.js'
import { verifyRecaptchaToken } from '../../lib/recaptcha.js'
import type {
  CreateComprasSchemaInput,
  UpdateComprasSchemaInput,
} from './compras.schema.js'

export interface CreateComprasSchemaDTO extends CreateComprasSchemaInput {}
export interface UpdateComprasSchemaDTO extends UpdateComprasSchemaInput {}

export const RESERVATION_DURATION_MS = 10 * 60 * 1000

type CompraStatus = 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado'

type ReservationTarget = {
  id: string
  listas_id: string
  catalogo_id: string | null
}

function withReservationExpiration<T extends { data_compra: Date; status_pagamento: string }>(
  compra: T
) {
  return {
    ...compra,
    reserva_expira_em:
      compra.status_pagamento === 'Pendente'
        ? new Date(compra.data_compra.getTime() + RESERVATION_DURATION_MS).toISOString()
        : null,
  }
}

async function invalidateAvailability(listasId: string, catalogoId: string | null) {
  const changes: Promise<void>[] = [cacheDel(`lista_itens:lista:${listasId}`)]
  if (catalogoId) {
    changes.push(
      cacheDelPattern(`catalogo:id:${catalogoId}`),
      cacheDelPattern('catalogo:list:*')
    )
  }
  await Promise.all(changes).catch(() => {})
}

async function transitionToUnavailableEnd(
  compra: ReservationTarget,
  fromStatuses: CompraStatus[],
  finalStatus: 'Rejeitado' | 'Cancelado'
) {
  const changed = await prisma.$transaction(async tx => {
    const updated = await tx.compras.updateMany({
      where: {
        id: compra.id,
        status_pagamento: { in: fromStatuses },
      },
      data: { status_pagamento: finalStatus },
    })

    if (updated.count > 0 && compra.catalogo_id) {
      await tx.catalogo.updateMany({
        where: { id: compra.catalogo_id },
        data: { estoque: { increment: 1 } },
      })
    }

    return updated.count > 0
  })

  if (changed) {
    await invalidateAvailability(compra.listas_id, compra.catalogo_id)
  }

  return changed
}

async function releaseExpiredReservations(
  filter: { id?: string; listas_id?: string; catalogo_id?: string } = {}
) {
  const expired = await prisma.compras.findMany({
    where: {
      ...filter,
      status_pagamento: 'Pendente',
      data_compra: {
        lte: new Date(Date.now() - RESERVATION_DURATION_MS),
      },
    },
    select: {
      id: true,
      listas_id: true,
      catalogo_id: true,
    },
  })

  await Promise.all(
    expired.map(compra =>
      transitionToUnavailableEnd(compra, ['Pendente'], 'Rejeitado')
    )
  )
}

export class ComprasService {
  async createCompras(data: CreateComprasSchemaDTO) {
    await verifyRecaptchaToken(data.recaptcha_token, [
      'checkout_start',
      'gift_confirm',
    ])

    const lista = await prisma.listas.findUnique({
      where: { id: data.listas_id },
    })
    if (!lista) throw new ValidationError('ID de lista inválido')

    if (data.catalogo_id) {
      const itemNaLista = await prisma.lista_itens.findFirst({
        where: {
          listas_id: data.listas_id,
          catalogo_id: data.catalogo_id,
        },
      })
      if (!itemNaLista) {
        throw new ValidationError('Item não pertence a esta lista')
      }

      await releaseExpiredReservations({
        listas_id: data.listas_id,
        catalogo_id: data.catalogo_id,
      })
    }

    try {
      const compra = await prisma.$transaction(async tx => {
        if (data.catalogo_id) {
          const existing = await tx.compras.findFirst({
            where: {
              listas_id: data.listas_id,
              catalogo_id: data.catalogo_id,
              status_pagamento: { in: ['Pendente', 'Aprovado'] },
            },
          })
          if (existing) {
            throw new BusinessRuleError(
              'Este item está em processamento ou já foi presenteado'
            )
          }

          const reserved = await tx.catalogo.updateMany({
            where: { id: data.catalogo_id, estoque: { gt: 0 } },
            data: { estoque: { decrement: 1 } },
          })
          if (reserved.count === 0) {
            throw new BusinessRuleError('Este item não está mais disponível')
          }
        }

        return tx.compras.create({
          data: {
            listas_id: data.listas_id,
            catalogo_id: data.catalogo_id ?? null,
            nome_convidado: data.nome_convidado,
            email: data.email ?? null,
            cpf: data.cpf,
            telefone: data.telefone,
            valor_pago: data.valor_pago,
            forma_pagamento: data.forma_pagamento,
            status_pagamento: data.status_pagamento,
            is_new_gestor: data.is_new_gestor,
            is_new_noivo: data.is_new_noivo,
          },
        })
      })

      if (data.catalogo_id) {
        await invalidateAvailability(data.listas_id, data.catalogo_id)
      }

      return withReservationExpiration(compra)
    } catch (err: any) {
      if (err instanceof BusinessRuleError || err instanceof ValidationError) {
        throw err
      }
      if (err?.code === 'P2002' && data.catalogo_id) {
        throw new BusinessRuleError(
          'Este item está em processamento ou já foi presenteado'
        )
      }
      throw new ValidationError('Erro ao criar a compra', err)
    }
  }

  async getComprasByID(id: string) {
    await releaseExpiredReservations({ id })

    const compra = await prisma.compras.findUnique({
      where: { id },
    })

    if (!compra) {
      throw new NotFoundError('Não foi possivel encontrar a compra')
    }

    return withReservationExpiration(compra)
  }

  async getComprasByCpf(cpf: string) {
    const comprasPendentes = await prisma.compras.findMany({
      where: { cpf, status_pagamento: 'Pendente' },
      select: { id: true },
    })
    await Promise.all(
      comprasPendentes.map(compra => releaseExpiredReservations({ id: compra.id }))
    )

    const compras = await prisma.compras.findMany({
      where: { cpf },
    })

    if (compras.length === 0) {
      throw new NotFoundError('Nenhuma compra encontrada com este CPF')
    }

    return compras.map(withReservationExpiration)
  }

  async getComprasByLista(listas_id: string) {
    await releaseExpiredReservations({ listas_id })

    const compras = await prisma.compras.findMany({
      where: { listas_id },
    })
    return compras.map(withReservationExpiration)
  }

  async updateCompras(data: UpdateComprasSchemaDTO, id: string) {
    const compraAtual = await prisma.compras.findUnique({ where: { id } })
    if (!compraAtual) throw new NotFoundError('Compra não encontrada')

    if (
      (compraAtual.status_pagamento === 'Cancelado' ||
        compraAtual.status_pagamento === 'Rejeitado') &&
      data.status_pagamento &&
      data.status_pagamento !== compraAtual.status_pagamento
    ) {
      throw new ValidationError('Uma tentativa encerrada não pode ter o status alterado')
    }

    const updateData = {
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
    }

    let compra
    try {
      if (data.status_pagamento === 'Cancelado') {
        compra = await prisma.$transaction(async tx => {
          const changed = await tx.compras.updateMany({
            where: {
              id,
              status_pagamento: { in: ['Pendente', 'Aprovado'] },
            },
            data: updateData,
          })

          if (changed.count > 0 && compraAtual.catalogo_id) {
            await tx.catalogo.updateMany({
              where: { id: compraAtual.catalogo_id },
              data: { estoque: { increment: 1 } },
            })
          }

          if (changed.count === 0) {
            await tx.compras.update({ where: { id }, data: updateData })
          }

          return tx.compras.findUniqueOrThrow({ where: { id } })
        })
      } else {
        compra = await prisma.compras.update({
          where: { id },
          data: updateData,
        })
      }
    } catch (err: any) {
      throw new ValidationError('Erro ao atualizar a compra', err)
    }

    if (
      data.status_pagamento === 'Cancelado' &&
      compraAtual.status_pagamento !== 'Rejeitado' &&
      compraAtual.status_pagamento !== 'Cancelado'
    ) {
      await invalidateAvailability(compraAtual.listas_id, compraAtual.catalogo_id)
    }

    return withReservationExpiration(compra)
  }

  async deleteCompras(id: string) {
    try {
      const compra = await prisma.compras.findUnique({
        where: { id },
      })

      if (!compra) {
        throw new NotFoundError('Compra não encontrada')
      }

      await prisma.$transaction(async tx => {
        await tx.compras.delete({
          where: { id },
        })

        if (
          compra.catalogo_id &&
          compra.status_pagamento !== 'Rejeitado' &&
          compra.status_pagamento !== 'Cancelado'
        ) {
          await tx.catalogo.updateMany({
            where: { id: compra.catalogo_id },
            data: { estoque: { increment: 1 } },
          })
        }
      })

      await invalidateAvailability(compra.listas_id, compra.catalogo_id)

      return { message: 'Compra removida com sucesso' }
    } catch (err: any) {
      if (err instanceof NotFoundError) throw err
      throw new ValidationError('Não foi possível remover a Compra', err)
    }
  }
}

export const comprasService = new ComprasService()
