---
name: revision-semanal
description: Registra medidas corporales semanales y resume la semana (peso, entreno, alimentación, ayuno, digestión). Usar cuando el usuario dé medidas o pida revisión semanal.
---

# Revisión semanal

## Pasos

1. Leer `fitness-agent/AGENTS.md` y el perfil.
2. Si hay medidas nuevas → `node fitness-agent/scripts/log-medidas.js --date FECHA` con JSON por stdin (o escribir el archivo).
3. Revisar la comparación automática vs la medición anterior.
4. Ejecutar `node fitness-agent/scripts/analyze.js --dias 7 --save`.
5. Completar el informe en `fitness-agent/data/resumenes/` con:
   - Deltas de medidas
   - Media de peso / kcal / proteína
   - Sesiones de entrenamiento
   - Ayuno y Bristol (patrones)
   - 2–3 recomendaciones accionables basadas solo en datos
6. Resumir al usuario en español.
