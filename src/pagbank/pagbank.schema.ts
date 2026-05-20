import { z } from 'zod'

export const CreatePixOrderSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID válido'),
  email: z.email('E-mail inválido'),
})

export const CreateCreditCardOrderSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID válido'),
  email: z.email('E-mail inválido'),
  installments: z.number().int().min(1).max(12).default(1),
  card_encrypted: z.string().min(1, 'O cartão criptografado é obrigatório'),
  card_holder_name: z.string().min(1, 'O nome do titular é obrigatório'),
})

export type CreatePixOrderInput = z.infer<typeof CreatePixOrderSchema>
export type CreateCreditCardOrderInput = z.infer<typeof CreateCreditCardOrderSchema>
