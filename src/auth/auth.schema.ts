import { z } from 'zod'

export const CreateLoginSchema = z.object({
  email: z.email('O email deve ser válido'),
  password: z.string().min(1, 'A password é obrigatória'),
})

export const ForgotPasswordSchema = z.object({
  email: z.email('Email inválido'),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'A password deve ter no mínimo 6 caracteres'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
export type CreateLoginInput = z.infer<typeof CreateLoginSchema>
