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
      email: 'gestor@laprovence.test',
      telefone: '+5511999999999',
      data_casamento: new Date('2026-06-01'),
      password,
      role: 'gestor',
      is_system: true,
    },
  })

  console.log('Gestor seed criado ou atualizado:', gestor.email)
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
