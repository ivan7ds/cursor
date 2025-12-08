#!/usr/bin/env node

/**
 * Script para verificar qué tablas existen en la base de datos
 */

require('dotenv').config();
const { sequelize } = require('../src/database/connection');

async function checkTables() {
    try {
        console.log('🔍 Verificando tablas en la base de datos...\n');
        
        // Obtener todas las tablas
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `, {
            type: sequelize.QueryTypes.SELECT
        });
        
        const tablesArray = Array.isArray(tables) ? tables : (tables[0] || []);
        
        console.log(`📊 Tablas encontradas: ${tablesArray.length}\n`);
        
        tablesArray.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name}`);
        });
        
        // Verificar si existe la tabla locations
        const hasLocations = tablesArray.some(t => t.table_name === 'locations');
        console.log(`\n${hasLocations ? '✅' : '❌'} Tabla 'locations' existe: ${hasLocations}`);
        
        // Si existe, ver cuántos registros tiene
        if (hasLocations) {
            const [count] = await sequelize.query(`
                SELECT COUNT(*) as count FROM locations
            `, {
                type: sequelize.QueryTypes.SELECT
            });
            
            const countResult = Array.isArray(count) ? count[0] : count;
            console.log(`📊 Registros en 'locations': ${countResult?.count || 0}`);
        }
        
    } catch (error) {
        console.error('❌ Error verificando tablas:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error ejecutando verificación:', error);
        process.exit(1);
    });

