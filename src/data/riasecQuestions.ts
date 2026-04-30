export interface RIASECQuestion {
  id: number;
  text: string;
  category: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

export const RIASEC_QUESTIONS: RIASECQuestion[] = [
  // Realistic
  { id: 1,  text: 'Me gusta trabajar con herramientas, maquinaria o equipos técnicos.', category: 'R' },
  { id: 2,  text: 'Disfruto hacer reparaciones, construcciones o montajes físicos.', category: 'R' },
  { id: 3,  text: 'Prefiero actividades manuales o físicas al trabajo de escritorio.', category: 'R' },
  { id: 4,  text: 'Me interesa la mecánica, la electrónica o los sistemas técnicos.', category: 'R' },
  { id: 5,  text: 'Me siento cómodo/a trabajando al aire libre o en entornos industriales.', category: 'R' },
  // Investigative
  { id: 6,  text: 'Me gusta resolver problemas complejos o abstractos.', category: 'I' },
  { id: 7,  text: 'Disfruto investigar, analizar datos y encontrar patrones.', category: 'I' },
  { id: 8,  text: 'Me atraen las ciencias, la tecnología o la matemática.', category: 'I' },
  { id: 9,  text: 'Prefiero entender el porqué de las cosas antes de actuar.', category: 'I' },
  { id: 10, text: 'Me gusta experimentar y probar hipótesis de forma sistemática.', category: 'I' },
  // Artistic
  { id: 11, text: 'Me expreso a través del arte, la música, la escritura o el diseño.', category: 'A' },
  { id: 12, text: 'Disfruto crear cosas originales y únicas.', category: 'A' },
  { id: 13, text: 'Me siento atraído/a por la estética, el diseño visual o la moda.', category: 'A' },
  { id: 14, text: 'Prefiero trabajos que me permitan expresarme con libertad creativa.', category: 'A' },
  { id: 15, text: 'Me interesan el teatro, el cine, la fotografía o la literatura.', category: 'A' },
  // Social
  { id: 16, text: 'Me gusta enseñar, orientar o ayudar a otras personas.', category: 'S' },
  { id: 17, text: 'Disfruto trabajar en equipo y colaborar con otros.', category: 'S' },
  { id: 18, text: 'Me preocupan los problemas sociales y el bienestar de la comunidad.', category: 'S' },
  { id: 19, text: 'Prefiero trabajos que impliquen contacto directo con personas.', category: 'S' },
  { id: 20, text: 'Me siento bien apoyando emocionalmente a quienes lo necesitan.', category: 'S' },
  // Enterprising
  { id: 21, text: 'Me gusta liderar grupos, proyectos o equipos de trabajo.', category: 'E' },
  { id: 22, text: 'Disfruto convencer, negociar o persuadir a otras personas.', category: 'E' },
  { id: 23, text: 'Me interesa iniciar, gestionar o escalar negocios o proyectos.', category: 'E' },
  { id: 24, text: 'Prefiero roles donde tome decisiones importantes.', category: 'E' },
  { id: 25, text: 'Me siento bien vendiendo ideas, productos o servicios.', category: 'E' },
  // Conventional
  { id: 26, text: 'Me gusta seguir procedimientos claros y estructurados.', category: 'C' },
  { id: 27, text: 'Disfruto organizar archivos, datos o procesos administrativos.', category: 'C' },
  { id: 28, text: 'Me interesa el trabajo contable, financiero o de control.', category: 'C' },
  { id: 29, text: 'Prefiero tareas con instrucciones bien definidas y objetivos claros.', category: 'C' },
  { id: 30, text: 'Me siento bien manteniendo registros precisos y organizados.', category: 'C' },
];
