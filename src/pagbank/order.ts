import { pagbankRequest, pagbankSdkRequest } from './pagbank.js'

export interface PagBankCustomer {
  name: string
  email: string
  tax_id: string
  phones?: PagBankPhone[]
}

export interface PagBankPhone {
  country: string
  area: string
  number: string
  type: 'MOBILE' | 'HOME' | 'BUSINESS'
}

export interface PagBankItem {
  reference_id?: string
  name: string
  quantity: number
  unit_amount: number
}

// PIX usa qr_codes, não charges
export interface QrCodeInput {
  amount: { value: number }
  expiration_date?: string
}

export interface CreditCardCharge {
  reference_id?: string
  description?: string
  amount: { value: number; currency: 'BRL' }
  payment_method: {
    type: 'CREDIT_CARD'
    installments: number
    capture: boolean
    card: {
      encrypted: string
      store?: boolean
    }
    // holder fica fora de card, dentro de payment_method
    holder: {
      name: string
      tax_id?: string
    }
    authentication_method?: {
      type: 'THREEDS'
      id: string
    }
  }
}

export interface CreateOrderInput {
  reference_id: string
  customer: PagBankCustomer
  items: PagBankItem[]
  qr_codes?: QrCodeInput[]
  charges?: CreditCardCharge[]
  notification_urls?: string[]
}

export type QrCodeStatus = 'WAITING' | 'PAID' | 'EXPIRED'

export interface QrCodeResponse {
  id: string
  expiration_date?: string
  amount: { value: number }
  status?: QrCodeStatus
  text: string
  links: Array<{ rel: string; href: string; media: string; type: string }>
}

export type ChargeStatus =
  | 'WAITING'
  | 'IN_ANALYSIS'
  | 'PAID'
  | 'DECLINED'
  | 'CANCELED'
  | 'AUTHORIZED'

export interface ChargeResponse {
  id: string
  reference_id?: string
  status: ChargeStatus
  amount: {
    value: number
    currency: string
    summary: { total: number; paid: number; refunded: number }
  }
  payment_method: { type: string; installments?: number }
}

export interface OrderResponse {
  id: string
  reference_id: string
  created_at: string
  customer: PagBankCustomer
  items: PagBankItem[]
  qr_codes?: QrCodeResponse[]
  charges?: ChargeResponse[]
  links: Array<{ rel: string; href: string; media: string; type: string }>
}

export interface PublicKeyResponse {
  public_key: string
  created_at: string
  version?: string
}

export interface ThreeDsSessionResponse {
  session: string
  expires_at?: string
}

export async function createOrder(
  input: CreateOrderInput,
  idempotencyKey?: string
): Promise<OrderResponse> {
  return pagbankRequest<OrderResponse>(
    'POST',
    '/orders',
    input,
    idempotencyKey ? { idempotencyKey } : {}
  )
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  return pagbankRequest<OrderResponse>('GET', `/orders/${orderId}`)
}

export async function getPublicKey(): Promise<PublicKeyResponse> {
  return pagbankRequest<PublicKeyResponse>('GET', '/public-keys/card')
}

export async function createThreeDsSession(): Promise<ThreeDsSessionResponse> {
  return pagbankSdkRequest<ThreeDsSessionResponse>(
    'POST',
    '/checkout-sdk/sessions'
  )
}
