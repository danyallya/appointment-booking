import { existsSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { assertLocalDatabase } from './local-database.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');
assertLocalDatabase(process.env.DATABASE_URL);
const db = new PrismaClient();
try {
  await db.$transaction([
    db.client.upsert({ where: { email: 'sample.client@example.com' }, update: {}, create: { id: 'sample-client', name: 'Fictional client', email: 'sample.client@example.com' } }),
    db.service.upsert({ where: { id: 'sample-consultation' }, update: {}, create: { id: 'sample-consultation', name: 'Sample consultation', description: 'Fictional setup fixture only.', durationMinutes: 30, priceCents: 4500 } }),
  ]);
  console.log('Synthetic client/service fixtures ready. Repeated seed preserves existing records.');
} catch {
  console.error('Local seed failed. Check the local service and applied migrations; connection details are not logged.');
  process.exitCode = 1;
} finally { await db.$disconnect(); }
