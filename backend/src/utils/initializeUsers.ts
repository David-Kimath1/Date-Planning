import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function initializeUsers(prisma: PrismaClient) {
  try {
    const davePassword = await bcrypt.hash(process.env.DAVE_PASSWORD || 'ChangeMe123!', 10);
    const ljPassword = await bcrypt.hash(process.env.LJ_PASSWORD || 'ChangeMe123!', 10);

    // Create Dave
    const dave = await prisma.user.upsert({
      where: { email: process.env.DAVE_EMAIL || 'dave@example.com' },
      update: {},
      create: {
        name: 'Dave',
        email: process.env.DAVE_EMAIL || 'dave@example.com',
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
      where: { email: process.env.LJ_EMAIL || 'lj@example.com' },
      update: {},
      create: {
        name: 'LJ',
        email: process.env.LJ_EMAIL || 'lj@example.com',
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

    console.log('✓ Users initialized:', dave.name, 'and', lj.name);
  } catch (error) {
    console.error('Error initializing users:', error);
  }
}
