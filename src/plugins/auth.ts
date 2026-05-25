import type { FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '../../prisma/prismaClient.js'

export default fp(async function authPlugin(fastify) {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
        const actor = await prisma.user.findUnique({
          where: { id: request.user.sub },
          select: { id: true, role: true },
        })
        if (!actor) {
          return reply.status(401).send({
            success: false,
            message: 'Token invalido ou ausente',
          })
        }
        request.actor = actor
      } catch {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou ausente',
        })
      }
    }
  )

  fastify.decorate(
    'requireGestor',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.actor?.role !== 'gestor') {
        return reply.status(403).send({
          success: false,
          message: 'Acesso negado',
        })
      }
    }
  )

  fastify.decorate(
    'requireCsrf',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.headers['x-csrf-protection'] !== '1') {
        return reply.status(403).send({
          success: false,
          message: 'Requisicao nao autorizada',
        })
      }
    }
  )
})
