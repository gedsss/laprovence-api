import { ForbiddenError, NotFoundError } from '../../errors/errors.js'
import { prisma } from '../../prisma/prismaClient.js'

export type RequestActor = {
  id: string
  role: 'gestor' | 'noivo'
}

export function requireActor(actor: RequestActor | undefined) {
  if (!actor) throw new ForbiddenError()
  return actor
}

export function requireSelfOrGestor(actor: RequestActor, userId: string) {
  if (actor.role !== 'gestor' && actor.id !== userId) {
    throw new ForbiddenError()
  }
}

export async function requireListOwnerOrGestor(
  actor: RequestActor,
  listaId: string
) {
  const lista = await prisma.listas.findUnique({
    where: { id: listaId },
    select: { user_id: true },
  })

  if (!lista) throw new NotFoundError('Lista')
  requireSelfOrGestor(actor, lista.user_id)
}

export async function requireCompraOwnerOrGestor(
  actor: RequestActor,
  compraId: string
) {
  const compra = await prisma.compras.findUnique({
    where: { id: compraId },
    select: { listas: { select: { user_id: true } } },
  })

  if (!compra) throw new NotFoundError('Compra')
  requireSelfOrGestor(actor, compra.listas.user_id)
}
