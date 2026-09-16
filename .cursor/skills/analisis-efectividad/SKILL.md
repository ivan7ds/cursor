---
name: analisis-efectividad
description: Analiza la efectividad de entrenamientos y alimentación correlacionando peso, medidas, macros, volumen de entreno, ayuno y digestión. Usar cuando el usuario pida análisis, tendencias o si el plan está funcionando.
---

# Análisis de efectividad

## Pasos

1. Leer perfil y `fitness-agent/AGENTS.md`.
2. Determinar ventana (default: `preferencias_analisis.ventana_dias_default` del perfil).
3. Ejecutar `node fitness-agent/scripts/analyze.js --dias N` (y `--json` si hace falta inspección).
4. Interpretar:
   - ¿Peso alineado con déficit/superávit calórico observado?
   - ¿Proteína media ≥ objetivo?
   - ¿Frecuencia de entreno vs objetivo semanal?
   - ¿Medidas (cintura/pecho/etc.) se mueven en la dirección deseada?
   - ¿Ayuno extremo o Bristol 1–2 / 6–7 correlacionan con baja energía?
5. Separar claramente **hechos** (números) de **hipótesis**.
6. Si hay ≥7 días de datos, guardar resumen en `fitness-agent/data/resumenes/`.
7. Responder con veredicto corto + tabla/bullets de evidencia + próximos ajustes sugeridos.
