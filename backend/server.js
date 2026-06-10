import 'dotenv/config';
import app from './app.js';
import { sequelize } from './src/models/index.js';

const PORT = process.env.PORT || 3001;

async function start() {
  await sequelize.sync({ alter: true });
  console.log('Base de datos sincronizada');
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

start().catch(console.error);
