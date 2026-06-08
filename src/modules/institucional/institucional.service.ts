import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Prisma } from '../../../generated/prisma/client.js'
import {
  InvalidCredentialsError,
  NotFoundError,
  ValidationError,
} from '../../../errors/errors.js'
import { prisma } from '../../../prisma/prismaClient.js'
import type {
  CreateInstitucionalCategoryInput,
  CreateInstitucionalStoreInput,
  InstitucionalUploadInput,
  ReorderInstitucionalStoresInput,
  UpdateInstitucionalCategoryInput,
  UpdateInstitucionalStoreInput,
} from './institucional.schema.js'

const SESSION_SCOPE = 'institucional_admin'
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024

function mediaDir() {
  return path.resolve(
    process.env.INSTITUCIONAL_MEDIA_DIR || 'uploads/institucional'
  )
}

function publicMediaUrl() {
  return (
    process.env.INSTITUCIONAL_PUBLIC_MEDIA_URL ||
    'http://localhost:3668/institucional/media'
  ).replace(/\/$/, '')
}

function extensionFor(contentType: string) {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  return extensions[contentType]
}

function typeForExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase()

  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function normalizeBase64(data: string) {
  const marker = ';base64,'
  const markerIndex = data.indexOf(marker)
  return markerIndex >= 0 ? data.slice(markerIndex + marker.length) : data
}

function toStore(row: any) {
  return {
    ...row,
    category: row.category_id,
    photos: row.photos ?? [],
    photo_labels: row.photo_labels ?? [],
    category_id: undefined,
    category_ref: undefined,
  }
}

function toCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export class InstitucionalService {
  async login(email: string, password: string) {
    await this.createInitialAdminIfNeeded(email, password)

    const admin = await prisma.institucional_admin_user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        password: true,
      },
    })

    if (!admin || !admin.active) throw new InvalidCredentialsError()

    const passwordMatches = await bcrypt.compare(password, admin.password)
    if (!passwordMatches) throw new InvalidCredentialsError()

    const secret = process.env.JWT_PASS
    if (!secret) throw new Error('JWT_PASS nao configurado')

    const token = jwt.sign({ sub: admin.id, scope: SESSION_SCOPE }, secret, {
      expiresIn: '8h',
    })

    const { password: _, ...user } = admin

    return { token, user }
  }

  async getSessionUser(id: string) {
    const admin = await prisma.institucional_admin_user.findFirst({
      where: { id, active: true },
      select: { id: true, email: true, name: true, active: true },
    })

    if (!admin) throw new InvalidCredentialsError()
    return admin
  }

  async listCategories() {
    const categories = await prisma.institucional_categories.findMany({
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
    })

    return categories.map(toCategory)
  }

  async createCategory(data: CreateInstitucionalCategoryInput) {
    const category = await prisma.institucional_categories.create({ data })
    return toCategory(category)
  }

  async updateCategory(id: string, data: UpdateInstitucionalCategoryInput) {
    await this.ensureCategory(id)
    const updateData: Record<string, string | number> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order

    const category = await prisma.institucional_categories.update({
      where: { id },
      data: updateData,
    })
    return toCategory(category)
  }

  async deleteCategory(id: string) {
    await this.ensureCategory(id)
    await prisma.institucional_categories.delete({ where: { id } })
  }

  async listStores(includeArchived = false) {
    const query: Parameters<
      typeof prisma.institucional_stores.findMany
    >[0] = {
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
      include: { category_ref: true },
    }

    if (!includeArchived) query.where = { archived: false }

    const stores = await prisma.institucional_stores.findMany(query)

    return stores.map(toStore)
  }

  async getStore(id: string) {
    const store = await prisma.institucional_stores.findUnique({
      where: { id },
      include: { category_ref: true },
    })

    if (!store) throw new NotFoundError('Loja institucional', id)

    return toStore(store)
  }

  async createStore(data: CreateInstitucionalStoreInput) {
    const store = await prisma.institucional_stores.create({
      data: this.createStoreData(data),
      include: { category_ref: true },
    })

    return toStore(store)
  }

  async updateStore(id: string, data: UpdateInstitucionalStoreInput) {
    await this.ensureStore(id)
    const store = await prisma.institucional_stores.update({
      where: { id },
      data: this.updateStoreData(data),
      include: { category_ref: true },
    })

    return toStore(store)
  }

  async deleteStore(id: string) {
    await this.ensureStore(id)
    await prisma.institucional_stores.delete({ where: { id } })
  }

  async reorderStores(data: ReorderInstitucionalStoresInput) {
    await prisma.$transaction(
      data.ids.map((id, index) =>
        prisma.institucional_stores.update({
          where: { id },
          data: { sort_order: index },
        })
      )
    )
  }

  async upload(data: InstitucionalUploadInput) {
    const extension = extensionFor(data.content_type)
    if (!extension) throw new ValidationError('Tipo de arquivo invalido')

    const buffer = Buffer.from(normalizeBase64(data.data), 'base64')
    if (!buffer.length) throw new ValidationError('Arquivo vazio')
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new ValidationError('Arquivo grande demais')
    }

    const dir = mediaDir()
    await mkdir(dir, { recursive: true })

    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`
    const destination = path.join(dir, fileName)
    await writeFile(destination, buffer, { flag: 'wx' })

    return {
      file_name: fileName,
      url: `${publicMediaUrl()}/${fileName}`,
    }
  }

  async getMedia(fileName: string) {
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      throw new NotFoundError('Midia institucional', fileName)
    }

    const fullPath = path.join(mediaDir(), fileName)
    const file = await stat(fullPath).catch(() => null)
    if (!file?.isFile()) throw new NotFoundError('Midia institucional', fileName)

    return {
      stream: createReadStream(fullPath),
      contentType: typeForExtension(fileName),
    }
  }

  private async ensureCategory(id: string) {
    const category = await prisma.institucional_categories.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!category) throw new NotFoundError('Categoria institucional', id)
  }

  private async ensureStore(id: string) {
    const store = await prisma.institucional_stores.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!store) throw new NotFoundError('Loja institucional', id)
  }

  private async createInitialAdminIfNeeded(email: string, password: string) {
    const adminCount = await prisma.institucional_admin_user.count()
    if (adminCount > 0) return

    const seedEmail = process.env.INSTITUCIONAL_ADMIN_EMAIL
    const seedPassword = process.env.INSTITUCIONAL_ADMIN_PASSWORD

    if (!seedEmail || !seedPassword) return
    if (seedEmail.toLowerCase() !== email.toLowerCase()) return
    if (seedPassword !== password) return

    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.institucional_admin_user.create({
      data: {
        email: seedEmail,
        password: passwordHash,
        name: process.env.INSTITUCIONAL_ADMIN_NAME || 'Administrador',
      },
    })
  }

  private createStoreData(
    data: CreateInstitucionalStoreInput
  ): Prisma.institucional_storesCreateInput {
    const storeData: Prisma.institucional_storesCreateInput = {
      name: data.name,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.hours !== undefined && { hours: data.hours }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.photos !== undefined && { photos: data.photos }),
      ...(data.photo_labels !== undefined && {
        photo_labels: data.photo_labels,
      }),
      ...(data.highlighted !== undefined && { highlighted: data.highlighted }),
      ...(data.archived !== undefined && { archived: data.archived }),
      ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
    }

    if (data.category) {
      storeData.category_ref = { connect: { id: data.category } }
    }

    return storeData
  }

  private updateStoreData(
    data: UpdateInstitucionalStoreInput
  ): Prisma.institucional_storesUpdateInput {
    const storeData: Prisma.institucional_storesUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.hours !== undefined && { hours: data.hours }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.photos !== undefined && { photos: data.photos }),
      ...(data.photo_labels !== undefined && {
        photo_labels: data.photo_labels,
      }),
      ...(data.highlighted !== undefined && { highlighted: data.highlighted }),
      ...(data.archived !== undefined && { archived: data.archived }),
      ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
    }

    if (data.category !== undefined) {
      storeData.category_ref = data.category
        ? { connect: { id: data.category } }
        : { disconnect: true }
    }

    return storeData
  }
}

export const institucionalService = new InstitucionalService()
