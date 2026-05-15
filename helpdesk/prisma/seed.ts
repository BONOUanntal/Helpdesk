import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {

  const password = await bcrypt.hash('password123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@test.com',
      password,
      role: UserRole.ADMIN,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password }, // ← ajoute ça
    create: {
        name: 'Admin',
        email: 'admin@test.com',
        password,
        role: UserRole.ADMIN,
    },
    })

  await prisma.user.upsert({
    where: { email: 'pm@test.com' },
    update: {},
    create: {
      name: 'Project Manager',
      email: 'pm@test.com',
      password,
      role: UserRole.PROJECT_MANAGER,
    },
  })

  await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      name: 'Client',
      email: 'client@test.com',
      password,
      role: UserRole.CLIENT,
    },
  })

  console.log('Seed terminé')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })