import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const userName = process.env.ADMIN_USER_NAME ?? 'admin';
  const email = process.env.ADMIN_EMAIL ?? 'admin@tradeswap.local';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD must be set in .env before seeding.');
  }

  const existing = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existing) {
    console.log(`Admin already exists: ${existing.user_name} — skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      user_name: userName,
      email,
      password_hash: passwordHash,
      role: 'ADMIN',
      verified: true,
    },
  });

  console.log(`Admin created: ${admin.user_name} (${admin.email})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
