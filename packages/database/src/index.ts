// Публичный вход пакета: потребители импортируют `@minical/database`, не внутренние модули.

export { MIGRATIONS_DIR, runMigrations } from './migrations.ts';
export type { MigrationResult } from './migrations.ts';
