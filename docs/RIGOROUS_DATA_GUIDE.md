# FreedomOS: Guia Rigurosa para Alimentar el Sistema con Datos Realistas y Verificables

## Introduccion: el problema actual

FreedomOS genera estimaciones de demanda de habilidades por pais, pero si no explicita fuentes, definiciones y fecha de actualizacion, el resultado puede convertirse en pseudociencia bien intencionada.

Este documento define un marco para transformar FreedomOS en un sistema auditable, replicable y basado en datos publicos verificables.

## Objetivos de calidad de datos

- Trazabilidad: cada metrica debe mostrar su fuente, fecha, version y transformaciones aplicadas.
- Reproducibilidad: una misma consulta con mismo corte temporal debe devolver el mismo resultado.
- Comparabilidad: paises y ocupaciones deben mapearse con taxonomias estandar (ISCO, SOC, NAICS).
- Auditabilidad: cualquier persona debe poder reconstruir el resultado desde datos brutos.
- Transparencia de incertidumbre: el sistema debe mostrar limites, supuestos y margen de error.

## 1. Datos laborales y de mercado

### 1.1 BLS API (U.S. Bureau of Labor Statistics)

Fuente de referencia para Estados Unidos.

- Acceso: https://api.bls.gov/
- Cobertura: series historicas desde 1980 (segun serie), actualizaciones periodicas.
- Variables utiles: empleo por ocupacion, desempleo, salarios y tendencias por region.
- Fortalezas: metodologia estadistica robusta y documentacion publica.

Uso recomendado en FreedomOS:

- Mapear ocupaciones objetivo (SOC/OES) a skills internas.
- Obtener salario mediano, percentiles y evolucion temporal por estado.
- Actualizar de forma automatizada mensual o trimestral.

### 1.2 ILOSTAT API (International Labour Organization)

Fuente principal para comparacion internacional.

- Acceso: https://www.ilo.org/ilostat-files/WEBDEV/docs/API-UserGuide.pdf
- Cobertura: empleo, desempleo y composicion sectorial para multiples regiones.
- Fortalezas: comparabilidad metodologica entre paises.

Uso recomendado en FreedomOS:

- Verificar demanda por ocupacion en paises destino.
- Evitar inferencias basadas solo en narrativas de ecosistema startup.
- Construir indicador de estabilidad laboral por pais y sector.

### 1.3 OECD Migration Database + International Migration Outlook

Contexto estructural para analisis migratorio realista.

- Acceso: https://www.oecd.org/en/data/datasets/overview-data-on-migration-flows-and-migrant-populations.html
- Valor: aporta evidencia sobre insercion laboral, brechas salariales y dinamicas de integracion.

Uso recomendado en FreedomOS:

- Mostrar al usuario que puede existir brecha salarial inicial.
- Incorporar curva esperada de convergencia de ingresos en horizonte de 3 a 5 anos.
- Integrar indicadores de politicas de atraccion de talento por pais.

## 2. Datos de habilidades y tecnologia

### 2.1 Stack Overflow Developer Survey

Encuesta global con granularidad por tecnologia, rol y geografia.

- Acceso: https://survey.stackoverflow.co/
- Formato: CSV descargable.
- Valor: adopcion tecnologica, preferencias, salarios reportados, uso de herramientas de IA.

Uso recomendado en FreedomOS:

- Sustituir frases genericas por cifras concretas y fecha de referencia.
- Incluir contexto por pais o region cuando la muestra lo permita.
- Reportar tamano de muestra para cada afirmacion.

### 2.2 GitHub Octoverse

Fuente observacional de actividad real en repositorios.

- Acceso: https://octoverse.github.com/
- Valor: tendencias de lenguajes y ecosistemas con datos de uso en codigo.

Uso recomendado en FreedomOS:

- Complementar encuestas con evidencia de actividad tecnica real.
- Detectar cambios de tendencia en stacks (subida o caida relativa).

### 2.3 Kaggle Surveys y datasets abiertos

Fuente util para perfiles de data science y machine learning.

- Acceso: https://www.kaggle.com/
- Fortalezas: detalle sobre herramientas de analitica y ML.
- Limitacion: sesgo de comunidad tecnica especializada.

