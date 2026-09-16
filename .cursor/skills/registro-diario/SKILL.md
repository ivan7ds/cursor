---
name: registro-diario
description: Registra o actualiza el diario de fitness/nutrición (ejercicios, calorías, macros, comidas, peso, defecaciones, ayuno). Usar cuando el usuario envíe datos del día o diga que quiere registrar el diario.
---

# Registro diario

## Pasos

1. Leer `fitness-agent/AGENTS.md` y `fitness-agent/perfil.json`.
2. Determinar fecha (`YYYY-MM-DD`). Por defecto: hoy en `Europe/Madrid` salvo que el usuario indique otra.
3. Parsear el mensaje del usuario. Preferir:
   `node fitness-agent/scripts/log-day.js --date FECHA --text "…mensaje…"`
   (también acepta JSON vía `--file` / stdin).
4. Si el parser no captura algo ambiguo, completa el JSON a mano **solo con datos explícitos del usuario**.
5. Validar: `node fitness-agent/scripts/log-day.js --check FECHA`.
6. Responder en español con:
   - Qué se guardó (bullet corto)
   - Campos aún vacíos relevantes
   - Pregunta mínima solo si un dato crítico quedó ambiguo

## No hacer

- No inventar números.
- No borrar ejercicios/comidas previos del mismo día salvo que el usuario lo pida.
- No commitear datos personales.
