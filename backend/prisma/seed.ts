import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const davePassword = await bcrypt.hash('ChangeMe123!', 10);
  const ljPassword = await bcrypt.hash('ChangeMe123!', 10);

  // Create Dave
  const dave = await prisma.user.upsert({
    where: { email: 'dave@example.com' },
    update: {},
    create: {
      name: 'Dave',
      email: 'dave@example.com',
      passwordHash: davePassword,
      reminderPrefs: {
        oneMonth: true,
        oneWeek: true,
        oneDay: true,
        oneHour: true,
        fifteenMinutes: false,
        custom: false,
      },
    },
  });

  // Create LJ
  const lj = await prisma.user.upsert({
    where: { email: 'lj@example.com' },
    update: {},
    create: {
      name: 'LJ',
      email: 'lj@example.com',
      passwordHash: ljPassword,
      reminderPrefs: {
        oneMonth: true,
        oneWeek: true,
        oneDay: true,
        oneHour: true,
        fifteenMinutes: false,
        custom: false,
      },
    },
  });

  console.log('Created users:', dave.name, 'and', lj.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
