import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_STORAGE_PATH = path.join(__dirname, '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_STORAGE_PATH,
  logging: false,
});

async function run() {
  try {
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