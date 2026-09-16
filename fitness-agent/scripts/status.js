#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DIARIO = path.join(ROOT, 'data', 'diario')
const MEDIDAS = path.join(ROOT, 'data', 'medidas')
const RESUMENES = path.join(ROOT, 'data', 'resumenes')
const PERFIL = path.join(ROOT, 'perfil.json')

function listJson (dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
}

function read (dir, f) {
  return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
}

function completeness (day) {
  const checks = {
    peso: day.peso_kg != null,
    ayuno: day.ayuno && day.ayuno.horas != null,
    ejercicios: Array.isArray(day.ejercicios) && day.ejercicios.length > 0,
    kcal: day.alimentacion && day.alimentacion.kcal_totales != null,
    macros: !!(day.alimentacion?.macros_g?.proteinas != null),
    comidas: Array.isArray(day.alimentacion?.comidas) && day.alimentacion.comidas.length > 0,
    defecaciones: Array.isArray(day.defecaciones) && day.defecaciones.length > 0
  }
  const ok = Object.values(checks).filter(Boolean).length
  return { checks, score: `${ok}/${Object.keys(checks).length}` }
}

function main () {
  const perfil = fs.existsSync(PERFIL) ? JSON.parse(fs.readFileSync(PERFIL, 'utf8')) : {}
  const diarios = listJson(DIARIO)
  const medidas = listJson(MEDIDAS)
  const resumenes = fs.existsSync(RESUMENES)
    ? fs.readdirSync(RESUMENES).filter(f => f.endsWith('.md')).sort()
    : []

  console.log('# Estado del agente fitness')
  console.log(`Perfil: ${perfil.nombre || '—'} | objetivo kcal ${perfil.objetivos?.kcal_diarias ?? '—'}`)
  console.log(`Registros diarios: ${diarios.length}`)
  console.log(`Medidas semanales: ${medidas.length}`)
  console.log(`Resúmenes: ${resumenes.length}`)
  console.log('')

  if (!diarios.length) {
    console.log('Sin días registrados. Envía datos del día en texto libre para empezar.')
  } else {
    console.log('## Últimos días')
    for (const f of diarios.slice(-7)) {
      const d = read(DIARIO, f)
      if (!d.alimentacion) continue
      const c = completeness(d)
      console.log(`- ${d.fecha}: peso=${d.peso_kg ?? '—'} kcal=${d.alimentacion?.kcal_totales ?? '—'} ej=${(d.ejercicios || []).length} complete=${c.score}`)
    }
    const last = read(DIARIO, diarios[diarios.length - 1])
    if (last.alimentacion) {
      const missing = Object.entries(completeness(last).checks)
        .filter(([, v]) => !v)
        .map(([k]) => k)
      if (missing.length) {
        console.log(`\nFalta en ${last.fecha}: ${missing.join(', ')}`)
      }
    }
  }

  if (medidas.length) {
    console.log('\n## Medidas')
    for (const f of medidas.slice(-4)) {
      const m = read(MEDIDAS, f)
      console.log(`- ${m.fecha}: peso=${m.peso_kg ?? '—'} cintura=${m.circunferencias_cm?.cintura ?? '—'}`)
    }
  } else {
    console.log('\nSin medidas semanales aún.')
  }

  console.log('\nComandos: registro-diario | revision-semanal | analisis-efectividad')
  console.log('Scripts: log-day.js --text "..." | log-medidas.js --text "..." | analyze.js --save')
}

main()
