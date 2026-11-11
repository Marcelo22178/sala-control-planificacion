import { Injectable, computed, signal } from '@angular/core';
import { crearIntegrantes, crearTareas } from '../data/seed';
import { EstacionTrabajo, Integrante, KpisDepartamento, ResumenPersona, Tarea } from './models';
import {
  calcularCansancio,
  estadoPorCansancio,
  limitarPorcentaje,
  medirCarga,
  promedio,
} from './reglas';

const USUARIO_INICIAL = 'u-josias';

/**
 * Estado único de la demo. Vive en memoria: al recargar la página vuelve el seed.
 * Cuando exista backend, solo se reemplazan los métodos de mutación por llamadas HTTP.
 */
@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private readonly _integrantes = signal<Integrante[]>(crearIntegrantes());
  private readonly _tareas = signal<Tarea[]>(crearTareas());
  private readonly _usuarioId = signal<string>(USUARIO_INICIAL);
  private secuencia = 1000;

  readonly integrantes = this._integrantes.asReadonly();
  readonly tareas = this._tareas.asReadonly();
  readonly usuarioId = this._usuarioId.asReadonly();

  readonly jefa = computed<Integrante>(
    () => this._integrantes().find((i) => i.rol === 'jefatura') ?? this._integrantes()[0],
  );

  readonly funcionarios = computed(() =>
    this._integrantes().filter((i) => i.rol === 'funcionario'),
  );

  readonly usuario = computed<Integrante>(
    () => this.integrantePorId(this._usuarioId()) ?? this._integrantes()[0],
  );

  readonly companeros = computed(() =>
    this.funcionarios().filter((i) => i.id !== this._usuarioId()),
  );

  readonly misTareas = computed(() =>
    this._tareas().filter((tarea) => tarea.asignados.includes(this._usuarioId())),
  );

  readonly tareasDelEquipo = computed(() =>
    this._tareas().filter(
      (tarea) => !tarea.asignados.includes(this._usuarioId()) && tarea.progreso < 100,
    ),
  );

  readonly resumenEquipo = computed<ResumenPersona[]>(() =>
    this.funcionarios()
      .map((integrante) => this.resumenDe(integrante.id))
      .sort((a, b) => b.cansancio - a.cansancio || b.carga - a.carga),
  );

  readonly resumenesPorId = computed(() => {
    const mapa = new Map<string, ResumenPersona>();
    for (const resumen of this.resumenEquipo()) {
      mapa.set(resumen.integrante.id, resumen);
    }
    return mapa;
  });

  readonly miResumen = computed<ResumenPersona>(() => this.resumenDe(this._usuarioId()));

  /** Una estación por tarea con actividad: monitos en la tarea y en sus subtareas. */
  readonly estaciones = computed<EstacionTrabajo[]>(() => {
    const resultado: EstacionTrabajo[] = [];

    for (const tarea of this._tareas()) {
      const subtareasActivas = tarea.miniTareas
        .filter((mini) => mini.activaPor.length > 0)
        .map((mini) => ({ mini, trabajadores: this.integrantesDe(mini.activaPor) }));

      if (tarea.activaPor.length === 0 && subtareasActivas.length === 0) continue;

      const ids = new Set<string>(tarea.activaPor);
      for (const subtarea of subtareasActivas) {
        for (const id of subtarea.mini.activaPor) ids.add(id);
      }

      resultado.push({ tarea, trabajadores: this.integrantesDe([...ids]), subtareasActivas });
    }

    return resultado.sort((a, b) => b.tarea.dias - a.tarea.dias);
  });

  readonly kpis = computed<KpisDepartamento>(() => {
    const estaciones = this.estaciones();
    const personas = new Set<string>();
    for (const estacion of estaciones) {
      for (const trabajador of estacion.trabajadores) personas.add(trabajador.id);
    }

    const tareasActivas = this._tareas().filter((tarea) => tarea.activaPor.length > 0).length;
    const subtareasActivas = this._tareas().reduce(
      (total, tarea) => total + tarea.miniTareas.filter((mini) => mini.activaPor.length > 0).length,
      0,
    );

    return {
      personasTrabajando: personas.size,
      tareasActivas,
      subtareasActivas,
      progresoPromedio: promedio(this._tareas().map((tarea) => tarea.progreso)),
      alertasCansancio: this.resumenEquipo().filter((resumen) => resumen.estado === 'agotado')
        .length,
    };
  });

  // ---------------------------------------------------------------- consultas

  integrantePorId(id: string): Integrante | undefined {
    return this._integrantes().find((integrante) => integrante.id === id);
  }

  integrantesDe(ids: string[]): Integrante[] {
    return this._integrantes().filter((integrante) => ids.includes(integrante.id));
  }

  resumenDe(id: string): ResumenPersona {
    const integrante = this.integrantePorId(id);
    const carga = medirCarga(this._tareas(), id);
    const cansancio = calcularCansancio(carga.carga, carga.diasMax);

    return {
      integrante: integrante ?? this.integranteFantasma(id),
      ...carga,
      cansancio,
      estado: estadoPorCansancio(cansancio),
    };
  }

  private integranteFantasma(id: string): Integrante {
    return {
      id,
      nombre: 'Sin asignar',
      cargo: '',
      iniciales: '??',
      color: '#94a3b8',
      tonoPiel: '#f2c9a0',
      tonoPelo: '#2f2b3a',
      rol: 'funcionario',
    };
  }

  /** Personas (únicas) trabajando en una tarea, sea en la grande o en subtareas. */
  trabajadoresDe(tarea: Tarea): Integrante[] {
    const ids = new Set<string>(tarea.activaPor);
    for (const mini of tarea.miniTareas) {
      for (const id of mini.activaPor) ids.add(id);
    }
    return this.integrantesDe([...ids]);
  }

  // --------------------------------------------------------------- mutaciones

  cambiarUsuario(id: string): void {
    if (this.integrantePorId(id)) this._usuarioId.set(id);
  }

  crearTarea(titulo: string, companeros: string[] = []): Tarea | undefined {
    const limpio = titulo.trim();
    if (!limpio) return undefined;

    const nueva: Tarea = {
      id: `t-${++this.secuencia}`,
      titulo: limpio,
      progreso: 0,
      dias: 0,
      creadaPor: this._usuarioId(),
      asignados: [...new Set([this._usuarioId(), ...companeros])],
      activaPor: [],
      miniTareas: [],
    };

    this._tareas.update((tareas) => [nueva, ...tareas]);
    return nueva;
  }

  /** Click en una tarjeta: activa/desactiva "estoy trabajando en esta tarea". */
  alternarTrabajo(tareaId: string): void {
    const usuarioId = this._usuarioId();
    this._tareas.update((tareas) =>
      tareas.map((tarea) => {
        if (tarea.id !== tareaId) return tarea;
        const trabajando = tarea.activaPor.includes(usuarioId);
        return {
          ...tarea,
          activaPor: trabajando
            ? tarea.activaPor.filter((id) => id !== usuarioId)
            : [...tarea.activaPor, usuarioId],
        };
      }),
    );
  }

  alternarMiniTarea(tareaId: string, miniId: string): void {
    const usuarioId = this._usuarioId();
    this._tareas.update((tareas) =>
      tareas.map((tarea) => {
        if (tarea.id !== tareaId) return tarea;
        return {
          ...tarea,
          miniTareas: tarea.miniTareas.map((mini) => {
            if (mini.id !== miniId) return mini;
            const trabajando = mini.activaPor.includes(usuarioId);
            return {
              ...mini,
              activaPor: trabajando
                ? mini.activaPor.filter((id) => id !== usuarioId)
                : [...mini.activaPor, usuarioId],
            };
          }),
        };
      }),
    );
  }

  agregarMiniTarea(tareaId: string, titulo: string): void {
    const limpio = titulo.trim();
    if (!limpio) return;

    this._tareas.update((tareas) =>
      tareas.map((tarea) =>
        tarea.id === tareaId
          ? {
              ...tarea,
              miniTareas: [
                ...tarea.miniTareas,
                { id: `m-${++this.secuencia}`, titulo: limpio, progreso: 0, activaPor: [] },
              ],
            }
          : tarea,
      ),
    );
  }

  ajustarProgreso(tareaId: string, progreso: number): void {
    const valor = limitarPorcentaje(progreso);
    this._tareas.update((tareas) =>
      tareas.map((tarea) => (tarea.id === tareaId ? { ...tarea, progreso: valor } : tarea)),
    );
  }

  ajustarProgresoMini(tareaId: string, miniId: string, progreso: number): void {
    const valor = limitarPorcentaje(progreso);
    this._tareas.update((tareas) =>
      tareas.map((tarea) =>
        tarea.id === tareaId
          ? {
              ...tarea,
              miniTareas: tarea.miniTareas.map((mini) =>
                mini.id === miniId ? { ...mini, progreso: valor } : mini,
              ),
            }
          : tarea,
      ),
    );
  }

  /** Recalcula el avance de la tarea grande como promedio de sus subtareas. */
  aplicarPromedioSubtareas(tareaId: string): void {
    const tarea = this._tareas().find((item) => item.id === tareaId);
    if (!tarea || tarea.miniTareas.length === 0) return;
    this.ajustarProgreso(tareaId, promedio(tarea.miniTareas.map((mini) => mini.progreso)));
  }

  /** Sumarse a una tarea de un colega y empezar a trabajar de inmediato. */
  unirmeATarea(tareaId: string): void {
    const usuarioId = this._usuarioId();
    this._tareas.update((tareas) =>
      tareas.map((tarea) => {
        if (tarea.id !== tareaId) return tarea;
        const asignados = tarea.asignados.includes(usuarioId)
          ? tarea.asignados
          : [...tarea.asignados, usuarioId];
        const activaPor = tarea.activaPor.includes(usuarioId)
          ? tarea.activaPor
          : [...tarea.activaPor, usuarioId];
        return { ...tarea, asignados, activaPor };
      }),
    );
  }

  salirDeTarea(tareaId: string): void {
    const usuarioId = this._usuarioId();
    this._tareas.update((tareas) =>
      tareas.map((tarea) =>
        tarea.id === tareaId
          ? {
              ...tarea,
              asignados: tarea.asignados.filter((id) => id !== usuarioId),
              activaPor: tarea.activaPor.filter((id) => id !== usuarioId),
              miniTareas: tarea.miniTareas.map((mini) => ({
                ...mini,
                activaPor: mini.activaPor.filter((id) => id !== usuarioId),
              })),
            }
          : tarea,
      ),
    );
  }

  eliminarTarea(tareaId: string): void {
    this._tareas.update((tareas) => tareas.filter((tarea) => tarea.id !== tareaId));
  }

  eliminarMiniTarea(tareaId: string, miniId: string): void {
    this._tareas.update((tareas) =>
      tareas.map((tarea) =>
        tarea.id === tareaId
          ? { ...tarea, miniTareas: tarea.miniTareas.filter((mini) => mini.id !== miniId) }
          : tarea,
      ),
    );
  }

  /** Agrega a un colega como responsable de una tarea existente. */
  sumarAsignado(tareaId: string, integranteId: string): void {
    this._tareas.update((tareas) =>
      tareas.map((tarea) =>
        tarea.id === tareaId && !tarea.asignados.includes(integranteId)
          ? { ...tarea, asignados: [...tarea.asignados, integranteId] }
          : tarea,
      ),
    );
  }

  /** Control de demo: suma un día a todas las tareas (y sube el cansancio). */
  avanzarDia(): void {
    this._tareas.update((tareas) => tareas.map((tarea) => ({ ...tarea, dias: tarea.dias + 1 })));
  }

  reiniciarDemo(): void {
    this._integrantes.set(crearIntegrantes());
    this._tareas.set(crearTareas());
    this._usuarioId.set(USUARIO_INICIAL);
  }
}
