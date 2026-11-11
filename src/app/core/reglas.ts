import { EstadoAnimo, Tarea } from './models';

/** Días de trabajo a partir de los cuales el cansancio por antigüedad empieza a notarse. */
export const DIAS_BASE = 1;

/** Tareas simultáneas que se consideran "carga sana" antes de sobrecargarse. */
export const CARGA_SANA = 4;

/**
 * Cansancio individual (no se comparte aunque dos monitos trabajen en la misma tarea).
 * Sube con los días y se dispara al pasar de CARGA_SANA tareas simultáneas.
 */
export function calcularCansancio(carga: number, diasMax: number): number {
  const porDias = Math.max(0, diasMax - DIAS_BASE) * 8;
  const porSobrecarga = Math.max(0, carga - CARGA_SANA) * 15;
  return Math.max(0, Math.min(100, Math.round(porDias + porSobrecarga)));
}

export function estadoPorCansancio(cansancio: number): EstadoAnimo {
  if (cansancio >= 65) return 'agotado';
  if (cansancio >= 30) return 'cansado';
  return 'fresco';
}

export function etiquetaEstado(estado: EstadoAnimo): string {
  if (estado === 'agotado') return 'Agotado';
  if (estado === 'cansado') return 'Cansado';
  return 'Fresco';
}

/** Carga = tareas activas + 0.5 por subtarea activa (las subtareas pesan menos). */
export function calcularCarga(tareasActivas: number, subtareasActivas: number): number {
  return Math.round((tareasActivas + subtareasActivas * 0.5) * 10) / 10;
}

export interface CargaPersona {
  tareasActivas: number;
  subtareasActivas: number;
  carga: number;
  diasMax: number;
  tareasEnCurso: { id: string; titulo: string; dias: number }[];
}

/** Recorre las tareas y suma lo que la persona tiene activo ahora mismo. */
export function medirCarga(tareas: Tarea[], integranteId: string): CargaPersona {
  let tareasActivas = 0;
  let subtareasActivas = 0;
  let diasMax = 0;
  const tareasEnCurso: CargaPersona['tareasEnCurso'] = [];

  for (const tarea of tareas) {
    const enTarea = tarea.activaPor.includes(integranteId);
    const miniActivas = tarea.miniTareas.filter((mini) => mini.activaPor.includes(integranteId));

    if (enTarea || miniActivas.length > 0) {
      tareasEnCurso.push({ id: tarea.id, titulo: tarea.titulo, dias: tarea.dias });
      diasMax = Math.max(diasMax, tarea.dias);
    }
    if (enTarea) tareasActivas++;
    subtareasActivas += miniActivas.length;
  }

  return {
    tareasActivas,
    subtareasActivas,
    carga: calcularCarga(tareasActivas, subtareasActivas),
    diasMax,
    tareasEnCurso,
  };
}

export function promedio(valores: number[]): number {
  if (valores.length === 0) return 0;
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
}

export function limitarPorcentaje(valor: number): number {
  return Math.max(0, Math.min(100, Math.round(valor)));
}

/** Mezcla un color hex con negro para generar la sombra de la camisa. */
export function oscurecer(hex: string, factor = 0.68): string {
  const limpio = hex.replace('#', '');
  const completo =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;
  const numero = Number.parseInt(completo, 16);
  const r = Math.round(((numero >> 16) & 0xff) * factor);
  const g = Math.round(((numero >> 8) & 0xff) * factor);
  const b = Math.round((numero & 0xff) * factor);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
