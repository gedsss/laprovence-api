import { z } from 'zod'

export const CreateComprasSchema = z.object({
  listas_id: z.uuid('O id da lista deve ser um uuid válido'),
  catalogo_id: z.uuid('O id do catalogo deve ser um uuid válido'),
  nome_convidado: z.string(),
  cpf: z.string().max(11, 'o cpf não pode passar de 11 caracteres'),
  telefone: z.string(),
  valor_pago: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/, {
    message: 'Formato inválido (máx 10 dígitos, 2 decimais)',
  }),
  forma_pagamento: z.string(),
  status_pagamento: z
    .enum(['Pendente', 'Aprovado', 'Rejeitado'])
    .default('Pendente'),
  is_new_gestor: z.boolean().default(true),
  is_new_noivo: z.boolean().default(false),
})

export const ComprasParamsSchema = z.object({
  id: z.uuid('O id deve ser um uuid válido'),
})

export const UpdateComprasSchema = z.object({
  nome_convidado: z.string().optional(),
  cpf: z.string().max(11, 'o cpf não pode passar de 11 caracteres').optional(),
  telefone: z.string().optional(),
  valor_pago: z
    .string()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, {
      message: 'Formato inválido (máx 10 dígitos, 2 decimais)',
    })
    .optional(),
  forma_pagamento: z.string().optional(),
  status_pagamento: z
    .enum(['Pendente', 'Aprovado', 'Rejeitado'])
    .default('Pendente')
    .optional(),
  is_new_gestor: z.boolean().default(true).optional(),
  is_new_noivo: z.boolean().default(false).optional(),
})

export type CreateComprasSchemaInput = z.infer<typeof CreateComprasSchema>
export type UpdateComprasSchemaInput = z.infer<typeof UpdateComprasSchema>
