import { ExternalServiceError } from '../../errors/errors.js'

const URLS = {
  sandbox: 'https://sandbox.api.pagseguro.com',
  production: 'https://api.pagseguro.com',
} as const

export type PagBankRequestOptions = {
  idempotencyKey?: string
}

const env = process.env.PAGBANK_ENV === 'production' ? 'production' : 'sandbox'
const BASE_URL = URLS[env]
const TOKEN = process.env.PAGBANK_TOKEN

function extractErrorMessages(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []

  const errorMessages = (data as { error_messages?: unknown }).error_messages
  if (!Array.isArray(errorMessages)) return []

  return errorMessages
    .map(error => {
      if (!error || typeof error !== 'object') return undefined
      return (error as { description?: unknown }).description
    })
    .filter((description): description is string => typeof description === 'string')
}

function describeBody(body: unknown) {
  if (!body || typeof body !== 'object') return undefined

  const payload = body as {
    reference_id?: string
    qr_codes?: Array<{ amount?: { value?: number } }>
    charges?: Array<{
      amount?: { value?: number; currency?: string }
      payment_method?: { type?: string; installments?: number }
    }>
    notification_urls?: string[]
  }

  const charge = payload.charges?.[0]
  const qrCode = payload.qr_codes?.[0]

  return {
    reference_id: payload.reference_id,
    payment_method: charge?.payment_method?.type ?? (qrCode ? 'PIX' : undefined),
    installments: charge?.payment_method?.installments,
    amount: charge?.amount?.value ?? qrCode?.amount?.value,
    currency: charge?.amount?.currency ?? 'BRL',
    notification_urls: payload.notification_urls?.length ?? 0,
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function pagbankRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  options: PagBankRequestOptions = {}
): Promise<T> {
  if (!TOKEN) {
    throw new ExternalServiceError('PagBank', new Error('PAGBANK_TOKEN nao configurado'))
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  if (options.idempotencyKey) {
    headers['x-idempotency-key'] = options.idempotencyKey
  }

  if (body !== undefined) {
    console.info('[PagBank req]', method, path, JSON.stringify(describeBody(body)))
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (err) {
    throw new ExternalServiceError('PagBank', err instanceof Error ? err : undefined)
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    const msgs = extractErrorMessages(data)
    const detail = msgs.length > 0 ? msgs.join('; ') : `HTTP ${response.status}`

    console.error('[PagBank res]', method, path, response.status, detail)
    throw new ExternalServiceError('PagBank', new Error(detail))
  }

  return data as T
}
