import type { FastifyRequest, FastifyReply } from 'fastify'
import { loginService } from './login.service.js'
import { CreateLoginSchema } from './login.schema.js'

export class LoginController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = CreateLoginSchema.parse(request.body)

    const login = await loginService.Login(email, password)

    return reply.status(200).send({
      message: 'Sucesso ao realizar o login',
      success: true,
      data: login,
    })
  }
}

export const loginController = new LoginController()
