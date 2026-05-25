import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  InvalidCredentialsError,
  NotFoundError,
  ValidationError,
} from '../../errors/errors.js'
import { prisma } from '../../prisma/prismaClient.js'
import type { CreateLoginInput } from './auth.schema.js'

export interface CreateLoginSchemaDTO extends CreateLoginInput {}

const PASSWORD_RESET_MESSAGE =
  'Se o email existir, um link de recuperacao foi enviado'

export class AuthService {
  async getSessionUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome_noiva: true,
        nome_noivo: true,
        email: true,
        telefone: true,
        data_casamento: true,
        foto_casal: true,
        role: true,
      },
    })

    if (!user) throw new InvalidCredentialsError()
    return user
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nome_noiva: true,
        nome_noivo: true,
        email: true,
        telefone: true,
        data_casamento: true,
        foto_casal: true,
        role: true,
        password: true,
      },
    })

    if (!user) throw new InvalidCredentialsError()

    const passwordCorreta = await bcrypt.compare(password, user.password)

    if (!passwordCorreta) throw new InvalidCredentialsError()

    const secret = process.env.JWT_PASS
    if (!secret) throw new Error('JWT_PASS nao configurado')

    const token = jwt.sign({ sub: user.id, role: user.role }, secret, {
      expiresIn: '8h',
    })

    const { password: _, ...userLogin } = user

    return {
      user: userLogin,
      token,
    }
  }

  async forgotPassword(email: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    // Resposta generica para evitar enumeracao de contas.
    if (!existingUser) {
      return {
        message: PASSWORD_RESET_MESSAGE,
      }
    }

    const rawToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expires = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        reset_password_token: hashedToken,
        reset_password_expire: expires,
      },
    })

    const response: { message: string; token?: string } = {
      message: PASSWORD_RESET_MESSAGE,
    }

    if (
      process.env.ALLOW_PASSWORD_RESET_TOKEN_RESPONSE === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      response.token = rawToken
    }

    return response
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const existingUser = await prisma.user.findFirst({
      where: {
        reset_password_token: hashedToken,
      },
      select: {
        id: true,
        password: true,
        reset_password_expire: true,
      },
    })

    if (!existingUser) {
      throw new NotFoundError('Token invalido')
    }

    if (
      !existingUser.reset_password_expire ||
      existingUser.reset_password_expire < new Date()
    ) {
      throw new ValidationError('Token expirado')
    }

    const passwordDuplicate = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (passwordDuplicate) {
      throw new ValidationError(
        'A nova password nao pode ser a mesma que a atual'
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: passwordHash,
        reset_password_token: null,
        reset_password_expire: null,
      },
    })
  }
}

export const authService = new AuthService()
