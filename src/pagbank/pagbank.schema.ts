import { z } from 'zod'

export const CreatePixOrderSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID valido'),
  recaptcha_token: z.string().min(1).optional(),
})

export const CreateCreditCardOrderSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID valido'),
  installments: z.number().int().min(1).max(3).default(1),
  card_holder_name: z.string().min(1, 'O nome do titular e obrigatorio'),
  card_encrypted: z.string().min(1, 'O cartao criptografado e obrigatorio'),
  authentication_id: z
    .string()
    .trim()
    .min(1, 'A autenticacao 3DS e obrigatoria')
    .max(200)
    .optional(),
  recaptcha_token: z.string().min(1).optional(),
})

export const CreateThreeDsSessionSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID valido'),
  recaptcha_token: z.string().min(1).optional(),
})

export const GetOrderStatusSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID valido'),
})

export const CancelOrderSchema = z.object({
  compra_id: z.uuid('O id da compra deve ser um UUID valido'),
})

export type CreatePixOrderInput = z.infer<typeof CreatePixOrderSchema>
export type CreateCreditCardOrderInput = z.infer<
  typeof CreateCreditCardOrderSchema
>
export type CreateThreeDsSessionInput = z.infer<
  typeof CreateThreeDsSessionSchema
>
export type GetOrderStatusInput = z.infer<typeof GetOrderStatusSchema>
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>
