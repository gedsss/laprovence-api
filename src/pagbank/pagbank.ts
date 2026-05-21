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

  if (body !== undefined) {
    const preview = JSON.stringify(body).slice(0, 500)
    console.log('[PagBank req]', method, path, preview)
  }
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
    console.error('[PagBank]', method, path, '→', response.status, JSON.stringify(data))
    // Extrai mensagem legível dos erros do PagBank
    const msgs: string[] = (data?.error_messages ?? []).map((e: { description: string }) => e.description)
    const detail = msgs.length > 0 ? msgs.join('; ') : `HTTP ${response.status}`
    throw new ExternalServiceError('PagBank', new Error(detail))
  }

  return data as T
}
