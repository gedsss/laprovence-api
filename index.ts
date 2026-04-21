/** biome-ignore-all lint/style/noNonNullAssertion: <> */
import Fastify from 'fastify'
import { userRoutes } from './src/modules/user/user.routes.js'
import { catalogoRoutes } from './src/modules/catalogo/catalogo.routes.js'
import { catalogoImagesRoutes } from './src/modules/catalogo_images/catalogo.images.routes.js'
import { listasRoutes } from './src/modules/listas/listas.routes.js'
import { listaItensRoutes } from './src/modules/lista_itens/lista_itens.routes.js'
import { comprasRoutes } from './src/modules/compras/compras.routes.js'
import { premontadasRoutes } from './src/modules/premontadas/premontadas.routes.js'
import { premontadaItensRoutes } from './src/modules/premontada_itens/premontada_itens.routes.js'
import { loginRoutes } from './src/modules/login/login.routes.js'
import { AppError } from './errors/appError.js'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import authPlugin from './src/plugins/auth.js'

const fastify = Fastify({
  logger: true,
})

fastify.register(jwt, {
  secret: process.env.JWT_PASS!,
})

fastify.register(authPlugin)

// Rota raiz
fastify.get('/', (_request, reply) => {
  return reply.send({ status: 'ok', message: 'Servidor funcionando' })
})

// Registrar rotas
fastify.register(userRoutes)
fastify.register(catalogoRoutes)
fastify.register(catalogoImagesRoutes)
fastify.register(listasRoutes)
fastify.register(listaItensRoutes)
fastify.register(comprasRoutes)
fastify.register(premontadasRoutes)
fastify.register(premontadaItensRoutes)
fastify.register(loginRoutes)

fastify.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
})

fastify.post(
  '/login',
  {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  },
  async (_request, _reply) => {
    return { ok: true }
  }
)

fastify.register(cors, {
  origin: true,
  credentials: true,
})

fastify.register(helmet)

// Handler de erro global
fastify.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
      details: error.details,
    })
  }

  fastify.log.error(error)

  return reply.status(500).send({
    success: false,
    message: 'Erro interno do servidor',
  })
})

// Iniciar servidor
fastify.listen({ port: 3333, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Servidor rodando em ${address}`)
})