Uso recomendado en FreedomOS:

- Activar modulador sectorial para perfiles de datos/IA.
- No extrapolar resultados de Kaggle al total del mercado sin ponderacion.

## 3. Datos de salarios y compensacion

### 3.1 Fuentes crowdsourced y comparadores salariales

Fuentes de apoyo para triangulacion, no como verdad unica.

- PayScale
- Glassdoor
- Salary.com
- SalaryExpert
- Robert Half Salary Guide

Recomendacion metodologica:

- Tratar estas fuentes como senales complementarias.
- Priorizar estadistica oficial cuando exista.
- Mostrar siempre rango de confianza y dispersion.

## 4. Arquitectura de datos propuesta para FreedomOS

## 4.1 Capa de ingesta

- jobs/bls_ingest.ts
- jobs/ilo_ingest.ts
- jobs/oecd_ingest.ts
- jobs/so_survey_ingest.ts
- jobs/octoverse_ingest.ts

Reglas:

- Guardar crudo en formato versionado (JSON/CSV + timestamp).
- Registrar hash del archivo fuente para auditoria.
- Almacenar metadata de licencia y terminos de uso por dataset.

## 4.2 Capa de normalizacion

- Homologar ocupaciones a ISCO/SOC.
- Homologar skills a un vocabulario canonico interno.
- Convertir monedas a una divisa base con fecha de tipo de cambio.
- Documentar conversiones y supuestos de imputacion.

## 4.3 Capa de scoring explicable

Ejemplo de formula explicable para score de demanda por pais:

Score_Demanda =
0.35 * Tendencia_Empleo_Oficial +
0.25 * Nivel_Salarial_Normalizado +
0.20 * Intensidad_Skills_Tech +
0.10 * Estabilidad_Macro_Laboral +
0.10 * Alineacion_Perfil_Usuario

Buenas practicas:

- Publicar pesos y permitir versionado del modelo.
- Exponer contribucion por componente en UI.
- Evitar cajas negras sin explicacion.

## 5. Reglas de auditabilidad en interfaz

Cada recomendacion del sistema debe incluir:

- Fuente primaria.
- Fecha de actualizacion.
- Cobertura geografica.
- Tamano de muestra o calidad de evidencia.
- Nivel de confianza del resultado.
- Advertencia de limites de interpretacion.

## 6. Politica de actualizacion de datos

- BLS: mensual o trimestral.
- ILO/OECD: segun release oficial (normalmente anual o semestral, segun indicador).
- Stack Overflow y Octoverse: anual.
- Salarios crowdsourced: trimestral con control de outliers.

## 7. Marco legal y etico

- El sistema es para autoevaluacion y orientacion, no para decisiones oficiales.
- No reemplaza asesoria legal, migratoria, psicologica ni laboral.
- Debe evitar sesgos por nacionalidad, genero o edad.
- Debe exponer incertidumbre y no prometer resultados de visa o empleo.

## 8. Hoja de ruta de implementacion

Fase 1 (2 a 3 semanas):

- Crear modulo de metadata de fuentes y versionado.
- Integrar BLS para Estados Unidos.
- Mostrar trazabilidad basica en panel de recomendaciones.

Fase 2 (3 a 5 semanas):

- Integrar ILO y OECD.
- Implementar normalizacion de ocupaciones y skills.
- Publicar score explicable con desglose por componentes.

Fase 3 (2 a 4 semanas):

- Integrar Stack Overflow y Octoverse como capa de tendencia tecnologica.
- Anadir monitoreo de drift de datos y alertas por desactualizacion.
- Publicar reporte metodologico reproducible por version.

## 9. Lista minima de verificacion antes de publicar un release

- Cada metrica tiene fuente y fecha visibles.
- Cada score muestra formula o componentes.
- Cada afirmacion de demanda tiene evidencia verificable.
- Cada recomendacion incluye advertencia de alcance y limites.
- Existe changelog de datasets y modelo de scoring.

## Conclusiones

FreedomOS puede pasar de estimaciones opacas a inteligencia de carrera y migracion basada en evidencia. La clave no es solo tener mas datos, sino tener datos trazables, comparables y explicables.

Si una recomendacion no puede ser auditada, no debe mostrarse como conclusion.
