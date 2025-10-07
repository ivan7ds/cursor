#!/usr/bin/env node

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 OCPI API Logs Viewer');
console.log('========================\n');

function showMenu() {
  console.log('Opciones disponibles:');
  console.log('1. 📊 Ver logs de los últimos 5 minutos');
  console.log('2. 📊 Ver logs de los últimos 10 minutos');
  console.log('3. 📊 Ver logs de los últimos 30 minutos');
  console.log('4. 🚀 Ver solo peticiones API entrantes');
  console.log('5. 📤 Ver solo respuestas API salientes');
  console.log('6. 🔐 Ver solo logs de autenticación');
  console.log('7. ❌ Ver solo errores (4xx, 5xx)');
  console.log('8. ✅ Ver solo respuestas exitosas (2xx)');
  console.log('9. 🔍 Buscar por texto específico');
  console.log('10. 📋 Ver logs en tiempo real (follow)');
  console.log('0. 🚪 Salir');
  console.log('');
}

function executeCommand(command, description) {
  console.log(`\n${description}...\n`);
  console.log('─'.repeat(50));
  
  const child = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️  Stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(stdout);
    }
    console.log('─'.repeat(50));
    showMenu();
    askForOption();
  });
}

function viewLogs(minutes, description) {
  const command = `docker logs cursor-app-1 --since "${minutes}m"`;
  executeCommand(command, description);
}

function viewApiRequests() {
  const command = `docker logs cursor-app-1 --since "10m" | grep -E "(API Request Incoming|🚀)" | head -20`;
  executeCommand(command, 'Mostrando peticiones API entrantes');
}

function viewApiResponses() {
  const command = `docker logs cursor-app-1 --since "10m" | grep -E "(API Response Outgoing|📤)" | head -20`;
  executeCommand(command, 'Mostrando respuestas API salientes');
}

function viewAuthLogs() {
  const command = `docker logs cursor-app-1 --since "10m" | grep -E "(Authentication|🔐|WARN.*token|Invalid token)" | head -20`;
  executeCommand(command, 'Mostrando logs de autenticación');
}

function viewErrors() {
  const command = `docker logs cursor-app-1 --since "10m" | grep -E "(4[0-9][0-9]|5[0-9][0-9]|ERROR|WARN|❌)" | head -20`;
  executeCommand(command, 'Mostrando solo errores');
}

function viewSuccess() {
  const command = `docker logs cursor-app-1 --since "10m" | grep -E "(2[0-9][0-9]|✅|Success|OK)" | head -20`;
  executeCommand(command, 'Mostrando solo respuestas exitosas');
}

function searchLogs() {
  rl.question('🔍 Ingresa el texto a buscar: ', (searchTerm) => {
    if (searchTerm.trim()) {
      const command = `docker logs cursor-app-1 --since "30m" | grep -i "${searchTerm}" | head -30`;
      executeCommand(command, `Buscando: "${searchTerm}"`);
    } else {
      console.log('❌ Texto de búsqueda no puede estar vacío');
      showMenu();
      askForOption();
    }
  });
}

function followLogs() {
  console.log('\n📋 Siguiendo logs en tiempo real... (Ctrl+C para salir)\n');
  console.log('─'.repeat(50));
  
  const child = exec('docker logs cursor-app-1 -f', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  });
  
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  
  // Manejar Ctrl+C
  process.on('SIGINT', () => {
    child.kill();
    console.log('\n\n🔄 Volviendo al menú principal...\n');
    showMenu();
    askForOption();
  });
}

function askForOption() {
  rl.question('Selecciona una opción (0-10): ', (answer) => {
    const option = parseInt(answer);
    
    switch (option) {
      case 1:
        viewLogs('5', 'Mostrando logs de los últimos 5 minutos');
        break;
      case 2:
        viewLogs('10', 'Mostrando logs de los últimos 10 minutos');
        break;
      case 3:
        viewLogs('30', 'Mostrando logs de los últimos 30 minutos');
        break;
      case 4:
        viewApiRequests();
        break;
      case 5:
        viewApiResponses();
        break;
      case 6:
        viewAuthLogs();
        break;
      case 7:
        viewErrors();
        break;
      case 8:
        viewSuccess();
        break;
      case 9:
        searchLogs();
        break;
      case 10:
        followLogs();
        return; // No mostrar menú aquí
      case 0:
        console.log('👋 ¡Hasta luego!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Opción no válida. Por favor selecciona 0-10.');
        showMenu();
        askForOption();
        break;
    }
  });
}

// Función principal
function main() {
  showMenu();
  askForOption();
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

// Iniciar la aplicación
main();
