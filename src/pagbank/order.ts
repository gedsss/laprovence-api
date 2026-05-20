import { pagbankRequest } from './pagbank.js'

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
  name: string
  quantity: number
  unit_amount: number
}

export interface PixCharge {
  reference_id?: string
  description?: string
  amount: { value: number; currency: 'BRL' }
  payment_method: { type: 'PIX' }
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
      security_code?: string
      holder: { name: string }
      store?: boolean
    }
  }
}

export type PagBankCharge = PixCharge | CreditCardCharge

export interface CreateOrderInput {
  reference_id: string
  customer: PagBankCustomer
  items: PagBankItem[]
  charges: PagBankCharge[]
  notification_urls?: string[]
}

export interface QrCode {
  id: string
  expiration_date: string
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
    summary: {
      total: number
      paid: number
      refunded: number
    }
  }
  payment_method: { type: string; installments?: number }
  payment_method_flows?: {
    type: string
    qr_codes?: QrCode[]
  }
}

export interface OrderResponse {
  id: string
  reference_id: string
  created_at: string
  customer: PagBankCustomer
  items: PagBankItem[]
  charges: ChargeResponse[]
  links: Array<{ rel: string; href: string; media: string; type: string }>
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
  return pagbankRequest<OrderResponse>('POST', '/orders', input)
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  return pagbankRequest<OrderResponse>('GET', `/orders/${orderId}`)
}
