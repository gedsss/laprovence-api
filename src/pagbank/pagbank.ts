import { ExternalServiceError } from '../../errors/errors.js'

const URLS = {
  sandbox: 'https://sandbox.api.pagseguro.com',
  production: 'https://api.pagseguro.com',
} as const

const SDK_URLS = {
  sandbox: 'https://sandbox.sdk.pagseguro.com',
  production: 'https://sdk.pagseguro.com',
} as const

export type PagBankRequestOptions = {
  idempotencyKey?: string
}

const env = process.env.PAGBANK_ENV === 'production' ? 'production' : 'sandbox'
const BASE_URL = URLS[env]
const SDK_BASE_URL = SDK_URLS[env]
const TOKEN = process.env.PAGBANK_TOKEN

export function getPagBankSdkEnvironment(): 'PROD' | 'SANDBOX' {
  return env === 'production' ? 'PROD' : 'SANDBOX'
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
    throw new ExternalServiceError(
      'PagBank',
      new Error('PAGBANK_TOKEN nao configurado')
    )
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  if (options.idempotencyKey) {
    headers['x-idempotency-key'] = options.idempotencyKey
  }

  console.info('[PagBank req]', method, path)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (err) {
    throw new ExternalServiceError(
      'PagBank',
      err instanceof Error ? err : undefined
    )
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    console.error('[PagBank res]', method, path, response.status)
    throw new ExternalServiceError(
      'PagBank',
      new Error(`HTTP ${response.status}`)
    )
  }

  return data as T
}

export async function pagbankSdkRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  if (!TOKEN) {
    throw new ExternalServiceError(
      'PagBank',
      new Error('PAGBANK_TOKEN nao configurado')
    )
  }

  let response: Response
  try {
    response = await fetch(`${SDK_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (err) {
    throw new ExternalServiceError(
      'PagBank 3DS',
      err instanceof Error ? err : undefined
    )
  }

  const data = await parseResponse(response)
  if (!response.ok) {
    console.error('[PagBank 3DS res]', method, path, response.status)
    throw new ExternalServiceError(
      'PagBank 3DS',
      new Error(`HTTP ${response.status}`)
    )
  }

  return data as T
}
