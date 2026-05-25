import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { ForbiddenError } from '../../errors/errors.js'

function hashCheckoutAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createCheckoutAccessToken() {
  const token = randomBytes(32).toString('hex')
  return { token, hash: hashCheckoutAccessToken(token) }
}

export function requireCheckoutAccess(
  expectedHash: string | null,
  receivedToken: string | undefined
) {
  if (!expectedHash || !receivedToken) {
    throw new ForbiddenError('Tentativa de pagamento invalida')
  }

  const expected = Buffer.from(expectedHash, 'hex')
  const received = Buffer.from(hashCheckoutAccessToken(receivedToken), 'hex')
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    throw new ForbiddenError('Tentativa de pagamento invalida')
  }
}
