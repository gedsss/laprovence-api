import { prisma } from '../../prisma/prismaClient.js'
import { getOrder, type OrderResponse } from './order.js'
import {
  resolvePagBankOrderStatus,
  syncCompraStatusFromOrder,
} from './pagbank.service.js'

export async function processWebhook(payload: { id?: string; reference_id?: string }) {
  if (!payload.id) return

  let order: OrderResponse
  try {
    order = await getOrder(payload.id)
  } catch {
    return
  }

  const compraId = order.reference_id
  if (!compraId || !resolvePagBankOrderStatus(order)) return

  const compra = await prisma.compras.findUnique({ where: { id: compraId } })
  if (!compra) return

  await syncCompraStatusFromOrder(compra, order)
}
