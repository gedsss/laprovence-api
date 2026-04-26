import {
  InvalidCredentialsError,
  NotFoundError,
  ValidationError,
} from '../../errors/errors.js'
import { prisma } from '../../prisma/prismaClient.js'
import type { CreateLoginInput } from './auth.schema.js'
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export interface CreateLoginSchemaDTO extends CreateLoginInput {}

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) throw new InvalidCredentialsError()

    const passwordCorreta = await bcrypt.compare(password, user.password)

    if (!passwordCorreta) throw new InvalidCredentialsError()

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_PASS ?? '',
      {
        expiresIn: '8h',
      }
    )

    const { password: _, ...userLogin } = user

    return {
      user: userLogin,
      token: token,
    }
  }

  async forgotPassword(email: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    // resposta genérica por segurança
    if (!existingUser) {
      return {
        message: 'Se o email existir, um link de recuperação foi enviado',
      }
    }

    const rawToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    const expires = new Date(Date.now() + 1000 * 60 * 15) // 15 min

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        reset_password_token: hashedToken,
        reset_password_expire: expires,
      },
    })

    return {
      message: 'Se o email existir, um link de recuperação foi enviado',
      token: rawToken, // só para teste local
    }
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const existingUser = await prisma.user.findFirst({
      where: {
        reset_password_token: hashedToken,
      },
    })

    if (!existingUser) {
      throw new NotFoundError('Token inválido')
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
        'A nova password não pode ser a mesma que a atual'
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: passwordHash,
        reset_password_token: null,
        reset_password_expire: null,
      },
    })

    return user
  }
}

export const authService = new AuthService()
