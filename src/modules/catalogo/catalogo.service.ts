import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreateCatologoInput,
  GetCatalogoQueryInput,
  UpdateCatalogoInput,
} from './catalogo.schema.js'

export interface CreateCatalogoSchemaDTO extends CreateCatologoInput {}

export interface UpdateCatalogoSchemaDTO extends UpdateCatalogoInput {}

export interface GetCatalogoFilterDTO extends GetCatalogoQueryInput {}

export class CatalogoService {
  async createCatalogo(data: CreateCatalogoSchemaDTO) {
    try {
      const catalogo = await prisma.catalogo.create({
        data: {
          nome: data.nome,
          marca: data.marca ?? null,
          tamanho: data.tamanho ?? null,
          descricao: data.descricao ?? null,
          preco: data.preco,
          setor: data.setor,
          estoque: data.estoque,
          quantidade: data.quantidade,
          peso: data.peso,
          status: data.status,
          version: data.version,
        },
      })

      if (!catalogo) {
        throw new ValidationError('Erro ao criar o item no catalogo')
      }

      return catalogo
    } catch (err: any) {
      throw new ValidationError('Erro ao criar o item', err)
    }
  }

  async getCatalogoByID(id: string) {
    const catalogo = await prisma.catalogo.findUnique({
      where: { id },
    })

    if (!catalogo) {
      throw new NotFoundError('Erro o encontrar o catalogo')
    }

    return catalogo
  }

  async getCatalogoByNome(nome: string) {
    const catalogo = await prisma.catalogo.findFirst({
      where: { nome },
    })

    if (!catalogo) {
      throw new NotFoundError('Erro o encontrar o catalogo')
    }

    return catalogo
  }

  async getCatalogoByMarca(marca: string) {
    const catalogo = await prisma.catalogo.findMany({
      where: { marca },
    })

    if (!catalogo) {
      throw new NotFoundError('Erro o encontrar o catalogo')
    }

    return catalogo
  }

  async getCatalogoByDescricao(descricao: string) {
    const catalogo = await prisma.catalogo.findMany({
      where: { descricao },
    })

    if (!catalogo) {
      throw new NotFoundError('Erro o encontrar o catalogo')
    }

    return catalogo
  }

  async getCatalogo(filtros: GetCatalogoFilterDTO) {
    const page = filtros.page ?? 1
    const limit = filtros.limit ?? 10

    const skip = (page - 1) * limit

    const where = {
      ...(filtros.setor && { setor: filtros.setor }),
      ...(filtros.status && { status: filtros.status }),
      ...(filtros.nome && {
        nome: {
          contains: filtros.nome,
          mode: 'insensitive' as const,
        },
      }),
      ...(filtros.marca && {
        marca: {
          contains: filtros.marca,
          mode: 'insensitive' as const,
        },
      }),
      ...(filtros.descricao && {
        descricao: {
          contains: filtros.descricao,
          mode: 'insensitive' as const,
        },
      }),
    }

    const [catalogo, total] = await Promise.all([
      prisma.catalogo.findMany({
        where,
        skip,
        take: limit,
      }),
      prisma.catalogo.count({ where }),
    ])

    return {
      data: catalogo,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async updateCatalogo(data: UpdateCatalogoSchemaDTO, id: string) {
    const catalogo = await prisma.catalogo.findUnique({
      where: { id },
    })

    if (!catalogo) {
      throw new NotFoundError('Não foi possivel encontrar o catalogo')
    }

    try {
      const item = await prisma.catalogo.update({
        where: { id },
        data: {
          ...(data.nome !== undefined && { nome: data.nome }),
          ...(data.marca !== undefined && { marca: data.marca }),
          ...(data.tamanho !== undefined && { tamanho: data.tamanho }),
          ...(data.descricao !== undefined && { descricao: data.descricao }),
          ...(data.preco !== undefined && { preco: data.preco }),
          ...(data.setor !== undefined && { setor: data.setor }),
          ...(data.estoque !== undefined && { estoque: data.estoque }),
          ...(data.quantidade !== undefined && { quantidade: data.quantidade }),
          ...(data.peso !== undefined && { peso: data.peso }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.version !== undefined && { version: data.version }),
        },
      })

      if (!item) {
        throw new ValidationError('Erro ao atualizar o item')
      }

      return item
    } catch (err: any) {
      throw new ValidationError('Não foi possível atualizar o item', err)
    }
  }

  async deleteCatalogo(id: string) {
    const achar = await prisma.catalogo.findUnique({
      where: { id },
    })

    if (!achar) {
      throw new NotFoundError('Erro ao encontrar o item')
    }

    await prisma.catalogo.delete({
      where: { id },
    })

    return { message: 'Sucesso ao deletar o item' }
  }
}

export const catalogoService = new CatalogoService()
