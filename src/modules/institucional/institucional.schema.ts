import { z } from 'zod'

const optionalText = z
  .string()
  .trim()
  .transform(value => (value.length ? value : null))
  .nullable()
  .optional()

export const InstitucionalLoginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const CreateInstitucionalCategorySchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const UpdateInstitucionalCategorySchema =
  CreateInstitucionalCategorySchema.partial()

export const CreateInstitucionalStoreSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  category: z
    .union([z.uuid('Categoria inválida'), z.literal(''), z.null()])
    .optional()
    .transform(value => value || null),
  description: optionalText,
  address: optionalText,
  hours: optionalText,
  phone: optionalText,
  whatsapp: optionalText,
  email: optionalText,
  instagram: optionalText,
  website: optionalText,
  photos: z.array(z.string()).default([]),
  photo_labels: z.array(z.string()).default([]),
  highlighted: z.boolean().default(false),
  archived: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const UpdateInstitucionalStoreSchema =
  CreateInstitucionalStoreSchema.partial()

export const ReorderInstitucionalStoresSchema = z.object({
  ids: z.array(z.uuid()).min(1),
})

export const InstitucionalStoreQuerySchema = z.object({
  includeArchived: z
    .enum(['true', 'false'])
    .optional()
    .transform(value => value === 'true'),
})

export const InstitucionalUploadSchema = z.object({
  file_name: z.string().min(1).max(180),
  content_type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  data: z.string().min(1),
})

export type InstitucionalLoginInput = z.infer<
  typeof InstitucionalLoginSchema
>
export type CreateInstitucionalCategoryInput = z.infer<
  typeof CreateInstitucionalCategorySchema
>
export type UpdateInstitucionalCategoryInput = z.infer<
  typeof UpdateInstitucionalCategorySchema
>
export type CreateInstitucionalStoreInput = z.infer<
  typeof CreateInstitucionalStoreSchema
>
export type UpdateInstitucionalStoreInput = z.infer<
  typeof UpdateInstitucionalStoreSchema
>
export type ReorderInstitucionalStoresInput = z.infer<
  typeof ReorderInstitucionalStoresSchema
>
export type InstitucionalUploadInput = z.infer<typeof InstitucionalUploadSchema>
