import { Integrante, Tarea } from '../core/models';

/**
 * Seed fijo de la demo (equivale al JSON que luego vendrá de la API).
 * Son funciones que devuelven objetos nuevos para poder reiniciar la demo
 * sin arrastrar mutaciones.
 */
export function crearIntegrantes(): Integrante[] {
  return [
    {
      id: 'u-catarina',
      nombre: 'Catarina González',
      cargo: 'Jefa del Departamento',
      iniciales: 'CG',
      color: '#f59e0b',
      tonoPiel: '#f2c9a0',
      tonoPelo: '#1c1c22',
      rol: 'jefatura',
    },
    {
      id: 'u-josias',
      nombre: 'Josías Montecinos',
      cargo: 'Analista de Planificación',
      iniciales: 'JO',
      color: '#22d3ee',
      tonoPiel: '#d9a066',
      tonoPelo: '#2f2b3a',
      rol: 'funcionario',
    },
    {
      id: 'u-jessi',
      nombre: 'Jessi Montecinos',
      cargo: 'Ingeniera de Proyectos',
      iniciales: 'JE',
      color: '#a78bfa',
      tonoPiel: '#f7d7b5',
      tonoPelo: '#4a2f1b',
      rol: 'funcionario',
    },
    {
      id: 'u-marcelo',
      nombre: 'Marcelo Hurtado',
      cargo: 'Control de Gestión',
      iniciales: 'MH',
      color: '#34d399',
      tonoPiel: '#a86b3c',
      tonoPelo: '#2f2b3a',
      rol: 'funcionario',
    },
    {
      id: 'u-tamara',
      nombre: 'Tamara Villega',
      cargo: 'Analista de Inversiones',
      iniciales: 'TV',
      color: '#fb7185',
      tonoPiel: '#f7d7b5',
      tonoPelo: '#7a4b1e',
      rol: 'funcionario',
    },
    {
      id: 'u-vicente',
      nombre: 'Vicente Reyes',
      cargo: 'Planificación Territorial',
      iniciales: 'VR',
      color: '#60a5fa',
      tonoPiel: '#8a5a33',
      tonoPelo: '#1c1c22',
      rol: 'funcionario',
    },
  ];
}

export function crearTareas(): Tarea[] {
  return [
    {
      id: 't-1',
      titulo: 'Actualizar cartera de proyectos 2026',
      progreso: 65,
      dias: 6,
      creadaPor: 'u-josias',
      asignados: ['u-josias', 'u-jessi'],
      activaPor: ['u-josias', 'u-jessi'],
      miniTareas: [
        { id: 'm-11', titulo: 'Revisar fichas IDI', progreso: 70, activaPor: ['u-josias'] },
        {
          id: 'm-12',
          titulo: 'Consolidar planilla de seguimiento',
          progreso: 40,
          activaPor: ['u-jessi'],
        },
        { id: 'm-13', titulo: 'Validar antecedentes con DIPRES', progreso: 0, activaPor: [] },
      ],
    },
    {
      id: 't-2',
      titulo: 'Diseñar metodología de seguimiento de convenios',
      progreso: 35,
      dias: 9,
      creadaPor: 'u-marcelo',
      asignados: ['u-marcelo'],
      activaPor: ['u-marcelo'],
      miniTareas: [
        { id: 'm-21', titulo: 'Mapear proceso actual', progreso: 50, activaPor: ['u-marcelo'] },
        {
          id: 'm-22',
          titulo: 'Redactar ficha tipo de convenio',
          progreso: 20,
          activaPor: ['u-marcelo'],
        },
      ],
    },
    {
      id: 't-3',
      titulo: 'Informe mensual de avance estratégico',
      progreso: 20,
      dias: 3,
      creadaPor: 'u-tamara',
      asignados: ['u-tamara'],
      activaPor: [],
      miniTareas: [],
    },
    {
      id: 't-4',
      titulo: 'Levantamiento territorial sector norte',
      progreso: 80,
      dias: 12,
      creadaPor: 'u-tamara',
      asignados: ['u-tamara'],
      activaPor: ['u-tamara'],
      miniTareas: [
        {
          id: 'm-41',
          titulo: 'Entrevistas a dirigentes vecinales',
          progreso: 60,
          activaPor: ['u-tamara'],
        },
        {
          id: 'm-42',
          titulo: 'Sistematizar resultados en matriz',
          progreso: 45,
          activaPor: ['u-tamara'],
        },
        { id: 'm-43', titulo: 'Presentación para el comité', progreso: 0, activaPor: [] },
      ],
    },
    {
      id: 't-5',
      titulo: 'Priorizar iniciativas del presupuesto participativo',
      progreso: 0,
      dias: 0,
      creadaPor: 'u-josias',
      asignados: ['u-josias'],
      activaPor: [],
      miniTareas: [],
    },
    {
      id: 't-6',
      titulo: 'Plan de mitigación de riesgos PMG',
      progreso: 55,
      dias: 5,
      creadaPor: 'u-jessi',
      asignados: ['u-jessi', 'u-marcelo'],
      activaPor: ['u-marcelo'],
      miniTareas: [
        {
          id: 'm-61',
          titulo: 'Matriz de riesgos por proceso',
          progreso: 60,
          activaPor: ['u-marcelo'],
        },
        { id: 'm-62', titulo: 'Plan de acción preventivo', progreso: 30, activaPor: [] },
      ],
    },
    {
      id: 't-7',
      titulo: 'Revisión de bases de licitación servicios TI',
      progreso: 90,
      dias: 2,
      creadaPor: 'u-vicente',
      asignados: ['u-vicente'],
      activaPor: ['u-vicente'],
      miniTareas: [],
    },
    {
      id: 't-8',
      titulo: 'Catastro de proyectos estratégicos comunales',
      progreso: 15,
      dias: 1,
      creadaPor: 'u-tamara',
      asignados: ['u-tamara', 'u-vicente'],
      activaPor: [],
      miniTareas: [
        { id: 'm-81', titulo: 'Ficha por proyecto', progreso: 10, activaPor: [] },
        { id: 'm-82', titulo: 'Validar con SECPLA', progreso: 0, activaPor: [] },
      ],
    },
    {
      id: 't-9',
      titulo: 'Autoevaluación de indicadores PMG 2026',
      progreso: 5,
      dias: 1,
      creadaPor: 'u-josias',
      asignados: ['u-josias'],
      activaPor: ['u-josias'],
      miniTareas: [],
    },
  ];
}
