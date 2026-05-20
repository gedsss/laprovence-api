import { prisma } from '../../prisma/prismaClient.js'
import { getOrder, type OrderResponse } from './order.js'

const STATUS_MAP: Record<string, 'Pendente' | 'Aprovado' | 'Rejeitado'> = {
  PAID: 'Aprovado',
  AUTHORIZED: 'Aprovado',
  DECLINED: 'Rejeitado',
  CANCELED: 'Rejeitado',
  WAITING: 'Pendente',
  IN_ANALYSIS: 'Pendente',
}

export async function processWebhook(payload: { id: string; reference_id?: string }) {
  let order: OrderResponse
  try {
    order = await getOrder(payload.id)
  } catch {
    return
  }

  const compraId = order.reference_id
  if (!compraId) return

  const charge = order.charges?.[0]
  if (!charge) return

  const novoStatus = STATUS_MAP[charge.status]
  if (!novoStatus) return

  const compra = await prisma.compras.findUnique({ where: { id: compraId } })
  if (!compra) return

  if (compra.status_pagamento === novoStatus) return

  await prisma.compras.update({
    where: { id: compraId },
    data: { status_pagamento: novoStatus },
  })

  if (
    novoStatus === 'Rejeitado' &&
    compra.status_pagamento !== 'Rejeitado' &&
    compra.catalogo_id
  ) {
    prisma.catalogo
      .updateMany({
        where: { id: compra.catalogo_id },
        data: { estoque: { increment: 1 } },
      })
      .catch(() => {})
  }
}
