import type { FastifyRequest, FastifyReply } from 'fastify'
import { loginService, type CreateLoginSchemaDTO } from './login.service.js'

export class LoginController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as CreateLoginSchemaDTO

    const login = await loginService.Login(email, password)

    return reply.status(200).send({
      message: 'Sucesso ao realizar o login',
      success: true,
      data: login,
    })
  }
}

export const loginController = new LoginController()
