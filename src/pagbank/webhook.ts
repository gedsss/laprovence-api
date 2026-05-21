import { prisma } from '../../prisma/prismaClient.js'
import { getOrder, type OrderResponse } from './order.js'

const STATUS_MAP: Record<string, 'Pendente' | 'Aprovado' | 'Rejeitado'> = {
  PAID: 'Aprovado',
  AUTHORIZED: 'Aprovado',
  DECLINED: 'Rejeitado',
  CANCELED: 'Rejeitado',
  EXPIRED: 'Rejeitado',
  WAITING: 'Pendente',
  IN_ANALYSIS: 'Pendente',
}

function resolveStatus(order: OrderResponse): string | undefined {
  // Pedidos com cartão de crédito têm charges
  const chargeStatus = order.charges?.[0]?.status
  if (chargeStatus) return chargeStatus
  // Pedidos PIX têm qr_codes
  return order.qr_codes?.[0]?.status
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

  const rawStatus = resolveStatus(order)
  if (!rawStatus) return

  const novoStatus = STATUS_MAP[rawStatus]
  if (!novoStatus) return

  const compra = await prisma.compras.findUnique({ where: { id: compraId } })
  if (!compra) return

  if (compra.status_pagamento === novoStatus) return
  if (compra.status_pagamento === 'Aprovado' && novoStatus !== 'Aprovado') return

  const updated = await prisma.compras.updateMany({
    where: { id: compraId, status_pagamento: { not: novoStatus } },
    data: { status_pagamento: novoStatus },
  })

  if (
    updated.count > 0 &&
    novoStatus === 'Rejeitado' &&
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
