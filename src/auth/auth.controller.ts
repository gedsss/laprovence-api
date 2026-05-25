import type { FastifyReply, FastifyRequest } from 'fastify'
import { requireActor } from '../lib/access-control.js'
import {
  CreateLoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from './auth.schema.js'
import { authService } from './auth.service.js'

const SESSION_COOKIE = 'lp_session'

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }
}

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = CreateLoginSchema.parse(request.body)

    const { token, user } = await authService.login(email, password)
    reply.setCookie(SESSION_COOKIE, token, {
      ...sessionCookieOptions(),
      maxAge: 8 * 60 * 60,
    })

    return reply.status(200).send({
      message: 'Sucesso ao realizar o login',
      success: true,
      data: { user },
    })
  }

  async session(request: FastifyRequest, reply: FastifyReply) {
    const user = await authService.getSessionUser(
      requireActor(request.actor).id
    )
    return reply.send({ success: true, data: { user } })
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie(SESSION_COOKIE, sessionCookieOptions())
    return reply.send({ success: true })
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
