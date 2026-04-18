import { z } from 'zod'

export const CreateListasSchema = z.object({
  codigo: z.string().max(6, 'O código não deve ter mais de 6 caracteres'),
  user_id: z.uuid(),
  nome_noivos: z.string(),
  telefone: z.string().optional(),
  data_casamento: z.date().optional(),
  foto_casal: z.url().optional(),
  mensagem_boas_vindas: z.string().optional(),
  status: z.enum(['Ativa', 'Arquivada']).default('Ativa'),
})

export const ListaParamsSchema = z.object({
  id: z.uuid('O ID deve ser um uuid válido'),
})

export const UpdateListasSchema = z.object({
  codigo: z
    .string()
    .max(6, 'O código não deve ter mais de 6 caracteres')
    .optional(),
  nome_noivos: z.string().optional(),
  telefone: z.string().optional(),
  data_casamento: z.date().optional(),
  foto_casal: z.url().optional(),
  mensagem_boas_vindas: z.string().optional(),
  status: z.enum(['Ativa', 'Arquivada']).default('Ativa').optional(),
})

export type CreateListasInput = z.infer<typeof CreateListasSchema>
export type UpdateListasInput = z.infer<typeof UpdateListasSchema>
