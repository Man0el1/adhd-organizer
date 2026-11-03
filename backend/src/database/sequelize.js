import { Sequelize } from 'sequelize';
import config from '../../config/config.cjs';

const hasPostgresConfig = Boolean(
  process.env.DATABASE_URL ||
  (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
);

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: { require: true, rejectUnauthorized: false }
    } : {}
  });
} else if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: { require: true, rejectUnauthorized: false }
      } : {}
    }
  );
} else {
  sequelize = new Sequelize(config.development || {
    dialect: 'postgres',
    logging: false
  });
}

let isConnected = null;

/**
 * Retorna true se as variáveis do PostgreSQL estiverem configuradas
 * e a conexão com o banco relacional estiver ativa.
 */
export const isDatabaseConnected = async () => {
  if (!hasPostgresConfig) {
    return false;
  }
  if (isConnected !== null) {
    return isConnected;
  }
  try {
    await sequelize.authenticate();
    isConnected = true;
    console.log('✅ PostgreSQL conectado via Sequelize com sucesso.');
  } catch (err) {
    console.warn('⚠️ PostgreSQL configurado mas inacessível no momento. Usando fallback:', err.message);
    isConnected = false;
  }
  return isConnected;
};

export default sequelize;
