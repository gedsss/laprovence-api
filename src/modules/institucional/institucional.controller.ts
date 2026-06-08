import type { FastifyReply, FastifyRequest } from 'fastify'
import { requireInstitucionalAdmin } from '../../lib/access-control.js'
import {
  CreateInstitucionalCategorySchema,
  CreateInstitucionalStoreSchema,
  InstitucionalLoginSchema,
  InstitucionalStoreQuerySchema,
  InstitucionalUploadSchema,
  ReorderInstitucionalStoresSchema,
  UpdateInstitucionalCategorySchema,
  UpdateInstitucionalStoreSchema,
} from './institucional.schema.js'
import { institucionalService } from './institucional.service.js'

const SESSION_COOKIE = 'lp_institucional_session'

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }
}

export class InstitucionalController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = InstitucionalLoginSchema.parse(request.body)
    const { token, user } = await institucionalService.login(email, password)

    reply.setCookie(SESSION_COOKIE, token, {
      ...sessionCookieOptions(),
      maxAge: 8 * 60 * 60,
    })

    return reply.status(200).send({
      success: true,
      message: 'Sucesso ao realizar o login',
      data: { user },
    })
  }

  async session(request: FastifyRequest, reply: FastifyReply) {
    const admin = requireInstitucionalAdmin(request.institucionalAdmin)
    const user = await institucionalService.getSessionUser(admin.id)
    return reply.send({ success: true, data: { user } })
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie(SESSION_COOKIE, sessionCookieOptions())
    return reply.send({ success: true })
  }

  async listCategories(_request: FastifyRequest, reply: FastifyReply) {
    const data = await institucionalService.listCategories()
    return reply.send({ success: true, data })
  }

  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    const input = CreateInstitucionalCategorySchema.parse(request.body)
    const data = await institucionalService.createCategory(input)
    return reply.status(201).send({ success: true, data })
  }

  async updateCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const input = UpdateInstitucionalCategorySchema.parse(request.body)
    const data = await institucionalService.updateCategory(id, input)
    return reply.send({ success: true, data })
  }

  async deleteCategory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await institucionalService.deleteCategory(id)
    return reply.send({ success: true })
  }

  async listStores(request: FastifyRequest, reply: FastifyReply) {
    const { includeArchived } = InstitucionalStoreQuerySchema.parse(
      request.query
    )
    const data = await institucionalService.listStores(includeArchived)
    return reply.send({ success: true, data })
  }

  async getStore(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const data = await institucionalService.getStore(id)
    return reply.send({ success: true, data })
  }

  async createStore(request: FastifyRequest, reply: FastifyReply) {
    const input = CreateInstitucionalStoreSchema.parse(request.body)
    const data = await institucionalService.createStore(input)
    return reply.status(201).send({ success: true, data })
  }

  async updateStore(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const input = UpdateInstitucionalStoreSchema.parse(request.body)
    const data = await institucionalService.updateStore(id, input)
    return reply.send({ success: true, data })
  }

  async deleteStore(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await institucionalService.deleteStore(id)
    return reply.send({ success: true })
  }

  async reorderStores(request: FastifyRequest, reply: FastifyReply) {
    const input = ReorderInstitucionalStoresSchema.parse(request.body)
    await institucionalService.reorderStores(input)
    return reply.send({ success: true })
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const input = InstitucionalUploadSchema.parse(request.body)
    const data = await institucionalService.upload(input)
    return reply.status(201).send({ success: true, data })
  }

  async getMedia(request: FastifyRequest, reply: FastifyReply) {
    const { fileName } = request.params as { fileName: string }
    const media = await institucionalService.getMedia(fileName)
    return reply.type(media.contentType).send(media.stream)
  }
}

export const institucionalController = new InstitucionalController()
