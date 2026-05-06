import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import { cacheDelPattern, cacheGet, cacheSet } from '../../lib/cache.js'
import type {
  CreateCatologoInput,
  GetCatalogoQueryInput,
  UpdateCatalogoInput,
} from './catalogo.schema.js'

export interface CreateCatalogoSchemaDTO extends CreateCatologoInput {}

export interface UpdateCatalogoSchemaDTO extends UpdateCatalogoInput {}

export interface GetCatalogoFilterDTO extends GetCatalogoQueryInput {}

const TTL_LIST = 300  // 5 min
const TTL_ITEM = 600  // 10 min

export class CatalogoService {
  async createCatalogo(data: CreateCatalogoSchemaDTO) {
    let catalogo
    try {
      catalogo = await prisma.catalogo.create({
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
    } catch (err: any) {
      throw new ValidationError('Erro ao criar o item', err)
    }

    cacheDelPattern('catalogo:list:*').catch(() => {})

    return catalogo
  }

  async getCatalogoByID(id: string) {
    const key = `catalogo:id:${id}`
    const cached = await cacheGet(key)
    if (cached) return cached

    const catalogo = await prisma.catalogo.findUnique({
      where: { id },
      include: { catalogo_images: true },
    })

    if (!catalogo) {
      throw new NotFoundError('Erro o encontrar o catalogo')
    }

    await cacheSet(key, catalogo, TTL_ITEM)

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

    const key = `catalogo:list:${JSON.stringify({ ...filtros, page, limit })}`
    const cached = await cacheGet(key)
    if (cached) return cached

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
        include: { catalogo_images: true },
      }),
      prisma.catalogo.count({ where }),
    ])

    const result = {
      data: catalogo,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

    await cacheSet(key, result, TTL_LIST)

    return result
  }

  async updateCatalogo(data: UpdateCatalogoSchemaDTO, id: string) {
    const catalogo = await prisma.catalogo.findUnique({
      where: { id },
    })

    if (!catalogo) {
      throw new NotFoundError('Não foi possivel encontrar o catalogo')
    }

    let item
    try {
      item = await prisma.catalogo.update({
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
    } catch (err: any) {
      throw new ValidationError('Não foi possível atualizar o item', err)
    }

    Promise.all([
      cacheDelPattern('catalogo:list:*'),
      cacheDelPattern(`catalogo:id:${id}`),
    ]).catch(() => {})

    return item
  }

  async deleteCatalogo(id: string) {
    const achar = await prisma.catalogo.findUnique({
      where: { id },
    })

    if (!achar) {
      throw new NotFoundError('Erro ao encontrar o item')
    }

    await prisma.catalogo_images.deleteMany({ where: { catalogo_id: id } })
    await prisma.lista_itens.deleteMany({ where: { catalogo_id: id } })

    await prisma.catalogo.delete({
      where: { id },
    })

    await Promise.all([
      cacheDelPattern('catalogo:list:*'),
      cacheDelPattern(`catalogo:id:${id}`),
    ])

    return { message: 'Sucesso ao deletar o item' }
  }
}

export const catalogoService = new CatalogoService()
