# FreedomOS: Guia de Screening Psicologico y Seguimiento Longitudinal

## Objetivo

Este documento define una base metodologica mas valida para usar FreedomOS en tamizaje psicologico de bajo riesgo, seguimiento continuo y futura prediccion de resultados psicologicos observables.

La regla central es simple:

- RIASEC sirve para intereses vocacionales.
- Big Five breve sirve para autoconocimiento general.
- Ninguno de los dos debe presentarse como predictor clinico suficiente por si solo.

## 1. Que outcomes vale la pena predecir

FreedomOS no deberia intentar predecir un constructo vago como "resultado psicologico". Debe elegir outcomes concretos, observables y repetibles.

Outcomes recomendados para este producto:

- malestar emocional elevado en seguimiento
- caida de bienestar subjetivo
- necesidad de apoyo psicosocial adicional
- riesgo de mala adaptacion percibida al contexto migratorio

Estos outcomes pueden modelarse mejor si se recogen en momentos repetidos y con instrumentos breves validados.

## 2. Bateria recomendada por objetivo

### 2.1 Orientacion vocacional y rasgos

- RIASEC: mantenerlo como modulo de intereses, no como indicador de salud mental.
- BFI-10: mantenerlo como rasgo breve de referencia, con advertencia de que su precision individual es limitada.

### 2.2 Monitoreo de malestar y bienestar

- PHQ-4: tamizaje ultrabreve de ansiedad/depresion para seguimiento de distress.
- WHO-5: bienestar subjetivo breve y repetible.

### 2.3 Factores de proteccion y adaptacion

- BRS (Brief Resilience Scale): capacidad de recuperacion ante estres.
- OSSS-3 (Oslo Social Support Scale): soporte social percibido.

### 2.4 Variables de contexto no psicometricas

Para predecir mejor los outcomes, el sistema debe registrar variables de contexto que suelen tener mas poder predictivo que un rasgo aislado:

- estabilidad de vivienda
- situacion laboral actual
- dominio del idioma del pais destino
- red de apoyo local
- evento vital estresante reciente
- incertidumbre administrativa o legal
- calidad de sueno auto-reportada

## 3. Lo que es valido hoy y lo que no

Valido para uso actual de bajo riesgo:

- autoconocimiento
- orientacion educativa
- reflexion sobre estilo personal y preferencias
- triage suave para repetir o invalidar un intento por baja calidad de respuesta

No valido todavia:

- estimar riesgo clinico individual con precision
- predecir adaptacion futura sin datos longitudinales
- usar scores psicologicos para decisiones de seleccion, admision o prioridad institucional

## 4. Propuesta de seguimiento continuo

Momentos recomendados:

- baseline: onboarding
- followup_2w: 2 semanas
- followup_6w: 6 semanas
- followup_12w: 12 semanas
- quarterly: cada 3 meses si el usuario sigue activo

Instrumentos por momento:

- baseline: BFI-10, RIASEC, PHQ-4, WHO-5, BRS, OSSS-3
- follow-up: PHQ-4, WHO-5, BRS, OSSS-3
- contexto rapido: variables de vivienda, empleo, idioma, soporte y estres reciente en cada visita

## 5. Regla metodologica para modelos predictivos

Antes de publicar cualquier modelo de prediccion, FreedomOS debe contar con:

- outcome definido con ventana temporal clara
- datos de baseline y follow-up enlazables por usuario
- versionado del modelo y de cada instrumento
- evaluacion de calibracion y discriminacion
- advertencias de alcance y uso no clinico

## 6. Pipeline de prediccion recomendado

### 6.1 Fase inicial

- usar reglas transparentes de monitoreo para WHO-5, PHQ-4, BRS y OSSS-3
- mostrar flags de apoyo, no probabilidades clinicas
- registrar outcome observado en follow-up

### 6.2 Fase de modelado

- construir features desde baseline, cambio entre mediciones y contexto reciente
- entrenar primero modelos interpretable como regresion logistica
- comparar con gradient boosting solo si mejora calibracion sin perder explicabilidad

### 6.3 Variables utiles para el modelo

- scores de PHQ-4, WHO-5, BRS, OSSS-3
- cambio respecto a baseline
- calidad de respuesta
- estabilidad de empleo
- estabilidad de vivienda
- soporte social
- dominio del idioma
- estresores recientes

## 7. Reglas de interfaz

La UI debe distinguir tres tipos de salida:

- orientacion: intereses y rasgos
- monitoreo: flags de bienestar o malestar
- prediccion: solo cuando exista modelo validado con datos observados

Texto recomendado en interfaz:

- "screening breve"
- "seguimiento de bienestar"
- "flag de apoyo sugerido"

Texto a evitar hasta validar el modelo:

- "riesgo psicologico predicho"
- "resultado psicologico esperado"
- "probabilidad de mala integracion"

## 8. Criterios de release

- cada score psicologico debe indicar instrumento, version y fecha
- cada flag debe indicar si es orientativo, de monitoreo o predictivo
- ninguna salida debe presentarse como diagnostico clinico
- el sistema debe soportar repeticion temporal y analisis de cambio
- los thresholds deben estar documentados fuera del codigo heuristico

## Conclusiones

El camino correcto para FreedomOS es separar claramente orientacion, monitoreo y prediccion.

RIASEC + BFI-10 pueden quedarse como bloque de autoconocimiento. Para outcomes psicologicos, el producto necesita una bateria breve repetible, variables de contexto y datos longitudinales observados.