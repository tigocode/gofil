import mysql from 'mysql2/promise';

const connectionConfig = {
  host: process.env.TIDB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER || '3LWPSrGCXLpKVj9.root',
  password: process.env.TIDB_PASSWORD || 'Wh3MlwrXLwbBDDIS',
  database: process.env.TIDB_DATABASE || 'test',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

export async function query(sql: string, params?: any[]) {
  const connection = await mysql.createConnection(connectionConfig);
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    await connection.end();
  }
}

// Para manter compatibilidade com o código que usa .prepare().all() ou .run(),
// vamos precisar ajustar as rotas, pois o mysql2 é assíncrono.
export default { query };
