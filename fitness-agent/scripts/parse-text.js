'use strict'

/**
 * Parsea texto libre en español hacia un patch de registro diario.
 * Solo extrae lo explícito; no inventa valores.
 */

function parseNumber (s) {
  if (s == null) return null
  const n = Number(String(s).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function parseDiarioText (text, opts = {}) {
  const fecha = opts.fecha || null
  const patch = {}
  if (fecha) patch.fecha = fecha

  const t = String(text || '')

  // Peso: "75.2 kg" / "peso 75,2"
  let m = t.match(/(?:peso\s*[:=]?\s*)?(\d{2,3}(?:[.,]\d+)?)\s*kg\b/i)
  if (!m) m = t.match(/\bpeso\s*[:=]?\s*(\d{2,3}(?:[.,]\d+)?)/i)
  if (m) patch.peso_kg = parseNumber(m[1])

  // Ayuno: "Ayuno 16h" / "16:8" / "ayuno 16 horas (20:00–12:00)"
  const ayuno = {}
  m = t.match(/ayuno\s*[:=]?\s*(\d{1,2}(?:[.,]\d+)?)\s*h(?:oras)?/i)
  if (m) ayuno.horas = parseNumber(m[1])
  // Protocolo tipo 16:8 (un solo dígito tras :), no horas HH:MM
  m = t.match(/\b(\d{1,2})\s*:\s*(\d)\b/)
  if (m) ayuno.protocolo = `${m[1]}:${m[2]}`
  m = t.match(/ayuno[^\n]*?\((\d{1,2}:\d{2})\s*[–\-—a]+\s*(\d{1,2}:\d{2})\)/i)
  if (m) {
    ayuno.inicio = m[1]
    ayuno.fin = m[2]
  }
  if (Object.keys(ayuno).length) patch.ayuno = ayuno

  // Macros totales: preferir "P 160 C 200 G 60" sobre "proteína 450kcal" en comidas
  const macros = {}
  const pcg = t.match(/(?:^|[,\s;])P\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)\s*C\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)\s*G\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)/im)
  if (pcg) {
    macros.proteinas = parseNumber(pcg[1])
    macros.carbohidratos = parseNumber(pcg[2])
    macros.grasas = parseNumber(pcg[3])
  } else {
    m = t.match(/prote[ií]nas?\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)\s*g?\b/i)
    if (m) macros.proteinas = parseNumber(m[1])
    m = t.match(/carbohidrato[s]?\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)\s*g?\b/i)
    if (m) macros.carbohidratos = parseNumber(m[1])
    m = t.match(/grasas?\s*[:=]?\s*(\d{1,3}(?:[.,]\d+)?)\s*g?\b/i)
    if (m) macros.grasas = parseNumber(m[1])
  }

  // Kcal: preferir "Total ~2100 kcal"
  let kcal = null
  m = t.match(/total\s*[~≈]?\s*(\d{3,4})\s*kcal/i)
  if (!m) m = t.match(/total\s*[~≈]?\s*(\d{3,4})\b/i)
  if (!m) m = t.match(/(?:kcal_totales|calor[ií]as(?:\s*totales)?)\s*[:=]?\s*(\d{3,4})/i)
  if (m) kcal = parseNumber(m[1])
  else {
    // Solo si no hay total: un único "NNN kcal" a nivel de día (no en lista de comidas)
    const lines = t.split(/\n/)
    for (const line of lines) {
      if (/comida|comidas|avena|pollo|yogur|desayuno|cena/i.test(line) && !/total/i.test(line)) continue
      const km = line.match(/\b(\d{3,4})\s*kcal\b/i)
      if (km) {
        kcal = parseNumber(km[1])
        break
      }
    }
  }

  // Comidas: líneas/segmentos "Comida: a; b; c" o "450kcal"
  const comidas = []
  m = t.match(/(?:comidas?|alimentaci[oó]n)\s*[:=]\s*([^\n]+)/i)
  if (m) {
    const parts = m[1].split(/;|\|/).map(s => s.trim()).filter(Boolean)
    for (const p of parts) {
      const km = p.match(/(\d{2,4})\s*kcal/i)
      comidas.push({
        tipo: 'otro',
        descripcion: p.replace(/\s*\d{2,4}\s*kcal/i, '').trim() || p,
        kcal: km ? parseNumber(km[1]) : null
      })
    }
  }

  if (kcal != null || Object.keys(macros).length || comidas.length) {
    patch.alimentacion = {}
    if (kcal != null) patch.alimentacion.kcal_totales = kcal
    if (Object.keys(macros).length) patch.alimentacion.macros_g = macros
    if (comidas.length) patch.alimentacion.comidas = comidas
  }

  // Defecaciones: "Deposición 08:30 Bristol 4" / "defecaciones"
  const defecaciones = []
  const defRe = /(?:deposici[oó]n(?:es)?|defecaci[oó]n(?:es)?|heces)[^\n]*?(?:(\d{1,2}:\d{2})\s*)?bristol\s*[:=]?\s*([1-7])/gi
  let dm
  while ((dm = defRe.exec(t)) !== null) {
    defecaciones.push({
      hora: dm[1] || '00:00',
      bristol: parseNumber(dm[2])
    })
  }
  // "08:30 Bristol 4"
  if (!defecaciones.length) {
    const loose = t.match(/(\d{1,2}:\d{2})\s*bristol\s*[:=]?\s*([1-7])/i)
    if (loose) {
      defecaciones.push({ hora: loose[1], bristol: parseNumber(loose[2]) })
    }
  }
  if (defecaciones.length) patch.defecaciones = defecaciones

  // Ejercicio: bloque "Entreno: ..." / duración / RPE / tipo
  const ejercicios = []
  m = t.match(/(?:entreno|entrenamiento|ejercicio[s]?)\s*[:=]\s*([^\n]+)/i)
  if (m) {
    const block = m[1]
    const dur = block.match(/(\d{1,3})\s*min/i)
    const rpe = block.match(/rpe\s*[:=]?\s*(\d{1,2}(?:[.,]\d+)?)/i)
    let tipo = 'otro'
    if (/fuerza|press|sentadilla|peso\s*muerto|remo/i.test(block)) tipo = 'fuerza'
    else if (/cardio|correr|bici|zona\s*2/i.test(block)) tipo = 'cardio'
    else if (/hiit/i.test(block)) tipo = 'hiit'
    else if (/movilidad|yoga|estir/i.test(block)) tipo = 'movilidad'

    const series = []
    const seriesRe = /([A-Za-zÁÉÍÓÚáéíóúñÑ][A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?)\s+(\d+)\s*[x×]\s*(\d+)(?:\s*@\s*(\d+(?:[.,]\d+)?)\s*kg)?/g
    let sm
    while ((sm = seriesRe.exec(block)) !== null) {
      series.push({
        ejercicio: sm[1].replace(/^[,:;]\s*/, '').trim(),
        series: parseNumber(sm[2]),
        reps: sm[3],
        peso_kg: sm[4] != null ? parseNumber(sm[4]) : null
      })
    }

    ejercicios.push({
      nombre: block.slice(0, 80).trim(),
      tipo,
      duracion_min: dur ? parseNumber(dur[1]) : null,
      rpe: rpe ? parseNumber(rpe[1]) : null,
      series,
      notas: ''
    })
  }
  if (ejercicios.length) patch.ejercicios = ejercicios

  // Energía / estrés / sueño opcionales
  m = t.match(/energ[ií]a\s*[:=]?\s*(\d{1,2})\s*(?:\/\s*10)?/i)
  if (m) patch.energia_1_10 = parseNumber(m[1])
  m = t.match(/estr[eé]s\s*[:=]?\s*(\d{1,2})\s*(?:\/\s*10)?/i)
  if (m) patch.estres_1_10 = parseNumber(m[1])
  m = t.match(/sue[nñ]o\s*[:=]?\s*(\d{1,2}(?:[.,]\d+)?)\s*h/i)
  if (m) patch.sueno_h = parseNumber(m[1])

  return patch
}

