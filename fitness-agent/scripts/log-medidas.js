#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data', 'medidas')
const TEMPLATE = path.join(ROOT, 'templates', 'medidas-semanales.json')

function usage () {
  console.log(`Uso:
  node fitness-agent/scripts/log-medidas.js --date YYYY-MM-DD --file entrada.json
  node fitness-agent/scripts/log-medidas.js --date YYYY-MM-DD   # JSON por stdin
  node fitness-agent/scripts/log-medidas.js --check YYYY-MM-DD
  node fitness-agent/scripts/log-medidas.js --list
`)
}

function parseArgs (argv) {
  const args = { date: null, file: null, check: null, list: false, help: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--date') args.date = argv[++i]
    else if (a === '--file') args.file = argv[++i]
    else if (a === '--check') args.check = argv[++i]
    else if (a === '--list') args.list = true
    else if (a === '--help' || a === '-h') args.help = true
  }
  return args
}

function todayISO () {
  const d = new Date()
  return d.toISOString().slice(0, 10)
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

function medidasPath (fecha) {
  return path.join(DATA_DIR, `${fecha}.json`)
}

function loadOrTemplate (fecha) {
  const p = medidasPath(fecha)
  if (fs.existsSync(p)) return readJson(p)
  const t = readJson(TEMPLATE)
  t.fecha = fecha
  return t
}

function validate (m) {
  const errors = []
  if (!m.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(m.fecha)) {
    errors.push('fecha debe ser YYYY-MM-DD')
  }
  if (m.peso_kg != null && (typeof m.peso_kg !== 'number' || m.peso_kg < 20 || m.peso_kg > 400)) {
    errors.push('peso_kg fuera de rango')
  }
  if (m.grasa_pct != null && (typeof m.grasa_pct !== 'number' || m.grasa_pct < 1 || m.grasa_pct > 70)) {
    errors.push('grasa_pct fuera de rango')
  }
  const circ = m.circunferencias_cm || {}
  for (const [k, v] of Object.entries(circ)) {
    if (v != null && (typeof v !== 'number' || v <= 0 || v > 300)) {
      errors.push(`circunferencias_cm.${k} inválido`)
    }
  }
  return errors
}

function summarize (m) {
  const c = m.circunferencias_cm || {}
  const parts = Object.entries(c)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => `${k}:${v}`)
  return [
    `Fecha: ${m.fecha}`,
    `Peso: ${m.peso_kg ?? '—'} kg`,
    `Grasa %: ${m.grasa_pct ?? '—'}`,
    `Circunferencias: ${parts.length ? parts.join(', ') : '—'}`
  ].join('\n')
}

function listMedidas () {
  if (!fs.existsSync(DATA_DIR)) return []
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        return readJson(path.join(DATA_DIR, f))
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
}

function main () {
  const args = parseArgs(process.argv)
  if (args.help) {
    usage()
    process.exit(0)
  }

  if (args.list) {
    const all = listMedidas()
    if (!all.length) {
      console.log('Sin medidas registradas.')
      process.exit(0)
    }
    for (const m of all) {
      console.log(`${m.fecha}  peso=${m.peso_kg ?? '—'}  cintura=${m.circunferencias_cm?.cintura ?? '—'}`)
    }
    process.exit(0)
  }

  if (args.check) {
    const p = medidasPath(args.check)
    if (!fs.existsSync(p)) {
      console.error(`No existe ${p}`)
      process.exit(1)
    }
    const m = readJson(p)
    const errors = validate(m)
    if (errors.length) {
      console.error('Validación fallida:')
      errors.forEach(e => console.error(' -', e))
      process.exit(1)
    }
    console.log('OK\n' + summarize(m))
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

  const errors = validate(merged)
  if (errors.length) {
    console.error('Validación fallida:')
    errors.forEach(e => console.error(' -', e))
    process.exit(1)
  }

  const out = medidasPath(fecha)
  writeJson(out, merged)
  console.log(`Guardado: ${out}`)
  console.log(summarize(merged))

  const all = listMedidas()
  if (all.length >= 2) {
    const prev = all[all.length - 2]
    const curr = all[all.length - 1]
    if (prev.fecha !== curr.fecha && curr.fecha === fecha) {
      console.log('\nComparación vs ' + prev.fecha + ':')
      if (typeof prev.peso_kg === 'number' && typeof curr.peso_kg === 'number') {
        const d = Math.round((curr.peso_kg - prev.peso_kg) * 100) / 100
        console.log(`- peso_kg: ${prev.peso_kg} → ${curr.peso_kg} (${d > 0 ? '+' : ''}${d})`)
      }
      const keys = new Set([
        ...Object.keys(prev.circunferencias_cm || {}),
        ...Object.keys(curr.circunferencias_cm || {})
      ])
      for (const k of keys) {
        const a = prev.circunferencias_cm?.[k]
        const b = curr.circunferencias_cm?.[k]
        if (typeof a === 'number' && typeof b === 'number') {
          const d = Math.round((b - a) * 10) / 10
          console.log(`- ${k}: ${a} → ${b} (${d > 0 ? '+' : ''}${d})`)
        }
      }
    }
  }
}

main()
