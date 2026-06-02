import 'dotenv/config'
import { Resend } from 'resend'
import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import { RecuperarSenhaEmail } from './RecuperarSenhaEmail.js'

const from = process.env.EMAIL_FROM ?? 'La Provence <decor@laprovencevie.com.br>'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new ValidationError('RESEND_API_KEY nao configurado')
  }

  return new Resend(apiKey)
}

export class ResendService {
  async sendRecuperarSenha(id: string, resetUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!user) throw new NotFoundError('Usuário')

    const { data, error } = await getResendClient().emails.send({
      from,
      to: user.email,
      replyTo: from,
      subject: 'Recuperação de senha',
      react: RecuperarSenhaEmail({ resetUrl }),
    })

    if (error) {
      throw new ValidationError('Erro ao enviar o email', error)
    }

    return { data }
  }
}

export const resendService = new ResendService()
