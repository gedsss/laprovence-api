import { z } from 'zod'

export const CreatePremontadaItensSchema = z.object({
  premontada_id: z.uuid('ID da premontada deve ser um uuid válido'),
  catalogo_id: z.uuid('ID do catálogo deve ser um uuid válido'),
})

export type CreatePremontadaItensInput = z.infer<
  typeof CreatePremontadaItensSchema
>
