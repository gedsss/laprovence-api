import type { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from './auth.service.js'
import {
  ResetPasswordSchema,
  CreateLoginSchema,
  ForgotPasswordSchema,
} from './auth.schema.js'

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = CreateLoginSchema.parse(request.body)

    const login = await authService.login(email, password)

    return reply.status(200).send({
      message: 'Sucesso ao realizar o login',
      success: true,
      data: login,
    })
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const { email } = ForgotPasswordSchema.parse(request.body)

    const result = await authService.forgotPassword(email)

    return reply.status(200).send({
      success: true,
      message: result.message,
      ...(result.token && {
        data: {
          token: result.token, // só para teste local
        },
      }),
    })
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const { token, password } = ResetPasswordSchema.parse(request.body)

    await authService.resetPassword(token, password)

    return reply.status(200).send({
      success: true,
      message: 'Password redefinida com sucesso',
    })
  }
}

export const authController = new AuthController()
