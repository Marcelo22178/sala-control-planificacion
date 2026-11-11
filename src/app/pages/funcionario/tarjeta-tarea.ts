import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DepartamentoService } from '../../core/departamento.service';
import { Tarea } from '../../core/models';
import { etiquetaEstado, promedio } from '../../core/reglas';
import { Avatar } from '../../shared/avatar/avatar';
import { BarraProgreso } from '../../shared/barra-progreso/barra-progreso';
import { Icono } from '../../shared/icono/icono';
import { MonitoPixel } from '../../shared/monito-pixel/monito-pixel';

/**
 * Tarjeta de tarea del panel de funcionario.
 * Un click activa/desactiva el trabajo; doble click abre las mini tareas.
 */
@Component({
  selector: 'app-tarjeta-tarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, BarraProgreso, Icono, MonitoPixel],
  templateUrl: './tarjeta-tarea.html',
})
export class TarjetaTarea {
  private readonly depto = inject(DepartamentoService);
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  readonly tarea = input.required<Tarea>();

  readonly abierta = signal(false);
  readonly nuevaMini = signal('');
  readonly sumandoColega = signal(false);

  readonly usuarioId = this.depto.usuarioId;
  readonly usuario = this.depto.usuario;
  readonly miResumen = this.depto.miResumen;

  readonly trabajando = computed(() => this.tarea().activaPor.includes(this.usuarioId()));
  readonly miniActivas = computed(
    () =>
      this.tarea().miniTareas.filter((mini) => mini.activaPor.includes(this.usuarioId())).length,
  );
  readonly enMarcha = computed(() => this.trabajando() || this.miniActivas() > 0);
  readonly etiquetaTarea = computed(() => {
    if (this.trabajando()) return 'Trabajando';
    if (this.miniActivas() > 0) return 'En mini tareas';
    return 'En pausa';
  });
  readonly colaboradores = computed(() => this.depto.integrantesDe(this.tarea().asignados));
  readonly companerosDisponibles = computed(() =>
    this.depto.companeros().filter((persona) => !this.tarea().asignados.includes(persona.id)),
  );
  readonly promedioMini = computed(() =>
    promedio(this.tarea().miniTareas.map((mini) => mini.progreso)),
  );
  readonly etiqueta = computed(() => etiquetaEstado(this.miResumen().estado));

  clicTarjeta(): void {
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.depto.alternarTrabajo(this.tarea().id);
      this.temporizador = null;
    }, 200);
  }

  dobleClic(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
    this.abierta.update((valor) => !valor);
  }

  alternar(): void {
    this.depto.alternarTrabajo(this.tarea().id);
  }

  alternarMini(miniId: string): void {
    this.depto.alternarMiniTarea(this.tarea().id, miniId);
  }

  estadoMini(miniId: string): boolean {
    const mini = this.tarea().miniTareas.find((item) => item.id === miniId);
    return mini ? mini.activaPor.includes(this.usuarioId()) : false;
  }

  agregarMini(evento: Event): void {
    evento.preventDefault();
    const titulo = this.nuevaMini();
    if (!titulo.trim()) return;
    this.depto.agregarMiniTarea(this.tarea().id, titulo);
    this.nuevaMini.set('');
  }

  escribirMini(evento: Event): void {
    this.nuevaMini.set((evento.target as HTMLInputElement).value);
  }

  cambiarProgreso(evento: Event): void {
    this.depto.ajustarProgreso(this.tarea().id, Number((evento.target as HTMLInputElement).value));
  }

  cambiarProgresoMini(miniId: string, evento: Event): void {
    this.depto.ajustarProgresoMini(
      this.tarea().id,
      miniId,
      Number((evento.target as HTMLInputElement).value),
    );
  }

  aplicarPromedio(): void {
    this.depto.aplicarPromedioSubtareas(this.tarea().id);
  }

  sumarColega(integranteId: string): void {
    this.depto.sumarAsignado(this.tarea().id, integranteId);
    this.sumandoColega.set(false);
  }

  salir(): void {
    this.depto.salirDeTarea(this.tarea().id);
  }

  eliminar(): void {
    if (confirm(`¿Eliminar la tarea "${this.tarea().titulo}"?`)) {
      this.depto.eliminarTarea(this.tarea().id);
    }
  }

  eliminarMini(miniId: string, titulo: string): void {
    if (confirm(`¿Eliminar la mini tarea "${titulo}"?`)) {
      this.depto.eliminarMiniTarea(this.tarea().id, miniId);
    }
  }
}
