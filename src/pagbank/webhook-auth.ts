import { createHash, timingSafeEqual } from 'node:crypto'

export const PAGBANK_SIGNATURE_HEADER = 'x-authenticity-token'

function isSignatureRequired() {
  return process.env.PAGBANK_WEBHOOK_SIGNATURE_REQUIRED !== 'false'
}

function normalizeHeader(header: string | string[] | undefined) {
  if (Array.isArray(header)) return header[0]
  return header
}

function safeCompareHex(expected: string, received: string) {
  try {
    const expectedBuffer = Buffer.from(expected, 'hex')
    const receivedBuffer = Buffer.from(received, 'hex')

    if (expectedBuffer.length !== receivedBuffer.length) return false
    return timingSafeEqual(expectedBuffer, receivedBuffer)
  } catch {
    return false
  }
}

export function validatePagBankWebhookSignature(
  rawBody: string,
  signatureHeader: string | string[] | undefined
) {
  if (!isSignatureRequired()) return true

  const token = process.env.PAGBANK_TOKEN
  const received = normalizeHeader(signatureHeader)?.trim().toLowerCase()
  if (!token || !received) return false

  const expected = createHash('sha256')
    .update(`${token}-${rawBody}`)
    .digest('hex')

  return safeCompareHex(expected, received)
}
