import bcrypt from 'bcrypt'
import 'dotenv/config'
import { prisma } from './prismaClient.js'

async function main() {
  const seedPassword = process.env.SEED_GESTOR_PASSWORD
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error('SEED_GESTOR_PASSWORD deve ter pelo menos 12 caracteres')
  }

  const password = await bcrypt.hash(seedPassword, 10)

  await prisma.user.upsert({
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

  console.log('Gestor seed criado ou atualizado')
}

main()
  .catch(() => {
    console.error('Falha ao executar seed de gestor')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
