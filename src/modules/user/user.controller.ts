import type { FastifyReply, FastifyRequest } from 'fastify'
import { userService } from './user.service.js'
import {
  ChangePasswordSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from './user.schema.js'

export class UserController {
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const data = CreateUserSchema.parse(request.body)

    const user = await userService.createUser(data)

    return reply.status(201).send({
      success: true,
      message: 'Sucesso ao criar o usuário',
      data: user,
    })
  }

  async getUserByID(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const user = await userService.getUserByID(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao encontrar o usuário',
      data: user,
    })
  }

  async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const data = UpdateUserSchema.parse(request.body)
    const { id } = request.params as { id: string }

    const user = await userService.updateUser(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao atualizar o usuário',
      data: user,
    })
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const userID = request.user.sub
    const { password } = ChangePasswordSchema.parse(request.body)

    const passwordChanged = await userService.changePassword(userID, password)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao redefinir a senha',
      data: passwordChanged,
    })
  }

  async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    await userService.deleteUser(id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao deletar o usuário',
    })
  }
}

export const userController = new UserController()
