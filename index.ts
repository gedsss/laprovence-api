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

const fastify = Fastify({
  logger: true,
})

// Rota raiz
fastify.get('/', (request, reply) => {
  return reply.send({ status: 'ok', message: 'Servidor funcionando' })
})

fastify.register(cors, {
  origin: true,
  credentials: true,
})

fastify.register(helmet)

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

// Handler de erro global
fastify.setErrorHandler((error, request, reply) => {
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
