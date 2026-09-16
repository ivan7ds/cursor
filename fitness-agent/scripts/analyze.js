#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DIARIO = path.join(ROOT, 'data', 'diario')
const MEDIDAS = path.join(ROOT, 'data', 'medidas')
const RESUMENES = path.join(ROOT, 'data', 'resumenes')
const PERFIL = path.join(ROOT, 'perfil.json')

function parseArgs (argv) {
  const args = { dias: 14, json: false, save: false }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dias') args.dias = Number(argv[++i])
    else if (argv[i] === '--json') args.json = true
    else if (argv[i] === '--save') args.save = true
    else if (argv[i] === '--help' || argv[i] === '-h') args.help = true
  }
  return args
}

function readJson (file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function listJsonDir (dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        return readJson(path.join(dir, f))
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
}

function daysAgoISO (n) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

function avg (nums) {
  const v = nums.filter(n => typeof n === 'number' && !Number.isNaN(n))
  if (!v.length) return null
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100
}

function trend (nums) {
  const v = nums.filter(n => typeof n === 'number')
  if (v.length < 2) return null
  return Math.round((v[v.length - 1] - v[0]) * 100) / 100
}

function analyze (dias) {
  const desde = daysAgoISO(dias - 1)
  const perfil = fs.existsSync(PERFIL) ? readJson(PERFIL) : { objetivos: {} }
  const obj = perfil.objetivos || {}

  const diarios = listJsonDir(DIARIO).filter(d => {
    return d.fecha >= desde && d.alimentacion && typeof d.alimentacion === 'object'
  })
  const medidas = listJsonDir(MEDIDAS).filter(m => {
    return m.fecha >= daysAgoISO(Math.max(dias, 60)) && m.circunferencias_cm
  })

  const pesos = diarios.map(d => d.peso_kg).filter(n => typeof n === 'number')
  const kcals = diarios.map(d => d.alimentacion?.kcal_totales).filter(n => typeof n === 'number')
  const prots = diarios.map(d => d.alimentacion?.macros_g?.proteinas).filter(n => typeof n === 'number')
  const carbs = diarios.map(d => d.alimentacion?.macros_g?.carbohidratos).filter(n => typeof n === 'number')
  const fats = diarios.map(d => d.alimentacion?.macros_g?.grasas).filter(n => typeof n === 'number')
  const ayunos = diarios.map(d => d.ayuno?.horas).filter(n => typeof n === 'number')
  const energias = diarios.map(d => d.energia_1_10).filter(n => typeof n === 'number')

  let sesiones = 0
  let minEntreno = 0
  for (const d of diarios) {
    const ej = d.ejercicios || []
    if (ej.length) sesiones++
    for (const e of ej) {
      if (typeof e.duracion_min === 'number') minEntreno += e.duracion_min
    }
  }

  const bristol = []
  for (const d of diarios) {
    for (const x of (d.defecaciones || [])) {
      if (typeof x.bristol === 'number') bristol.push(x.bristol)
    }
  }

  const semanas = Math.max(dias / 7, 1)
  const entrenoPorSemana = Math.round((sesiones / semanas) * 100) / 100

  const medidasDelta = []
  if (medidas.length >= 2) {
    const a = medidas[medidas.length - 2]
    const b = medidas[medidas.length - 1]
    const keys = Object.keys(b.circunferencias_cm || {})
    for (const k of keys) {
      const va = a.circunferencias_cm?.[k]
      const vb = b.circunferencias_cm?.[k]
      if (typeof va === 'number' && typeof vb === 'number') {
        medidasDelta.push({ metrica: k, de: va, a: vb, delta: Math.round((vb - va) * 10) / 10 })
      }
    }
    if (typeof a.peso_kg === 'number' && typeof b.peso_kg === 'number') {
      medidasDelta.unshift({
        metrica: 'peso_kg',
        de: a.peso_kg,
        a: b.peso_kg,
        delta: Math.round((b.peso_kg - a.peso_kg) * 100) / 100
      })
    }
  }

  const hallazgos = []
  const kcalMedia = avg(kcals)
  const protMedia = avg(prots)
  const pesoDelta = trend(pesos)

  if (obj.kcal_diarias && kcalMedia != null) {
    const desv = ((kcalMedia - obj.kcal_diarias) / obj.kcal_diarias) * 100
    if (Math.abs(desv) >= (perfil.preferencias_analisis?.alerta_desviacion_kcal_pct || 15)) {
      hallazgos.push(`Kcal media (${kcalMedia}) se desvía ${desv.toFixed(1)}% del objetivo (${obj.kcal_diarias}).`)
    } else {
      hallazgos.push(`Kcal media (${kcalMedia}) alineada con objetivo (${obj.kcal_diarias}).`)
    }
  }

  if (protMedia != null) {
    const minP = perfil.preferencias_analisis?.alerta_proteina_min_g ?? obj.proteinas_g
    if (minP && protMedia < minP) {
      hallazgos.push(`Proteína media (${protMedia} g) por debajo del umbral (${minP} g).`)
    } else if (obj.proteinas_g) {
      hallazgos.push(`Proteína media (${protMedia} g) vs objetivo (${obj.proteinas_g} g).`)
    }
  }

  if (obj.entrenos_por_semana != null) {
    hallazgos.push(`Entrenos ~${entrenoPorSemana}/semana (objetivo ${obj.entrenos_por_semana}).`)
  }

  if (pesoDelta != null) {
    hallazgos.push(`Cambio de peso en la ventana: ${pesoDelta > 0 ? '+' : ''}${pesoDelta} kg (${pesos[0]} → ${pesos[pesos.length - 1]}).`)
  }

  if (bristol.length) {
    const bAvg = avg(bristol)
    hallazgos.push(`Bristol medio: ${bAvg} (n=${bristol.length}).`)
    if (bAvg <= 2) hallazgos.push('Tendencia a deposiciones duras (Bristol ≤2): revisar fibra/hidratación.')
    if (bAvg >= 6) hallazgos.push('Tendencia a deposiciones sueltas (Bristol ≥6): revisar intolerancias/estrés.')
  }

  if (diarios.length < 3) {
    hallazgos.push('Pocos días con datos: las conclusiones son provisionales.')
  }

  return {
    ventana: { dias, desde, registros: diarios.length },
    objetivos: obj,
    peso: { media: avg(pesos), delta: pesoDelta, n: pesos.length },
    alimentacion: {
      kcal_media: kcalMedia,
      proteinas_g_media: protMedia,
      carbohidratos_g_media: avg(carbs),
      grasas_g_media: avg(fats),
      dias_con_kcal: kcals.length
    },
    entrenamiento: {
      sesiones,
      minutos_totales: minEntreno,
      por_semana: entrenoPorSemana
    },
    ayuno: { horas_media: avg(ayunos), n: ayunos.length },
    digesta: { bristol_medio: avg(bristol), n: bristol.length },
    energia_media: avg(energias),
    medidas_delta: medidasDelta,
    hallazgos
  }
}

function formatReport (r) {
  const lines = []
  lines.push(`# Análisis fitness (${r.ventana.dias} días, desde ${r.ventana.desde})`)
  lines.push(`Registros diarios: ${r.ventana.registros}`)
  lines.push('')
  lines.push('## Resumen numérico')
  lines.push(`- Peso medio: ${r.peso.media ?? '—'} kg (Δ ${r.peso.delta ?? '—'})`)
  lines.push(`- Kcal media: ${r.alimentacion.kcal_media ?? '—'}`)
  lines.push(`- Proteína media: ${r.alimentacion.proteinas_g_media ?? '—'} g`)
  lines.push(`- CHO media: ${r.alimentacion.carbohidratos_g_media ?? '—'} g`)
  lines.push(`- Grasas media: ${r.alimentacion.grasas_g_media ?? '—'} g`)
  lines.push(`- Sesiones: ${r.entrenamiento.sesiones} (~${r.entrenamiento.por_semana}/sem), ${r.entrenamiento.minutos_totales} min`)
  lines.push(`- Ayuno medio: ${r.ayuno.horas_media ?? '—'} h`)
  lines.push(`- Bristol medio: ${r.digesta.bristol_medio ?? '—'}`)
  lines.push(`- Energía media: ${r.energia_media ?? '—'}`)
  if (r.medidas_delta.length) {
    lines.push('')
    lines.push('## Medidas (última vs anterior)')
    for (const m of r.medidas_delta) {
      lines.push(`- ${m.metrica}: ${m.de} → ${m.a} (${m.delta > 0 ? '+' : ''}${m.delta})`)
    }
  }
  lines.push('')
  lines.push('## Hallazgos')
  for (const h of r.hallazgos) lines.push(`- ${h}`)
  lines.push('')
  lines.push(`_Generado: ${new Date().toISOString()}_`)
  return lines.join('\n') + '\n'
}

function saveReport (text, dias) {
  fs.mkdirSync(RESUMENES, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 10)
  const file = path.join(RESUMENES, `${stamp}-${dias}d.md`)
  fs.writeFileSync(file, text, 'utf8')
  return file
}

function main () {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log('Uso: node fitness-agent/scripts/analyze.js [--dias 14] [--json] [--save]')
    process.exit(0)
  }
  const report = analyze(args.dias)
  if (args.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    const text = formatReport(report)
    process.stdout.write(text)
    if (args.save) {
      const file = saveReport(text, args.dias)
      console.log(`\nGuardado: ${file}`)
    }
  }
}

main()
