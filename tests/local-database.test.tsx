import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { assertLocalDatabase } from '../scripts/local-database.mjs';
describe('Aurelle development database boundary', () => {
  it('allows only its dedicated loopback PostgreSQL database', () => {
    expect(assertLocalDatabase('postgresql://localhost:5432/aurelle_dev?schema=public')).toContain('aurelle_dev');
    for (const url of ['postgresql://remote.example/aurelle_dev', 'postgresql://localhost/production', 'file:./dev.db', 'postgresql://localhost/aurelle_dev?host=remote.example']) {
      expect(() => assertLocalDatabase(url)).toThrow();
    }
  });
  it('keeps an additive initial migration and synthetic idempotent seed', () => {
    const sql = readFileSync('prisma/migrations/202610280001_initial/migration.sql', 'utf8');
    expect(sql).toContain('CREATE TABLE "Appointment"');
    expect(sql).toContain('FOREIGN KEY'); expect(sql).not.toMatch(/DROP TABLE|TRUNCATE/);
    const seed = readFileSync('scripts/seed-local.mjs', 'utf8');
    expect(seed).toContain('upsert'); expect(seed).toContain('example.com'); expect(seed).not.toContain('deleteMany');
  });
});
