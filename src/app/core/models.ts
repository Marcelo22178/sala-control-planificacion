/**
 * Modelos de la demo "Depto. de Planificación y Proyectos Estratégicos".
 * Todo vive en memoria (sin backend): al recargar se restaura el seed.
 */

export type Rol = 'jefatura' | 'funcionario';

/** Estado de ánimo del monito, derivado del cansancio individual. */
export type EstadoAnimo = 'fresco' | 'cansado' | 'agotado';

export interface Integrante {
  id: string;
  nombre: string;
  cargo: string;
  iniciales: string;
  /** Color principal (camisa del monito, acentos de la UI). */
  color: string;
  /** Tonos del pixel art para diferenciar a cada persona. */
  tonoPiel: string;
  tonoPelo: string;
  rol: Rol;
}

export interface MiniTarea {
  id: string;
  titulo: string;
  progreso: number;
  /** Ids de quienes están trabajando en esta subtarea ahora mismo. */
  activaPor: string[];
}

export interface Tarea {
  id: string;
  titulo: string;
  progreso: number;
  /** Días que lleva abierta (el seed lo fija para mostrar estados). */
  dias: number;
  creadaPor: string;
  /** Integrantes asignados (dueño + colegas que se sumaron). */
  asignados: string[];
  /** Ids de quienes están trabajando en la tarea grande ahora mismo. */
  activaPor: string[];
  miniTareas: MiniTarea[];
}

/** Ficha de carga/cansancio de una persona. */
export interface ResumenPersona {
  integrante: Integrante;
  tareasActivas: number;
  subtareasActivas: number;
  carga: number;
  diasMax: number;
  cansancio: number;
  estado: EstadoAnimo;
  tareasEnCurso: { id: string; titulo: string; dias: number }[];
}

/** Estación del visor de jefatura: una tarea con gente trabajando. */
export interface EstacionTrabajo {
  tarea: Tarea;
  /** Personas trabajando en la tarea grande o en alguna subtarea activa. */
  trabajadores: Integrante[];
  subtareasActivas: { mini: MiniTarea; trabajadores: Integrante[] }[];
}

export interface KpisDepartamento {
  personasTrabajando: number;
  tareasActivas: number;
  subtareasActivas: number;
  progresoPromedio: number;
  alertasCansancio: number;
}
