# FreedomOS

FreedomOS es una plataforma de autoevaluacion personal orientada a personas migrantes, estudiantes y profesionales internacionales. Combina analisis de perfil, brecha de habilidades y un modulo psicometrico para ayudar a construir un plan personal de desarrollo.

## Demo en Vercel

- Sitio web: https://freedomos.vercel.app

## Metodologia y datos verificables

- Guia rigurosa de datos: [docs/RIGOROUS_DATA_GUIDE.md](docs/RIGOROUS_DATA_GUIDE.md)
- Guia de screening psicologico: [docs/PSYCH_SCREENING_GUIDE.md](docs/PSYCH_SCREENING_GUIDE.md)
- Esta guia documenta fuentes publicas, criterios de auditabilidad, limites metodologicos y una hoja de ruta para reemplazar estimaciones opacas por evidencia verificable.
- Integracion live implementada en API interna: [app/api/rigorous-data/route.ts](app/api/rigorous-data/route.ts)

### APIs integradas (runtime)

- BLS API (USA): desempleo oficial serie LNS14000000.
- ILOSTAT API: desempleo anual SDG_0852_SEX_AGE_RT_A (total poblacion activa).
- OECD SDMX API: migracion neta country-level (NETMIG) del flujo DSD_REG_DEMO@DF_MIGR_FLOW.

### Variables de entorno

- Opcional: BLS_API_KEY (mejora cuota y estabilidad de BLS).
- Si no esta definida, BLS se consulta en modo publico.
- Hermes (Anthropic): usar ANTHROPIC_KEY o ANTHROPIC_API_KEY.

## Descripcion detallada

FreedomOS integra cuatro bloques funcionales principales:

1. Perfil migratorio desde documento
- Permite subir CV o carta de presentacion (.docx / .txt).
- Extrae informacion relevante para estructurar un perfil de habilidades y experiencia.

2. Analisis de brecha de habilidades
- Contrasta el perfil personal con demanda estimada por pais destino.
- Sugiere habilidades prioritarias para mejorar empleabilidad.
- Presenta rutas de aprendizaje con estimaciones de tiempo y plataformas.

3. Test psicologico migratorio
- Incluye instrumentos tipo RIASEC y Big Five para orientar autoconocimiento.
- Estima adaptabilidad y afinidad contextual para distintos destinos.
- Genera resultados interpretativos para reflexion personal.

4. Pasaporte digital personal
- Exporta resultados en PDF o JSON.
- Consolida informacion personal, tecnica y psicometrica en un formato portable.
- Es autoemitido y de control individual (no institucional).

## Posibles casos de uso

- Persona que planea migrar y quiere identificar fortalezas y brechas antes de aplicar a empleo.
- Estudiante internacional que busca mapear habilidades para insercion laboral en otro pais.
- Profesional en transicion de carrera que necesita priorizar formacion para aumentar competitividad.
- Mentor/a o coach de empleabilidad que acompana procesos de orientacion individual.
- Bootcamps o programas comunitarios que deseen usar la herramienta como apoyo de autodiagnostico.

## Limitaciones legales y alcance de uso

IMPORTANTE: FreedomOS es una herramienta de apoyo para autoevaluacion y orientacion personal.

- Solo para self-assessment (autoevaluacion): no sustituye asesoria profesional.
- No constituye asesoria legal, migratoria, psicologica, clinica, financiera ni laboral.
- No emite diagnosticos clinicos ni decisiones oficiales de admision, visa o contratacion.
- Los resultados son estimativos, educativos y deben ser contrastados con fuentes oficiales y especialistas.
- El usuario es responsable del uso e interpretacion de la informacion generada.

## Uso libre, forks y proyectos derivados

Este proyecto se comparte como uso libre a nivel comunitario.

- Cualquier persona esta habilitada a usarlo, estudiarlo y adaptarlo.
- Cualquier persona puede crear su propio proyecto derivado y hacer fork de este repositorio.
- Se permiten mejoras, variantes y reimplementaciones para fines educativos, experimentales o de impacto social.

Sugerencia: si creas una version derivada, incluir credito al proyecto original ayuda a mantener trazabilidad comunitaria.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir en navegador: http://localhost:3000
