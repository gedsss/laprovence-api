import { z } from 'zod'

export const CreatePremontadasSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional(),
  badge: z.string().optional(),
  popular: z.boolean().default(false).optional(),
  img: z.url('A url deve ser válida').optional(),
})

export const PremontadasParamsSchema = z.object({
  id: z.uuid('O ID deve ser um uuid válido'),
})

export const UpdatePremontadasSchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional(),
  badge: z.string().optional(),
  popular: z.boolean().default(false).optional(),
  img: z.url('A url deve ser válida').optional(),
})

export type CreatePremontadasInput = z.infer<typeof CreatePremontadasSchema>
export type UpdatePremontadasInput = z.infer<typeof UpdatePremontadasSchema>
