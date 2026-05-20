import { ExternalServiceError } from '../../errors/errors.js'

const URLS = {
  sandbox: 'https://sandbox.api.pagseguro.com',
  production: 'https://api.pagseguro.com',
} as const

const BASE_URL = URLS[(process.env.PAGBANK_ENV as keyof typeof URLS) ?? 'sandbox']
const TOKEN = process.env.PAGBANK_TOKEN

export async function pagbankRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (err) {
    throw new ExternalServiceError('PagBank', err instanceof Error ? err : undefined)
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ExternalServiceError(
      'PagBank',
      new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`)
    )
  }

  return data as T
}
