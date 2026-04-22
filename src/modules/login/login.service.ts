import { InvalidCredentialsError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type { CreateLoginInput } from './login.schema.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export interface CreateLoginSchemaDTO extends CreateLoginInput {}

export class LoginService {
  async Login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) throw new InvalidCredentialsError()

    const senhaCorreta = await bcrypt.compare(password, user.senha)

    if (!senhaCorreta) throw new InvalidCredentialsError()

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_PASS ?? '',
      {
        expiresIn: '8h',
      }
    )

    const { senha: _, ...userLogin } = user

    return {
      user: userLogin,
      token: token,
    }
  }
}

export const loginService = new LoginService()
