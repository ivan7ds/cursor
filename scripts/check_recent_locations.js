#!/usr/bin/env node

/**
 * Script para verificar las locations más recientes y si se enviaron notificaciones
 */

require('dotenv').config();
const { sequelize } = require('../src/database/connection');
const logger = require('../src/utils/logger');

async function checkRecentLocations() {
    try {
        console.log('🔍 Verificando locations recientes...\n');
        
        // Obtener las 5 locations más recientes
        const [locations] = await sequelize.query(`
            SELECT 
                id,
                name,
                party_id,
                country_code,
                created_at,
                last_updated
            FROM locations
            ORDER BY created_at DESC
            LIMIT 5
        `, {
            type: sequelize.QueryTypes.SELECT
        });
        
        const locationsArray = Array.isArray(locations) ? locations : (locations[0] || []);
        
        console.log(`📊 Locations encontradas: ${locationsArray.length}\n`);
        
        if (locationsArray.length === 0) {
            console.log('⚠️ No hay locations en la base de datos.\n');
            return;
        }
        
        console.log('📋 Locations más recientes:');
        console.log('─'.repeat(100));
        locationsArray.forEach((loc, index) => {
            const createdDate = new Date(loc.created_at);
            const updatedDate = new Date(loc.last_updated);
            const timeAgo = Math.floor((Date.now() - createdDate.getTime()) / 1000 / 60); // minutos
            
            console.log(`${index + 1}. ${loc.name || loc.id} (ID: ${loc.id})`);
            console.log(`   Party ID: ${loc.party_id}, Country: ${loc.country_code}`);
            console.log(`   Creada: ${createdDate.toLocaleString()} (hace ${timeAgo} minutos)`);
            console.log(`   Actualizada: ${updatedDate.toLocaleString()}`);
            console.log('');
        });
        
        // Buscar específicamente la location "other"
        const [otherLocation] = await sequelize.query(`
            SELECT 
                id,
                name,
                party_id,
                country_code,
                created_at,
                last_updated
            FROM locations
            WHERE LOWER(name) = 'other' OR LOWER(id) = 'other'
            ORDER BY created_at DESC
            LIMIT 1
        `, {
            type: sequelize.QueryTypes.SELECT
        });
        
        const otherLoc = Array.isArray(otherLocation) ? (otherLocation[0] || null) : (otherLocation || null);
        
        if (otherLoc) {
            console.log('─'.repeat(100));
            console.log(`\n✅ Location "other" encontrada:`);
            console.log(`   ID: ${otherLoc.id}`);
            console.log(`   Nombre: ${otherLoc.name}`);
            console.log(`   Party ID: ${otherLoc.party_id}`);
            console.log(`   Country: ${otherLoc.country_code}`);
            console.log(`   Creada: ${new Date(otherLoc.created_at).toLocaleString()}`);
            console.log(`   Actualizada: ${new Date(otherLoc.last_updated).toLocaleString()}\n`);
        } else {
            console.log('─'.repeat(100));
            console.log(`\n⚠️ No se encontró una location con nombre o ID "other"\n`);
        }
        
    } catch (error) {
        console.error('❌ Error verificando locations:', error);
        logger.error('Error verificando locations:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar el script
checkRecentLocations()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Error ejecutando verificación:', error);
        process.exit(1);
    });

