import 'dotenv/config'
import { Resend } from 'resend'
import { NotFoundError, ValidationError } from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import { RecuperarSenhaEmail } from './RecuperarSenhaEmail.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const from = process.env.EMAIL_FROM ?? 'La Provence <decor@laprovencevie.com.br>'

export class ResendService {
  async sendRecuperarSenha(id: string, resetUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!user) throw new NotFoundError('Usuário')

    const { data, error } = await resend.emails.send({
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
