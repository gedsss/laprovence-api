import type { FastifyReply, FastifyRequest } from 'fastify'
import { resendService } from './resend.service.js'

interface ForgotPasswordBody {
  id: string
  resetUrl: string
}

export class ResendController {
  async sendRecuperarSenha(request: FastifyRequest, reply: FastifyReply) {
    const { id, resetUrl } = request.body as ForgotPasswordBody

    const result = await resendService.sendRecuperarSenha(id, resetUrl)

    return reply.status(200).send({
      success: true,
      message: 'Email de recuperação enviado com sucesso',
      data: result.data,
    })
  }
}

export const resendController = new ResendController()
