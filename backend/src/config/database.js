import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isTest = process.env.NODE_ENV === 'test';
const storage = isTest ? ':memory:' : path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
  ...(isTest && { pool: { max: 1, min: 1, acquire: 30000, idle: 10000 } }),
});

export default sequelize;
