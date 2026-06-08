import 'dotenv/config'
import { Resend } from 'resend'
import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'

const from = process.env.EMAIL_FROM ?? 'La Provence <decor@laprovencevie.com.br>'
const RECOVERY_SEND_ERROR =
  'Nao foi possivel enviar o email de recuperacao agora. Tente novamente mais tarde.'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new ValidationError('RESEND_API_KEY nao configurado')
  }

  return new Resend(apiKey)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildRecuperarSenhaHtml(resetUrl: string) {
  const safeResetUrl = escapeHtml(resetUrl)

  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 32px;">
      <h2 style="color: #00300D;">Recuperacao de senha</h2>
      <p>Recebemos uma solicitacao para redefinir sua senha.</p>
      <p>
        Clique no link abaixo para criar uma nova senha. O link e valido por
        <strong>15 minutos</strong>.
      </p>
      <p>
        <a href="${safeResetUrl}" style="color: #00300D; font-weight: bold;">
          Redefinir minha senha
        </a>
      </p>
      <p style="margin-top: 32px; font-size: 12px; color: #888;">
        Se voce nao solicitou isso, ignore este e-mail.
      </p>
    </div>
  `
}

export class ResendService {
  async sendRecuperarSenha(id: string, resetUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!user) throw new NotFoundError('Usuario')

    try {
      const { data, error } = await getResendClient().emails.send({
        from,
        to: user.email,
        replyTo: from,
        subject: 'Recuperacao de senha',
        html: buildRecuperarSenhaHtml(resetUrl),
      })

      if (error) {
        throw new ValidationError(RECOVERY_SEND_ERROR, {
          service: 'resend',
          statusCode: error.statusCode,
          name: error.name,
          message: error.message,
        })
      }

      return { data }
    } catch (error) {
      if (error instanceof ValidationError) throw error

      throw new ValidationError(RECOVERY_SEND_ERROR, {
        service: 'resend',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

export const resendService = new ResendService()
