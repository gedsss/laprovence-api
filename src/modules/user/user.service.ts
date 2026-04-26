import bcrypt from 'bcrypt'
import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type { CreateUserInput, UpdateUserInput } from './user.schema.js'

export interface CreateUserSchemaDTO extends CreateUserInput {}

export interface UpdateUserSchemaDTO extends UpdateUserInput {}

interface PrismaUniqueError {
  code: string
  meta?: { target?: string[] }
}

export class UserService {
  async createUser(data: CreateUserInput) {
    try {
      const passwordHash = await bcrypt.hash(data.password, 10)

      const user = await prisma.user.create({
        data: {
          nome_noiva: data.nome_noiva,
          nome_noivo: data.nome_noivo,
          email: data.email,
          password: passwordHash,
          data_casamento: data.data_casamento,
          telefone: data.telefone,
        },
        select: {
          nome_noiva: true,
          nome_noivo: true,
          email: true,
          data_casamento: true,
          telefone: true,
          foto_casal: true,
        },
      })

      return user
    } catch (error) {
      const err = error as PrismaUniqueError
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0]
        if (field === 'email') {
          throw new ValidationError('Email já registrado')
        }
        throw error
      }
    }
  }

  async getUserByID(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        nome_noiva: true,
        nome_noivo: true,
        email: true,
        data_casamento: true,
        telefone: true,
        foto_casal: true,
      },
    })

    if (!user) {
      throw new NotFoundError('Erro ao encontrar o usuário')
    }

    return user
  }

  async updateUser(data: UpdateUserSchemaDTO, id: string) {
    try {
      const passwordHash = data.password
        ? await bcrypt.hash(data.password, 10)
        : undefined

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(data.email !== undefined && { email: data.email }),
          ...(data.telefone !== undefined && { telefone: data.telefone }),
          ...(data.data_casamento !== undefined && {
            data_casamento: data.data_casamento,
          }),
          ...(data.foto_casal !== undefined && { foto_casal: data.foto_casal }),
          ...(passwordHash !== undefined && { password: passwordHash }),
        },
        select: {
          email: true,
          data_casamento: true,
          telefone: true,
          foto_casal: true,
        },
      })

      return user
    } catch (error) {
      const err = error as PrismaUniqueError
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0]
        if (field === 'email') {
          throw new ValidationError('Email já em uso')
        }
        throw error
      }
    }
  }

  async deleteUser(id: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { is_system: true },
    })

    if (!existingUser) {
      throw new NotFoundError('Usuário não encontrado')
    }

    if (existingUser.is_system) {
      throw new ValidationError(
        'Não é possível deletar uma conta do tipo gestor'
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return { message: 'Usuário deletado com sucesso' }
  }
}

export const userService = new UserService()
