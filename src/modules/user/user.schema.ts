import { z } from 'zod'

export const CreateUserSchema = z.object({
  nome_noiva: z.string().max(50, 'O nome deve ter no máximo 50 caracteres'),
  nome_noivo: z.string().max(50, 'O nome deve ter no máximo 50 caracteres'),
  email: z.email('O email não é válido'),
  telefone: z.string().max(16, 'Não é um número de telefone válido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  data_casamento: z.coerce.date(),
  foto_casal: z.url().optional().nullable(),
  role: z.enum(['noivo', 'gestor']).default('noivo'),
  reset_password_token: z.string().optional(),
  reset_password_expire: z.coerce.date().optional(),
})

export const UpdateUserSchema = z.object({
  email: z.email().optional(),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .optional(),
  telefone: z.string().max(16, 'Não é um número válido').optional(),
  data_casamento: z.coerce.date().optional(),
  foto_casal: z.url().optional().nullable(),
  reset_password_token: z.string().optional(),
  reset_password_expire: z.coerce.date().optional(),
})

export const UserParamsSchema = z.object({
  id: z.uuid('ID não é um uuid válido'),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
