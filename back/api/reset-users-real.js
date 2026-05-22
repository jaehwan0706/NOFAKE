import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from back/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "sqlite",
  storage: process.env.DB_DIALECT === "mysql" ? undefined : path.join(__dirname, '..', 'database.sqlite'),
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
});

async function run() {
  try {
    console.log(`Using dialect: ${process.env.DB_DIALECT || 'sqlite'}`);
    if (process.env.DB_HOST) {
      console.log(`Connecting to host: ${process.env.DB_HOST}`);
    }

    await sequelize.query('DELETE FROM Users');
    await sequelize.query('DELETE FROM PhoneVerificationSessions');
    console.log('✅ DB 초기화 완료 (Users, PhoneVerificationSessions 데이터 삭제)');
    process.exit(0);
  } catch (e) {
    console.error('❌ DB 초기화 실패:', e.message);
    process.exit(1);
  }
}

run();