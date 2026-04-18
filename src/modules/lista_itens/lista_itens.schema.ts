import { z } from 'zod'

export const CreateListaItensSchema = z.object({
  listas_id: z.uuid('ID da lista deve ser um uuid válido'),
  catalogo_id: z.uuid('ID do catálogo deve ser um uuid válido'),
})

export const ListaItensParamsSchema = z.object({
  id: z.uuid('ID não é um uuid válido'),
})

export const ListaItensListaParamsSchema = z.object({
  listas_id: z.uuid('ID da lista deve ser um uuid válido'),
})

export type CreateListaItensInput = z.infer<typeof CreateListaItensSchema>
