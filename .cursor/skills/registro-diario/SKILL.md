---
name: registro-diario
description: Registra o actualiza el diario de fitness/nutrición (ejercicios, calorías, macros, comidas, peso, defecaciones, ayuno). Usar cuando el usuario envíe datos del día o diga que quiere registrar el diario.
---

# Registro diario

## Pasos

1. Leer `fitness-agent/AGENTS.md` y `fitness-agent/perfil.json`.
2. Determinar fecha (`YYYY-MM-DD`). Por defecto: hoy en `Europe/Madrid` salvo que el usuario indique otra.
3. Si existe `fitness-agent/data/diario/FECHA.json`, cargarlo; si no, copiar `fitness-agent/templates/diario.json`.
4. Parsear el mensaje del usuario y **fusionar** solo los campos mencionados.
5. Calcular `macros_pct` si hay gramos de macros (CHO×4, PRO×4, FAT×9 → % sobre kcal de macros).
6. Poner `actualizado_en` a ahora (ISO UTC).
7. Escribir el JSON formateado (2 espacios).
8. Opcional: `node fitness-agent/scripts/log-day.js --check FECHA`.
9. Responder en español con:
   - Qué se guardó (bullet corto)
   - Campos aún vacíos relevantes
   - Pregunta mínima solo si un dato crítico quedó ambiguo

## No hacer

- No inventar números.
- No borrar ejercicios/comidas previos del mismo día salvo que el usuario lo pida.
- No commitear datos personales.
