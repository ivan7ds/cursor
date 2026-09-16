'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.join(__dirname, '../..')
const LOG_DAY = path.join(ROOT, 'fitness-agent/scripts/log-day.js')
const ANALYZE = path.join(ROOT, 'fitness-agent/scripts/analyze.js')
const EXAMPLE = path.join(ROOT, 'fitness-agent/data/ejemplos/2026-09-14.json')

describe('fitness-agent scripts', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'fitness-agent-'))
  const dataDir = path.join(ROOT, 'fitness-agent/data/diario')
  const testDate = '2099-01-15'
  const outFile = path.join(dataDir, `${testDate}.json`)

  afterAll(() => {
    if (fs.existsSync(outFile)) fs.unlinkSync(outFile)
    fs.rmSync(tmpHome, { recursive: true, force: true })
  })

  test('log-day guarda y valida un registro', () => {
    const patch = {
      peso_kg: 74.5,
      ayuno: { horas: 16, protocolo: '16:8' },
      alimentacion: {
        kcal_totales: 2000,
        macros_g: { carbohidratos: 200, proteinas: 150, grasas: 60 }
      }
    }
    const result = spawnSync(
      process.execPath,
      [LOG_DAY, '--date', testDate],
      { input: JSON.stringify(patch), encoding: 'utf8' }
    )
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/Guardado/)
    expect(fs.existsSync(outFile)).toBe(true)

    const saved = JSON.parse(fs.readFileSync(outFile, 'utf8'))
    expect(saved.fecha).toBe(testDate)
    expect(saved.peso_kg).toBe(74.5)
    expect(saved.alimentacion.macros_pct.proteinas).toBeGreaterThan(0)

    const check = spawnSync(
      process.execPath,
      [LOG_DAY, '--check', testDate],
      { encoding: 'utf8' }
    )
    expect(check.status).toBe(0)
    expect(check.stdout).toMatch(/^OK/)
  })

  test('analyze produce resumen con ejemplos copiados', () => {
    const diarioDir = path.join(ROOT, 'fitness-agent/data/diario')
    const copy = path.join(diarioDir, '2026-09-14.json')
    fs.copyFileSync(EXAMPLE, copy)

    const result = spawnSync(
      process.execPath,
      [ANALYZE, '--dias', '30', '--json'],
      { encoding: 'utf8' }
    )
    if (fs.existsSync(copy)) fs.unlinkSync(copy)

    expect(result.status).toBe(0)
    const report = JSON.parse(result.stdout)
    expect(report.ventana.registros).toBeGreaterThanOrEqual(1)
    expect(Array.isArray(report.hallazgos)).toBe(true)
  })
})
