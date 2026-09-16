# Agente de fitness y nutrición

Sistema de registro y análisis para un agente de Cursor que recibe datos diarios de entrenamiento y alimentación.

## Qué registra

- **Diario:** ejercicios, calorías, macros (CHO/PRO/FAT), comidas, peso, defecaciones (Bristol), ayuno
- **Semanal:** medidas corporales (circunferencias, % grasa, etc.)

## Cómo usarlo (día a día)

1. Abre este agente/chat en Cursor (web, móvil o desktop) apuntando a este repo.
2. Envía los datos en texto libre, por ejemplo:

```text
Hoy 75.2 kg. Ayuno 16h.
Entreno fuerza 50 min: press 4x8 60kg, sentadilla 4x6 80kg.
2100 kcal — P160 C200 G60.
Comidas: avena; pollo con arroz; yogur.
Deposición 08:30 Bristol 4.
```

3. El agente guarda el JSON en `fitness-agent/data/diario/YYYY-MM-DD.json` y te confirma.
4. Una vez a la semana: «Medidas: cintura 82, pecho 98, …».
5. Cuando quieras insights: «Analiza la efectividad de las últimas 2 semanas».

Skills disponibles: `registro-diario`, `revision-semanal`, `analisis-efectividad`.

## Configurar objetivos

Edita `fitness-agent/perfil.json` (kcal, macros, protocolo de ayuno, días de entreno).

## Scripts

```bash
# Validar / crear registro de un día (fusiona JSON por stdin o --file)
node fitness-agent/scripts/log-day.js --date 2026-09-16 --file entrada.json

# Solo comprobar un día existente
node fitness-agent/scripts/log-day.js --check 2026-09-16

# Medidas semanales
node fitness-agent/scripts/log-medidas.js --date 2026-09-16 --file medidas.json
node fitness-agent/scripts/log-medidas.js --list

# Análisis de los últimos N días (y guardar informe)
node fitness-agent/scripts/analyze.js --dias 14 --save
```

## Privacidad

Los archivos reales bajo `fitness-agent/data/diario/`, `medidas/` y `resumenes/` están en `.gitignore`. Solo se versionan plantillas, esquemas, scripts y el ejemplo en `data/ejemplos/`.

## Automatización semanal

En [cursor.com/automations](https://cursor.com/automations): trigger cron (p. ej. domingo), repo este, prompt:

```text
Eres el agente de fitness-agent/AGENTS.md. Analiza los últimos 7–14 días
con node fitness-agent/scripts/analyze.js --dias 14 y escribe un resumen
en fitness-agent/data/resumenes/. No inventes mediciones.
```

## Estructura

```text
fitness-agent/
  AGENTS.md           # Instrucciones del agente
  perfil.json         # Objetivos personales
  schema/             # JSON Schema
  templates/          # Plantillas vacías
  data/diario/        # Registros diarios (local)
  data/medidas/       # Medidas semanales (local)
  data/resumenes/     # Informes generados (local)
  data/ejemplos/      # Ejemplos versionados
  scripts/            # log-day.js, analyze.js
```
