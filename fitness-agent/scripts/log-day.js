#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data', 'diario')
const TEMPLATE = path.join(ROOT, 'templates', 'diario.json')

function usage () {
  console.log(`Uso:
  node fitness-agent/scripts/log-day.js --date YYYY-MM-DD --file entrada.json
  node fitness-agent/scripts/log-day.js --date YYYY-MM-DD   # lee JSON por stdin
  node fitness-agent/scripts/log-day.js --check YYYY-MM-DD
`)
}

function parseArgs (argv) {
  const args = { date: null, file: null, check: null }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--date') args.date = argv[++i]
    else if (a === '--file') args.file = argv[++i]
    else if (a === '--check') args.check = argv[++i]
    else if (a === '--help' || a === '-h') args.help = true
  }
  return args
}

function todayISO () {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ensureDir (dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function readJson (file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson (file, data) {
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function deepMerge (base, patch) {
  if (patch === null || patch === undefined) return base
  if (Array.isArray(patch)) return patch.slice()
  if (typeof patch !== 'object') return patch
  const out = (base && typeof base === 'object' && !Array.isArray(base)) ? { ...base } : {}
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(out[k], v)
    } else {
      out[k] = Array.isArray(v) ? v.slice() : v
    }
  }
  return out
}

function calcMacroPct (macrosG) {
  if (!macrosG) return null
  const c = Number(macrosG.carbohidratos) || 0
  const p = Number(macrosG.proteinas) || 0
  const g = Number(macrosG.grasas) || 0
  const kcal = c * 4 + p * 4 + g * 9
  if (kcal <= 0) return null
  return {
    carbohidratos: Math.round((c * 4 / kcal) * 1000) / 10,
    proteinas: Math.round((p * 4 / kcal) * 1000) / 10,
    grasas: Math.round((g * 9 / kcal) * 1000) / 10
  }
}

function validateDay (day) {
  const errors = []
  if (!day.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(day.fecha)) {
    errors.push('fecha debe ser YYYY-MM-DD')
  }
  if (day.peso_kg != null && (typeof day.peso_kg !== 'number' || day.peso_kg < 20 || day.peso_kg > 400)) {
    errors.push('peso_kg fuera de rango')
  }
  if (day.defecaciones) {
    for (const d of day.defecaciones) {
      if (d.bristol != null && (d.bristol < 1 || d.bristol > 7)) {
        errors.push('bristol debe estar entre 1 y 7')
      }
    }
  }
  if (day.alimentacion?.macros_g) {
    for (const k of ['carbohidratos', 'proteinas', 'grasas', 'fibra']) {
      const v = day.alimentacion.macros_g[k]
      if (v != null && (typeof v !== 'number' || v < 0)) errors.push(`macros_g.${k} inválido`)
    }
  }
  return errors
}

function dayPath (fecha) {
  return path.join(DATA_DIR, `${fecha}.json`)
}

function loadOrTemplate (fecha) {
  const p = dayPath(fecha)
  if (fs.existsSync(p)) return readJson(p)
  const t = readJson(TEMPLATE)
  t.fecha = fecha
  return t
}

function summarize (day) {
  const ej = (day.ejercicios || []).length
  const com = (day.alimentacion?.comidas || []).length
  const def = (day.defecaciones || []).length
  const lines = [
    `Fecha: ${day.fecha}`,
    `Peso: ${day.peso_kg ?? '—'} kg`,
    `Ayuno: ${day.ayuno?.horas ?? '—'} h (${day.ayuno?.protocolo ?? '—'})`,
    `Ejercicios: ${ej}`,
    `Comidas: ${com}`,
    `Kcal: ${day.alimentacion?.kcal_totales ?? '—'}`,
    `Macros g: C${day.alimentacion?.macros_g?.carbohidratos ?? '—'} P${day.alimentacion?.macros_g?.proteinas ?? '—'} G${day.alimentacion?.macros_g?.grasas ?? '—'}`,
    `Defecaciones: ${def}`
  ]
  return lines.join('\n')
}

function main () {
  const args = parseArgs(process.argv)
  if (args.help) {
    usage()
    process.exit(0)
  }

  if (args.check) {
    const p = dayPath(args.check)
    if (!fs.existsSync(p)) {
      console.error(`No existe ${p}`)
      process.exit(1)
    }
    const day = readJson(p)
    const errors = validateDay(day)
    if (errors.length) {
      console.error('Validación fallida:')
      errors.forEach(e => console.error(' -', e))
      process.exit(1)
    }
    console.log('OK\n' + summarize(day))
    process.exit(0)
  }

  const fecha = args.date || todayISO()
  let patch
  if (args.file) {
    patch = readJson(path.resolve(args.file))
  } else if (!process.stdin.isTTY) {
    const raw = fs.readFileSync(0, 'utf8').trim()
    if (!raw) {
      console.error('stdin vacío')
      process.exit(1)
    }
    patch = JSON.parse(raw)
  } else {
    usage()
    process.exit(1)
  }

  const base = loadOrTemplate(fecha)
  const merged = deepMerge(base, patch)
  merged.fecha = fecha
  merged.actualizado_en = new Date().toISOString()

  if (merged.alimentacion?.macros_g) {
    const pct = calcMacroPct(merged.alimentacion.macros_g)
    if (pct) {
      merged.alimentacion.macros_pct = {
        ...(merged.alimentacion.macros_pct || {}),
        ...pct
      }
    }
  }

  const errors = validateDay(merged)
  if (errors.length) {
    console.error('Validación fallida:')
    errors.forEach(e => console.error(' -', e))
    process.exit(1)
  }

  const out = dayPath(fecha)
  writeJson(out, merged)
  console.log(`Guardado: ${out}`)
  console.log(summarize(merged))
}

main()
