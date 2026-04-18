import type { FastifyInstance } from 'fastify'
import { userController } from './user.controller.js'

export async function userRoutes(app: FastifyInstance) {

  app.post('/users', async (request, reply) => {
    return userController.createUser(request, reply)
  })

  app.get('/users/:id', async (request, reply) => {
    return userController.getUserByID(request, reply)
  })

  app.put('/users/:id', async (request, reply) => {
    return userController.updateUser(request, reply)
  })

  app.delete('/users/:id', async (request, reply) => {
    return userController.deleteUser(request, reply)
  })
}
