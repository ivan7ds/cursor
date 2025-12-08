/**
 * Helper para manejo de base de datos en tests
 */

const { sequelize } = require('../../src/database/connection');

/**
 * Limpia todas las tablas de la base de datos de test
 * IMPORTANTE: Solo usar en entorno de test
 */
async function cleanDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanDatabase solo puede usarse en entorno de test');
  }

  try {
    // Obtener todas las tablas
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT IN ('spatial_ref_sys')
    `);

    // Desactivar foreign keys temporalmente
    await sequelize.query('SET session_replication_role = replica;');

    // Limpiar cada tabla
    for (const table of tables) {
      await sequelize.query(`TRUNCATE TABLE "${table.tablename}" CASCADE;`);
    }

    // Reactivar foreign keys
    await sequelize.query('SET session_replication_role = DEFAULT;');
  } catch (error) {
    console.error('Error limpiando base de datos:', error);
    throw error;
  }
}

/**
 * Cierra la conexión a la base de datos
 */
async function closeDatabase() {
  await sequelize.close();
}

/**
 * Sincroniza las tablas (útil para tests de integración)
 * @param {boolean} force - Si es true, fuerza la recreación de tablas
 */
async function syncDatabase(force = false) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('syncDatabase solo puede usarse en entorno de test');
  }

  try {
    await sequelize.sync({ force });
  } catch (error) {
    console.error('Error sincronizando base de datos:', error);
    throw error;
  }
}

module.exports = {
  cleanDatabase,
  closeDatabase,
  syncDatabase,
  sequelize
};

