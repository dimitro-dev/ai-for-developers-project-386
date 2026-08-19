// Раннер миграций (Р6): SQL-файлы каталога `migrations/`, учёт применённых — в самой базе.
// Направление forward-only: откат — новая корректирующая миграция, парных down-скриптов нет.

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Pool, PoolClient } from 'pg';

// Путь считается от этого файла, а не от `cwd`: локально раннер зовут из корня репозитория
// или из зоны, в образе процесс стартует из третьего каталога — относительный путь разъехался бы.
export const MIGRATIONS_DIR = fileURLToPath(new URL('../migrations', import.meta.url));

// Произвольная константа, общая для всех процессов: советующая блокировка выстраивает
// параллельные старты в очередь, иначе два инстанса применили бы одну миграцию одновременно.
const ADVISORY_LOCK_KEY = 4021837154;

export interface MigrationResult {
  /** Имена файлов, применённых этим прогоном; повторный прогон возвращает пустой список. */
  applied: string[];
}

export async function runMigrations(pool: Pool): Promise<MigrationResult> {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_KEY]);
    // Снятие блокировки — во внутреннем finally: во внешнем оно затёрло бы своей ошибкой
    // ту, из-за которой блокировку не удалось взять.
    try {
      await client.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
           name text PRIMARY KEY,
           applied_at timestamptz NOT NULL DEFAULT now()
         )`,
      );
      const done = await client.query<{ name: string }>('SELECT name FROM schema_migrations');
      const alreadyApplied = new Set(done.rows.map((row) => row.name));

      const applied: string[] = [];
      for (const name of await listMigrationFiles()) {
        if (alreadyApplied.has(name)) continue;
        await applyMigration(client, name);
        applied.push(name);
      }
      return { applied };
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]);
    }
  } finally {
    client.release();
  }
}

async function listMigrationFiles(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  // Номер в имени файла дополнен нулями до трёх знаков, поэтому порядок строк —
  // это и есть порядок применения.
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

async function applyMigration(client: PoolClient, name: string): Promise<void> {
  const sql = await readFile(join(MIGRATIONS_DIR, name), 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    // Сообщение PostgreSQL не называет файл, а прогон видно только по логу старта.
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Migration "${name}" failed: ${reason}`, { cause: error });
  }
}
