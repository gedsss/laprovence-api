import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreateCatologoInput,
  UpdateCatalogoInput,
} from './catologo.schema.js'

export interface CreateCatalogoSchemaDTO extends CreateCatologoInput {}

export interface UpdateCatalogoSchemaDTO extends UpdateCatalogoInput {}

export class CatalogoService {
  async createCatalogo(data: CreateCatalogoSchemaDTO) {
    try {
      const catalogo = await prisma.catalogo.create({
        data: {
          nome: data.nome,
          marca: data.marca,
          tamanho: data.tamanho,
          descricao: data.descricao,
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

    return catalogo
  }

  async getCatalogoByMarca(marca: string) {
    const catalogo = await prisma.catalogo.findMany({
      where: { marca },
    })

    return catalogo
  }

  async getCatalogoByDescricao(descricao: string) {
    const catalogo = await prisma.catalogo.findMany({
      where: { descricao },
    })

    return catalogo
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
          nome: data.nome,
          marca: data.marca,
          tamanho: data.tamanho,
          descricao: data.descricao,
          preco: data.preco,
          setor: data.setor,
          estoque: data.estoque,
          quantidade: data.quantidade,
          peso: data.peso,
          status: data.status,
          version: data.version,
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
