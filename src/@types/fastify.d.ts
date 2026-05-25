import 'fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RequestActor } from '../lib/access-control.js'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
    requireGestor: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
    requireCsrf: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    actor?: RequestActor
  }
}
