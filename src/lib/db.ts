import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { env } from './env';

type QueryParams = (string | number | boolean | null | Date | Buffer)[];

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env('DB_HOST', 'localhost'),
      user: env('DB_USER', 'cross_user'),
      password: env('DB_PASSWORD', env('DB_PASS', '')),
      database: env('DB_NAME', 'crosslife'),
      charset: env('DB_CHARSET', 'utf8mb4'),
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+03:00',
    });
  }
  return pool;
}

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: QueryParams = []
): Promise<T> {
  const [rows] = await getPool().execute<T>(sql, params);
  return rows;
}

export async function execute(
  sql: string,
  params: QueryParams = []
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}
