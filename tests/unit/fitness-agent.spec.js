'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.join(__dirname, '../..')
const LOG_DAY = path.join(ROOT, 'fitness-agent/scripts/log-day.js')
const LOG_MEDIDAS = path.join(ROOT, 'fitness-agent/scripts/log-medidas.js')
const ANALYZE = path.join(ROOT, 'fitness-agent/scripts/analyze.js')
const STATUS = path.join(ROOT, 'fitness-agent/scripts/status.js')
const EXAMPLE = path.join(ROOT, 'fitness-agent/data/ejemplos/2026-09-14.json')
const EJ_MED_1 = path.join(ROOT, 'fitness-agent/data/ejemplos/medidas-2026-09-08.json')
const EJ_MED_2 = path.join(ROOT, 'fitness-agent/data/ejemplos/medidas-2026-09-15.json')

const SAMPLE_TEXT = `Hoy 75.2 kg. Ayuno 16h (20:00–12:00).
Entreno: press banca 4x8 @60kg, sentadilla 4x6 @80kg, 45 min fuerza RPE 7.
Comida: avena+proteína 450kcal; pollo arroz brócoli 700kcal; yogur 200kcal.
Total ~2100 kcal, P 160 C 200 G 60.
Deposiciones: 08:30 Bristol 4.`

describe('fitness-agent scripts', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'fitness-agent-'))
  const diarioDir = path.join(ROOT, 'fitness-agent/data/diario')
  const medidasDir = path.join(ROOT, 'fitness-agent/data/medidas')
  const testDate = '2099-01-15'
  const textDate = '2099-03-01'
  const medDate = '2099-01-20'
  const outFile = path.join(diarioDir, `${testDate}.json`)
  const textFile = path.join(diarioDir, `${textDate}.json`)
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
    if (fs.existsSync(textFile)) fs.unlinkSync(textFile)
    if (fs.existsSync(medFile)) fs.unlinkSync(medFile)
    fs.rmSync(tmpHome, { recursive: true, force: true })
  })

  test('log-day guarda y valida un registro JSON', () => {
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

  test('log-day --text parsea el ejemplo de AGENTS.md', () => {
    const result = spawnSync(
      process.execPath,
      [LOG_DAY, '--date', textDate, '--text', SAMPLE_TEXT],
      { encoding: 'utf8' }
    )
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/Guardado/)
    const saved = JSON.parse(fs.readFileSync(textFile, 'utf8'))
    expect(saved.peso_kg).toBe(75.2)
    expect(saved.ayuno.horas).toBe(16)
    expect(saved.alimentacion.kcal_totales).toBe(2100)
    expect(saved.alimentacion.macros_g.proteinas).toBe(160)
    expect(saved.alimentacion.macros_g.carbohidratos).toBe(200)
    expect(saved.alimentacion.macros_g.grasas).toBe(60)
    expect(saved.defecaciones[0].bristol).toBe(4)
    expect(saved.ejercicios.length).toBeGreaterThanOrEqual(1)
    expect(saved.alimentacion.comidas.length).toBe(3)
  })

  test('log-medidas guarda y compara con medición previa', () => {
    const prev = track(path.join(medidasDir, '2099-01-13.json'))
    const prevData = JSON.parse(fs.readFileSync(EJ_MED_1, 'utf8'))
    prevData.fecha = '2099-01-13'
    fs.writeFileSync(prev, JSON.stringify(prevData, null, 2))
    const result = spawnSync(
      process.execPath,
      [LOG_MEDIDAS, '--date', medDate, '--text', 'peso 74.9 kg, cintura 82, pecho 100'],
      { encoding: 'utf8' }
    )
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/Guardado/)
    expect(result.stdout).toMatch(/Comparación/)
    expect(fs.existsSync(medFile)).toBe(true)
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
    const match = saveResult.stdout.match(/Guardado:\s*(.+\.md)/)
    expect(match).toBeTruthy()
    track(match[1].trim())
  })

  test('status responde sin error', () => {
    const result = spawnSync(process.execPath, [STATUS], { encoding: 'utf8' })
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/Estado del agente fitness/)
  })
})
