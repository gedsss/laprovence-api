import { z } from 'zod'

export const CreateCatalogoImagesSchema = z.object({
  catalogo_id: z.uuid(),
  url: z.url('A url deve ser válida'),
  posicao: z.number(),
})

export const CatalogoImagesParamsSchema = z.object({
  id: z.uuid('O iD deve ser um uuid válido'),
})

export const UpdateCatalogoImagesSchema = z.object({
  url: z.url('A url deve ser válida').optional(),
  posicao: z.number().optional(),
})

export type CreateCatalogoImagesInput = z.infer<
  typeof CreateCatalogoImagesSchema
>

export type UpdateCatalogoImagesInput = z.infer<
  typeof UpdateCatalogoImagesSchema
>