function parseMedidasText (text, opts = {}) {
  const patch = {}
  if (opts.fecha) patch.fecha = opts.fecha
  const t = String(text || '')

  let m = t.match(/(?:peso\s*[:=]?\s*)?(\d{2,3}(?:[.,]\d+)?)\s*kg\b/i)
  if (m) patch.peso_kg = parseNumber(m[1])
  m = t.match(/(?:grasa|bf)\s*[:=]?\s*(\d{1,2}(?:[.,]\d+)?)\s*%?/i)
  if (m) patch.grasa_pct = parseNumber(m[1])

  const circ = {}
  const keys = {
    cuello: /cuello/i,
    pecho: /pecho/i,
    cintura: /cintura/i,
    abdomen: /abdomen/i,
    cadera: /cadera/i,
    hombros: /hombros?/i,
    brazo_izq: /brazo\s*(?:izq|i)\b/i,
    brazo_der: /brazo\s*(?:der|d)\b/i,
    muslo_izq: /muslo\s*(?:izq|i)\b/i,
    muslo_der: /muslo\s*(?:der|d)\b/i
  }
  for (const [key, re] of Object.entries(keys)) {
    const rm = t.match(new RegExp(re.source + '\\s*[:=]?\\s*(\\d{2,3}(?:[.,]\\d+)?)', 'i'))
    if (rm) circ[key] = parseNumber(rm[1])
  }
  // "cintura 82, pecho 98" estilo lista
  const listRe = /(cuello|pecho|cintura|abdomen|cadera|hombros?|brazo\s*(?:izq|der|i|d)|muslo\s*(?:izq|der|i|d))\s*[:=]?\s*(\d{2,3}(?:[.,]\d+)?)/gi
  let lm
  while ((lm = listRe.exec(t)) !== null) {
    const label = lm[1].toLowerCase().replace(/\s+/g, ' ')
    const val = parseNumber(lm[2])
    if (/cuello/.test(label)) circ.cuello = val
    else if (/pecho/.test(label)) circ.pecho = val
    else if (/cintura/.test(label)) circ.cintura = val
    else if (/abdomen/.test(label)) circ.abdomen = val
    else if (/cadera/.test(label)) circ.cadera = val
    else if (/hombro/.test(label)) circ.hombros = val
    else if (/brazo.*(?:izq|i)/.test(label)) circ.brazo_izq = val
    else if (/brazo/.test(label)) circ.brazo_der = val
    else if (/muslo.*(?:izq|i)/.test(label)) circ.muslo_izq = val
    else if (/muslo/.test(label)) circ.muslo_der = val
  }
  if (Object.keys(circ).length) patch.circunferencias_cm = circ
  return patch
}

module.exports = { parseDiarioText, parseMedidasText }
