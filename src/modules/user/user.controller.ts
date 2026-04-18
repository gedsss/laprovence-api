import type { FastifyReply, FastifyRequest } from 'fastify'
import { MissingFieldError } from '../../../errors/errors.js'
import {
  type CreateUserSchemaDTO,
  type UpdateUserSchemaDTO,
  userService,
} from './user.service.js'

export class UserController {
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as CreateUserSchemaDTO

    if (!data || Object.keys(data).length === 0) {
      throw new MissingFieldError()
    }

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
    const data = request.body as UpdateUserSchemaDTO
    const { id } = request.params as { id: string }

    const user = await userService.updateUser(data, id)

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao atualizar o usuário',
      data: user,
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
