import { Readable } from 'node:stream'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { pagBankController } from './pagbank.controller.js'

type RawBodyRequest = FastifyRequest & { rawBody?: string }

function captureRawBody(
  request: FastifyRequest,
  _reply: FastifyReply,
  payload: NodeJS.ReadableStream,
  done: (err: Error | null, stream?: NodeJS.ReadableStream) => void
) {
  const chunks: Buffer[] = []

  payload.on('data', chunk => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  })

  payload.on('end', () => {
    const rawBody = Buffer.concat(chunks)
    ;(request as RawBodyRequest).rawBody = rawBody.toString('utf8')

    const stream = Readable.from(rawBody)
    ;(
      stream as Readable & { receivedEncodedLength?: number }
    ).receivedEncodedLength = rawBody.length

    done(null, stream)
  })

  payload.on('error', err => {
    done(
      err instanceof Error ? err : new Error('Erro ao ler webhook do PagBank')
    )
  })
}

const checkoutRateLimit = {
  max: 20,
  timeWindow: '1 minute',
}

export async function pagBankRoutes(app: FastifyInstance) {
  app.get('/pagbank/public-key', async (request, reply) => {
    return pagBankController.getPublicKey(request, reply)
  })

  app.post(
    '/pagbank/orders/pix',
    { config: { rateLimit: checkoutRateLimit } },
    async (request, reply) => {
      return pagBankController.createPixOrder(request, reply)
    }
  )

  app.post(
    '/pagbank/orders/credit-card',
    { config: { rateLimit: checkoutRateLimit } },
    async (request, reply) => {
      return pagBankController.createCreditCardOrder(request, reply)
    }
  )

  app.post(
    '/pagbank/3ds/session',
    { config: { rateLimit: checkoutRateLimit } },
    async (request, reply) => {
      return pagBankController.createThreeDsSession(request, reply)
    }
  )

  app.get('/pagbank/orders/:compra_id/status', async (request, reply) => {
    return pagBankController.getOrderStatus(request, reply)
  })

  app.post('/pagbank/orders/:compra_id/cancel', async (request, reply) => {
    return pagBankController.cancelOrder(request, reply)
  })

  app.post(
    '/pagbank/webhook',
    {
      preParsing: captureRawBody as any,
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      return pagBankController.webhook(request as RawBodyRequest, reply)
    }
  )
}
