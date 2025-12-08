#!/usr/bin/env node
/**
 * Script para dividir app.js en módulos
 * Basado en las secciones identificadas en el archivo
 */

const fs = require('fs')
const path = require('path')

const APP_JS_PATH = path.join(__dirname, '../src/public/app.js')
const OUTPUT_DIR = path.join(__dirname, '../src/public/js/modules')
const BACKUP_DIR = path.join(__dirname, '../src/public')

// Secciones identificadas en el archivo
const SECTIONS = [
  {
    name: 'handshake',
    startLine: 1251,
    endLine: 1749,
    className: 'HandshakeModule',
    description: 'Funciones de Handshake OCPI'
  },
  {
    name: 'logs',
    startLine: 1750,
    endLine: 2254,
    className: 'LogsModule',
    description: 'Gestión de Logs'
  },
  {
    name: 'dataLoading',
    startLine: 2255,
    endLine: 2373,
    className: 'DataLoadingModule',
    description: 'Carga de Datos'
  },
  {
    name: 'evseStatus',
    startLine: 2374,
    endLine: 3089,
    className: 'EVSEStatusModule',
    description: 'Funcionalidad de Cambio de Estado EVSE'
  },
  {
    name: 'locationsPagination',
    startLine: 3090,
    endLine: 4036,
    className: 'LocationsPaginationModule',
    description: 'Paginación de Locations'
  },
  {
    name: 'emsp',
    startLine: 4037,
    endLine: 5311,
    className: 'EMSPModule',
    description: 'Funciones EMSP'
  },
  {
    name: 'tariffs',
    startLine: 5312,
    endLine: 5399,
    className: 'TariffsModule',
    description: 'Funciones del Modal de Creación de Tarifas'
  },
  {
    name: 'locations',
    startLine: 5400,
    endLine: 5756,
    className: 'LocationsModule',
    description: 'Funciones del Modal de Creación de Locations'
  },
  {
    name: 'evses',
    startLine: 5757,
    endLine: 6451,
    className: 'EVSEsModule',
    description: 'Funciones del Modal de Creación de EVSEs'
  },
  {
    name: 'evseDelete',
    startLine: 6452,
    endLine: 6640,
    className: 'EVSEDeleteModule',
    description: 'Funciones de Borrado de EVSEs'
  },
  {
    name: 'evseEdit',
    startLine: 6641,
    endLine: 7419,
    className: 'EVSEEditModule',
    description: 'Funciones de Edición de EVSEs'
  },
  {
    name: 'locationEdit',
    startLine: 7420,
    endLine: 7772,
    className: 'LocationEditModule',
    description: 'Funciones de Edición de Locations'
  },
  {
    name: 'locationDelete',
    startLine: 7773,
    endLine: 8995,
    className: 'LocationDeleteModule',
    description: 'Funciones de Borrado de Locations'
  },
  {
    name: 'tokens',
    startLine: 8996,
    endLine: 9637,
    className: 'TokensModule',
    description: 'Funciones del Modal de Creación de Tokens'
  },
  {
    name: 'cpo',
    startLine: 9638,
    endLine: 11101,
    className: 'CPOModule',
    description: 'Funciones para Consultar CPOs (Rol EMSP)'
  },
  {
    name: 'extSessions',
    startLine: 11102,
    endLine: 13633,
    className: 'ExtSessionsModule',
    description: 'Métodos para Sesiones Externas'
  }
]

function extractSection (content, startLine, endLine) {
  const lines = content.split('\n')
  return lines.slice(startLine - 1, endLine).join('\n')
}

function createModuleTemplate (section, code) {
  return `/**
 * ${section.description}
 * Extraído de app.js (líneas ${section.startLine}-${section.endLine})
 */

export class ${section.className} {
  constructor (app) {
    this.app = app
    this.baseUrl = app.baseUrl
  }

${code}
}
`
}

function main () {
  console.log('📦 Iniciando división de app.js en módulos...')

  // Leer el archivo original
  if (!fs.existsSync(APP_JS_PATH)) {
    console.error(`❌ No se encontró el archivo: ${APP_JS_PATH}`)
    process.exit(1)
  }

  const content = fs.readFileSync(APP_JS_PATH, 'utf8')
  const lines = content.split('\n')
  console.log(`📄 Archivo original: ${lines.length} líneas`)

  // Crear directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`📁 Directorio creado: ${OUTPUT_DIR}`)
  }

  // Crear backup del archivo original
  const backupPath = path.join(BACKUP_DIR, 'app.js.backup')
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(APP_JS_PATH, backupPath)
    console.log(`💾 Backup creado: ${backupPath}`)
  }

  // Extraer cada sección
  let extractedLines = 0
  SECTIONS.forEach(section => {
    try {
      const sectionCode = extractSection(content, section.startLine, section.endLine)
      const moduleCode = createModuleTemplate(section, sectionCode)
      const outputPath = path.join(OUTPUT_DIR, `${section.name}.js`)

      fs.writeFileSync(outputPath, moduleCode, 'utf8')
      extractedLines += (section.endLine - section.startLine + 1)
      console.log(`✅ Módulo creado: ${section.name}.js (${section.endLine - section.startLine + 1} líneas)`)
    } catch (error) {
      console.error(`❌ Error extrayendo sección ${section.name}:`, error.message)
    }
  })

  console.log(`\n📊 Resumen:`)
  console.log(`   - Módulos creados: ${SECTIONS.length}`)
  console.log(`   - Líneas extraídas: ${extractedLines}`)
  console.log(`   - Líneas restantes en app.js: ${lines.length - extractedLines}`)
  console.log(`\n✅ División completada!`)
  console.log(`\n⚠️  NOTA: Los módulos extraídos necesitan ser ajustados manualmente para:`)
  console.log(`   1. Convertir métodos de clase a métodos del módulo`)
  console.log(`   2. Ajustar referencias a 'this'`)
  console.log(`   3. Importar utilidades comunes`)
  console.log(`   4. Integrar con el app.js principal`)
}

if (require.main === module) {
  main()
}

module.exports = { SECTIONS, extractSection, createModuleTemplate }

