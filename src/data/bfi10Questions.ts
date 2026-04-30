export interface BFI10Question {
  id: number;
  text: string;
  trait: 'O' | 'C' | 'E' | 'A' | 'N';
  reversed: boolean;
}

// Validated BFI-10 (Rammstedt & John, 2007) — translated to Spanish
export const BFI10_QUESTIONS: BFI10Question[] = [
  { id: 1,  text: 'Soy una persona reservada.', trait: 'E', reversed: true },
  { id: 2,  text: 'Generalmente confío en los demás.', trait: 'A', reversed: false },
  { id: 3,  text: 'Tiendo a ser perezoso/a.', trait: 'C', reversed: true },
  { id: 4,  text: 'Soy relajado/a y manejo bien el estrés.', trait: 'N', reversed: true },
  { id: 5,  text: 'Tengo pocos intereses artísticos o creativos.', trait: 'O', reversed: true },
  { id: 6,  text: 'Soy sociable y extrovertido/a.', trait: 'E', reversed: false },
  { id: 7,  text: 'Tiendo a encontrar defectos o criticar a los demás.', trait: 'A', reversed: true },
  { id: 8,  text: 'Hago las cosas con cuidado y minuciosidad.', trait: 'C', reversed: false },
  { id: 9,  text: 'Me pongo nervioso/a o ansioso/a con facilidad.', trait: 'N', reversed: false },
  { id: 10, text: 'Tengo una imaginación activa y amplia.', trait: 'O', reversed: false },
];
