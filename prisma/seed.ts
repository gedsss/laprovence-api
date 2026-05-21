import bcrypt from 'bcrypt'
import 'dotenv/config'
import { prisma } from './prismaClient.js'

async function main() {
  const password = await bcrypt.hash('Gestor123', 10)

  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@laprovence.com' },
    update: {
      nome_noiva: 'Gestora',
      nome_noivo: 'Teste',
      telefone: '+5511999999999',
      data_casamento: new Date('2026-06-01'),
      password,
      role: 'gestor',
      is_system: true,
    },
    create: {
      nome_noiva: 'Gestora',
      nome_noivo: 'Teste',
      email: 'gestor@laprovence.com',
      telefone: '+5511999999999',
      data_casamento: new Date('2026-06-01'),
      password,
      role: 'gestor',
      is_system: true,
    },
  })

  console.log('Gestor seed criado ou atualizado:', gestor.email)

  const gestorPagBank = await prisma.user.upsert({
    where: { email: 'pagbank@laprovence.com' },
    update: {
      nome_noiva: 'PagBank',
      nome_noivo: 'Gestor',
      telefone: '+5511999999998',
      data_casamento: new Date('2026-06-01'),
      password,
      role: 'gestor',
      is_system: true,
    },
    create: {
      nome_noiva: 'PagBank',
      nome_noivo: 'Gestor',
      email: 'pagbank@laprovence.com',
      telefone: '+5511999999998',
      data_casamento: new Date('2026-06-01'),
      password,
      role: 'gestor',
      is_system: true,
    },
  })

  console.log('Gestor PagBank seed criado ou atualizado:', gestorPagBank.email)
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
