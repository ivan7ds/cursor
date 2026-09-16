---
name: revision-semanal
description: Registra medidas corporales semanales y resume la semana (peso, entreno, alimentación, ayuno, digestión). Usar cuando el usuario dé medidas o pida revisión semanal.
---

# Revisión semanal

## Pasos

1. Leer `fitness-agent/AGENTS.md` y el perfil.
2. Si hay medidas nuevas → guardar en `fitness-agent/data/medidas/YYYY-MM-DD.json` (plantilla en `templates/medidas-semanales.json`).
3. Comparar con el archivo de medidas anterior (por fecha).
4. Ejecutar `node fitness-agent/scripts/analyze.js --dias 7`.
5. Escribir informe breve en `fitness-agent/data/resumenes/YYYY-MM-DD-semana.md` con:
   - Deltas de medidas
   - Media de peso / kcal / proteína
   - Sesiones de entrenamiento
   - Ayuno y Bristol (patrones)
   - 2–3 recomendaciones accionables basadas solo en datos
6. Resumir al usuario en español.
