import type { FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '../../prisma/prismaClient.js'

const INSTITUCIONAL_SESSION_COOKIE = 'lp_institucional_session'

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
            message: 'Token inválido ou ausente',
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
    'authenticateInstitucionalAdmin',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authorization = request.headers.authorization
        const bearerToken =
          authorization?.startsWith('Bearer ') === true
            ? authorization.slice('Bearer '.length)
            : undefined
        const token =
          request.cookies[INSTITUCIONAL_SESSION_COOKIE] || bearerToken

        if (!token) {
          return reply.status(401).send({
            success: false,
            message: 'Token inválido ou ausente',
          })
        }

        const payload = fastify.jwt.verify(token) as {
          sub?: string
          scope?: string
        }

        if (!payload.sub || payload.scope !== 'institucional_admin') {
          return reply.status(401).send({
            success: false,
            message: 'Token inválido ou ausente',
          })
        }

        const admin = await prisma.institucional_admin_user.findFirst({
          where: { id: payload.sub, active: true },
          select: { id: true, email: true },
        })

        if (!admin) {
          return reply.status(401).send({
            success: false,
            message: 'Token inválido ou ausente',
          })
        }

        request.institucionalAdmin = admin
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
          message: 'Requisição não autorizada',
        })
      }
    }
  )
})
