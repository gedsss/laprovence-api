import { ExternalServiceError, ValidationError } from '../../errors/errors.js'

type RecaptchaResponse = {
  success: boolean
  score?: number
  action?: string
  'error-codes'?: string[]
}

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

function allowedActionsMatch(action: string | undefined, expectedActions?: string | string[]) {
  if (!expectedActions) return true
  if (!action) return false

  const allowed = Array.isArray(expectedActions) ? expectedActions : [expectedActions]
  return allowed.includes(action)
}

export async function verifyRecaptchaToken(
  token: string | undefined,
  expectedActions?: string | string[]
) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return

  if (!token) {
    throw new ValidationError('Validação antirobô obrigatória')
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  })

  let response: Response
  try {
    response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
  } catch (err) {
    throw new ExternalServiceError('reCAPTCHA', err instanceof Error ? err : undefined)
  }

  if (!response.ok) {
    throw new ExternalServiceError('reCAPTCHA', new Error(`HTTP ${response.status}`))
  }

  const result = (await response.json()) as RecaptchaResponse
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5')

  if (
    !result.success ||
    !allowedActionsMatch(result.action, expectedActions) ||
    (typeof result.score === 'number' && result.score < minScore)
  ) {
    throw new ValidationError('Não foi possível validar a segurança do checkout')
  }
}
