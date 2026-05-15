require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding en cours...")

  await prisma.issueType.createMany({
    data: [
      { name: "Bug technique" },
      { name: "Problème de paiement" },
      { name: "Demande d'information" },
      { name: "Autre" }
    ],
    skipDuplicates: true
  })

    await prisma.application.create({
    data: {
      name: "App 1",
      apiKey: "key123",
      projectManager: {
        create: {
          name: "Admin",
          email: "admin@test.com",
          password: "1234",
          role: "ADMIN",
        },
      },
    },
  })

  await prisma.client.create({
    data: {
      externalId: "client-1",
      name: "Client 1",
      email: "client@test.com",
      applicationId: 1,
    },
  })

  console.log("Seed terminé 🌱")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())