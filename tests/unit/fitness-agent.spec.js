'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.join(__dirname, '../..')
const LOG_DAY = path.join(ROOT, 'fitness-agent/scripts/log-day.js')
const LOG_MEDIDAS = path.join(ROOT, 'fitness-agent/scripts/log-medidas.js')
const ANALYZE = path.join(ROOT, 'fitness-agent/scripts/analyze.js')
const EXAMPLE = path.join(ROOT, 'fitness-agent/data/ejemplos/2026-09-14.json')
const EJ_MED_1 = path.join(ROOT, 'fitness-agent/data/ejemplos/medidas-2026-09-08.json')
const EJ_MED_2 = path.join(ROOT, 'fitness-agent/data/ejemplos/medidas-2026-09-15.json')

describe('fitness-agent scripts', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'fitness-agent-'))
  const diarioDir = path.join(ROOT, 'fitness-agent/data/diario')
  const medidasDir = path.join(ROOT, 'fitness-agent/data/medidas')
  const resumenesDir = path.join(ROOT, 'fitness-agent/data/resumenes')
  const testDate = '2099-01-15'
  const medDate = '2099-01-20'
  const outFile = path.join(diarioDir, `${testDate}.json`)
  const medFile = path.join(medidasDir, `${medDate}.json`)
  const created = []

  function track (file) {
    created.push(file)
    return file
  }

  afterAll(() => {
    for (const f of created) {
      if (fs.existsSync(f)) fs.unlinkSync(f)
    }
    if (fs.existsSync(outFile)) fs.unlinkSync(outFile)
    if (fs.existsSync(medFile)) fs.unlinkSync(medFile)
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

  test('log-medidas guarda y compara con medición previa', () => {
    const prev = track(path.join(medidasDir, '2099-01-13.json'))
    fs.copyFileSync(EJ_MED_1, prev)
    const patch = {
      peso_kg: 74.9,
      circunferencias_cm: { cintura: 82, pecho: 100 }
    }
    const result = spawnSync(
      process.execPath,
      [LOG_MEDIDAS, '--date', medDate],
      { input: JSON.stringify(patch), encoding: 'utf8' }
    )
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/Guardado/)
    expect(result.stdout).toMatch(/Comparación/)
    expect(fs.existsSync(medFile)).toBe(true)

    const check = spawnSync(
      process.execPath,
      [LOG_MEDIDAS, '--check', medDate],
      { encoding: 'utf8' }
    )
    expect(check.status).toBe(0)
  })

  test('analyze produce resumen y --save escribe informe', () => {
    const copy = track(path.join(diarioDir, '2026-09-14.json'))
    fs.copyFileSync(EXAMPLE, copy)
    const m1 = track(path.join(medidasDir, '2026-09-08.json'))
    const m2 = track(path.join(medidasDir, '2026-09-15.json'))
    fs.copyFileSync(EJ_MED_1, m1)
    fs.copyFileSync(EJ_MED_2, m2)

    const jsonResult = spawnSync(
      process.execPath,
      [ANALYZE, '--dias', '30', '--json'],
      { encoding: 'utf8' }
    )
    expect(jsonResult.status).toBe(0)
    const report = JSON.parse(jsonResult.stdout)
    expect(report.ventana.registros).toBeGreaterThanOrEqual(1)
    expect(Array.isArray(report.hallazgos)).toBe(true)
    expect(report.medidas_delta.length).toBeGreaterThan(0)

    const saveResult = spawnSync(
      process.execPath,
      [ANALYZE, '--dias', '30', '--save'],
      { encoding: 'utf8' }
    )
    expect(saveResult.status).toBe(0)
    expect(saveResult.stdout).toMatch(/Guardado:\s*(.+\.md)/)
    const match = saveResult.stdout.match(/Guardado:\s*(.+\.md)/)
    const savedPath = match[1].trim()
    expect(fs.existsSync(savedPath)).toBe(true)
    track(savedPath)
  })
})
