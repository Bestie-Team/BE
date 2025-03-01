import { RawBuilder, sql } from 'kysely';

export function getKyselyUuid(uuid: string): RawBuilder<string> {
  return sql`${uuid}::uuid`;
}
