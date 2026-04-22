import { z } from 'zod'
import { Setor, StatusCatalogo } from '../../../generated/prisma/enums'

export const CreateCatalogoSchema = z.object({
  nome: z.string(),
  marca: z.string().optional(),
  tamanho: z.string().optional(),
  descricao: z.string().optional(),
  preco: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/, 'Valor inválido'),
  setor: z.enum([
    'Mesa_posta',
    'Prataria',
    'Adornos',
    'Aromas',
    'Mobiliario',
    'Vasos',
    'Complementos',
  ]),
  estoque: z.number().default(0),
  quantidade: z.number().default(1),
  peso: z.string().regex(/^\d{1,4}(\.\d{1,2})?$/, 'Valor inválido'),
  status: z.enum(['Ativo', 'Inativo']).default('Ativo'),
  version: z.number().default(1),
})

export const CatalogoParamsSchema = z.object({
  id: z.uuid('ID não é um uuid válido'),
})

export const UpdateCatalogoSchema = z.object({
  nome: z.string().optional(),
  marca: z.string().optional(),
  tamanho: z.string().optional(),
  descricao: z.string().optional(),
  preco: z
    .string()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, 'Valor inválido')
    .optional(),
  setor: z
    .enum([
      'Mesa_posta',
      'Prataria',
      'Adornos',
      'Aromas',
      'Mobiliario',
      'Vasos',
      'Complementos',
    ])
    .optional(),
  estoque: z.number().default(0).optional(),
  quantidade: z.number().default(1).optional(),
  peso: z
    .string()
    .regex(/^\d{1,4}(\.\d{1,2})?$/, 'Valor inválido')
    .optional(),
  status: z.enum(['Ativo', 'Inativo']).default('Ativo').optional(),
  version: z.number().default(1).optional(),
})

export const GetCatalogoQuerySchema = z.object({
  setor: z.nativeEnum(Setor).optional(),
  status: z.nativeEnum(StatusCatalogo).optional(),
  nome: z.string().optional(),
  descricao: z.string().optional(),
  marca: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export type GetCatalogoQueryInput = z.infer<typeof GetCatalogoQuerySchema>
export type CreateCatologoInput = z.infer<typeof CreateCatalogoSchema>
export type UpdateCatalogoInput = z.infer<typeof UpdateCatalogoSchema>
