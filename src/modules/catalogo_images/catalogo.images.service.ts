import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreateCatalogoImagesInput,
  UpdateCatalogoImagesInput,
} from './catalogo.images.schema.js'

export interface CreateCatalogoImagesSchemaDTO
  extends CreateCatalogoImagesInput {}

export interface UpdateCatalogoImagesSchemaDTO
  extends UpdateCatalogoImagesInput {}

export class CatalogoImagesService {
  async createCatalogoImages(data: CreateCatalogoImagesSchemaDTO) {
    const catalogoTeste = await prisma.catalogo.findUnique({
      where: { id: data.catalogo_id },
    })

    if (!catalogoTeste) {
      throw new ValidationError('Erro ao encontrar o item da imagem')
    }
    try {
      const imagem = await prisma.catalogo_images.create({
        data: {
          catalogo_id: data.catalogo_id,
          url: data.url,
          posicao: data.posicao,
        },
      })

      return imagem
    } catch (err: any) {
      throw new ValidationError('Erro ao criar a imagem no banco de dados', err)
    }
  }

  async getCatalogoImagesByID(id: string) {
    const imagem = await prisma.catalogo_images.findUnique({
      where: { id },
    })

    if (!imagem) {
      throw new NotFoundError('Não foi possível encontrar a imagem')
    }

    return imagem
  }

  async updateCatalogoImages(id: string, data: UpdateCatalogoImagesSchemaDTO) {
    try {
      if (!(await prisma.catalogo_images.findUnique({ where: { id } }))) {
        throw new NotFoundError('Erro ao encontrar a imagem para atualizar')
      }

      const imagem = await prisma.catalogo_images.update({
        where: { id },
        data: {
          ...(data.url !== undefined && { url: data.url }),
          ...(data.posicao !== undefined && { posicao: data.posicao }),
        },
      })

      return imagem
    } catch (err: any) {
      throw new ValidationError('Não foi possível atualizar a imagem', err)
    }
  }

  async deleteCatalogoImages(id: string) {
    const imagem = await prisma.catalogo_images.findUnique({ where: { id } })

    if (!imagem) {
      throw new NotFoundError('Erro ao encontrar a imagem para deletar')
    }

    await prisma.catalogo_images.delete({ where: { id } })
  }
}

export const catalogoImagesService = new CatalogoImagesService()
