/** biome-ignore-all lint/style/noNonNullAssertion: <> */

import type { FastifyError } from 'fastify'
import Fastify from 'fastify'
import { ZodError } from 'zod'
import 'dotenv/config'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { AppError } from './errors/appError.js'
import { authRoutes } from './src/auth/auth.routes.js'
import { catalogoRoutes } from './src/modules/catalogo/catalogo.routes.js'
import { catalogoImagesRoutes } from './src/modules/catalogo_images/catalogo.images.routes.js'
import { comprasRoutes } from './src/modules/compras/compras.routes.js'
import { listaItensRoutes } from './src/modules/lista_itens/lista_itens.routes.js'
import { listasRoutes } from './src/modules/listas/listas.routes.js'
import { premontadaItensRoutes } from './src/modules/premontada_itens/premontada_itens.routes.js'
import { premontadasRoutes } from './src/modules/premontadas/premontadas.routes.js'
import { resendRoutes } from './src/modules/resend-email/resend.routes.js'
import { userRoutes } from './src/modules/user/user.routes.js'
import { pagBankRoutes } from './src/pagbank/pagbank.routes.js'
import authPlugin from './src/plugins/auth.js'

const jwtSecret = process.env.JWT_PASS

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_PASS deve ser configurado com pelo menos 32 caracteres')
}

function trustProxySetting() {
  const configured = process.env.TRUST_PROXY?.trim()
  if (!configured) return false
  if (/^\d+$/.test(configured)) return Number(configured)
  return configured
}

const fastify = Fastify({
  trustProxy: trustProxySetting(),
  logger: {
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.recaptcha_token',
      'req.headers["x-checkout-token"]',
      '*.checkout_access_token',
      '*.card_encrypted',
      '*.cpf',
      '*.email',
      '*.telefone',
    ],
  },
  bodyLimit: 256 * 1024,
})

fastify.register(cookie)

fastify.register(jwt, {
  secret: jwtSecret,
  cookie: {
    cookieName: 'lp_session',
    signed: false,
  },
})

fastify.register(authPlugin)

fastify.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
})

const corsOrigins = process.env.CORS_ORIGINS?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

if (process.env.NODE_ENV === 'production' && !corsOrigins?.length) {
  throw new Error('CORS_ORIGINS deve ser configurado em producao')
}

fastify.register(cors, {
  origin: corsOrigins?.length ? corsOrigins : true,
  credentials: true,
})

fastify.register(helmet)

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
fastify.register(authRoutes)
fastify.register(resendRoutes)
fastify.register(pagBankRoutes)

// Handler de erro global
fastify.setErrorHandler((error: FastifyError | AppError, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: 'Erro de validação',
      details: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
    })
  }

  if (error.statusCode === 413) {
    return reply.status(413).send({
      success: false,
      message: 'Requisicao grande demais.',
    })
  }

  // Erros do próprio Fastify (ex: JSON inválido, validação)
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
    })
  }

  fastify.log.error(
    { statusCode: error.statusCode },
    'Erro interno nao tratado'
  )

  return reply.status(500).send({
    success: false,
    message: 'Erro interno do servidor',
  })
})

// Em producao, exponha a API apenas atraves do proxy reverso.
const listenHost =
  process.env.HOST?.trim() ||
  (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0')

// Iniciar servidor
fastify.listen({ port: 3668, host: listenHost }, (err, address) => {
  if (err) {
    fastify.log.error('Falha ao iniciar servidor')
    process.exit(1)
  }
  fastify.log.info(`Servidor rodando em ${address}`)
})
