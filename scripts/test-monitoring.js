#!/usr/bin/env node

/**
 * Script de prueba para el sistema de monitoreo de tests
 * Simula errores en los jobs para probar la funcionalidad de la pestaña Test
 */

const axios = require('axios');

const BASE_URL = process.env.OCPI_BASE_URL || 'http://localhost:3000';

async function testMonitoringAPI() {
    console.log('🧪 Iniciando pruebas del sistema de monitoreo...\n');
    
    try {
        // 1. Probar endpoint de estado
        console.log('1️⃣ Probando endpoint de estado...');
        const statusResponse = await axios.get(`${BASE_URL}/api/test-monitoring/status`);
        console.log('✅ Estado obtenido:', statusResponse.data);
        
        // 2. Simular algunos errores
        console.log('\n2️⃣ Simulando errores de jobs...');
        
        const testErrors = [
            {
                service: 'EVSE Notification Service',
                message: 'Error de conexión con eMSP TEST-001',
                level: 'error'
            },
            {
                service: 'Charging Notification Service',
                message: 'Timeout al actualizar sesión 12345',
                level: 'warning'
            },
            {
                service: 'EVSE Notification Service',
                message: 'Error de autenticación con token expirado',
                level: 'error'
            }
        ];
        
        for (const error of testErrors) {
            try {
                const errorResponse = await axios.post(`${BASE_URL}/api/test-monitoring/errors`, error);
                console.log(`✅ Error registrado: ${error.service} - ${error.message}`);
            } catch (err) {
                console.error(`❌ Error registrando error: ${err.message}`);
            }
        }
        
        // 3. Probar endpoint de errores
        console.log('\n3️⃣ Obteniendo errores registrados...');
        const errorsResponse = await axios.get(`${BASE_URL}/api/test-monitoring/errors`);
        console.log('✅ Errores obtenidos:', errorsResponse.data);
        
        // 4. Simular resultados de pruebas
        console.log('\n4️⃣ Simulando resultados de pruebas...');
        
        const testResults = [
            {
                testName: 'Test de conexión EVSE',
                status: 'passed',
                message: 'Conexión establecida correctamente',
                duration: 1500
            },
            {
                testName: 'Test de notificación eMSP',
                status: 'failed',
                message: 'Timeout en notificación',
                duration: 5000
            },
            {
                testName: 'Test de actualización de sesión',
                status: 'running',
                message: 'Ejecutando actualización...',
                duration: 0
            }
        ];
        
        for (const result of testResults) {
            try {
                const resultResponse = await axios.post(`${BASE_URL}/api/test-monitoring/test-result`, result);
                console.log(`✅ Resultado registrado: ${result.testName} - ${result.status}`);
            } catch (err) {
                console.error(`❌ Error registrando resultado: ${err.message}`);
            }
        }
        
        // 5. Verificar estado final
        console.log('\n5️⃣ Verificando estado final...');
        const finalStatusResponse = await axios.get(`${BASE_URL}/api/test-monitoring/status`);
        console.log('✅ Estado final:', finalStatusResponse.data);
        
        console.log('\n🎉 Pruebas completadas exitosamente!');
        console.log('\n📋 Instrucciones:');
        console.log('1. Abre el navegador en http://localhost:3000');
        console.log('2. Ve a la pestaña "Test"');
        console.log('3. Verifica que se muestren los errores y estadísticas simuladas');
        console.log('4. Usa los botones para limpiar errores y actualizar estado');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.data);
        }
    }
}

// Ejecutar las pruebas
testMonitoringAPI();

