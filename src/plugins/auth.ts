import fp from 'fastify-plugin'
import type { FastifyRequest, FastifyReply } from 'fastify'

export default fp(async function authPlugin(fastify) {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
      } catch (err: any) {
        return reply.status(401).send({
          success: false,
          message: 'Token inválido ou ausente',
          err,
        })
      }
    }
  )
})
