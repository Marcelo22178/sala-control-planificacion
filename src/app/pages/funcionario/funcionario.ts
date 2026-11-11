import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AspectoService } from '../../core/aspecto.service';
import { DepartamentoService } from '../../core/departamento.service';
import { Tarea } from '../../core/models';
import { etiquetaEstado } from '../../core/reglas';
import { Avatar } from '../../shared/avatar/avatar';
import { BarraProgreso } from '../../shared/barra-progreso/barra-progreso';
import { Icono } from '../../shared/icono/icono';
import { MonitoPixel } from '../../shared/monito-pixel/monito-pixel';
import { TarjetaTarea } from './tarjeta-tarea';

@Component({
  selector: 'app-funcionario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, BarraProgreso, Icono, MonitoPixel, TarjetaTarea],
  templateUrl: './funcionario.html',
  host: { '(document:keydown)': 'atajo($event)' },
})
export class Funcionario {
  private readonly depto = inject(DepartamentoService);
  private readonly aspecto = inject(AspectoService);
  private temporizadorToast: ReturnType<typeof setTimeout> | null = null;

  readonly usuario = this.depto.usuario;
  readonly usuarioId = this.depto.usuarioId;
  readonly funcionarios = this.depto.funcionarios;
  readonly companeros = this.depto.companeros;
  readonly misTareas = this.depto.misTareas;
  readonly tareasDelEquipo = this.depto.tareasDelEquipo;
  readonly miResumen = this.depto.miResumen;

  readonly nuevaTarea = signal('');
  readonly seleccionados = signal<string[]>([]);
  readonly toast = signal('');

  private readonly entrada = viewChild<ElementRef<HTMLInputElement>>('entrada');

  readonly primerNombre = computed(() => this.usuario().nombre.split(' ')[0]);
  readonly estado = computed(() => etiquetaEstado(this.miResumen().estado));
  readonly enMarcha = computed(
    () => this.miResumen().tareasActivas + this.miResumen().subtareasActivas,
  );

  cambiarUsuario(evento: Event): void {
    this.depto.cambiarUsuario((evento.target as HTMLSelectElement).value);
  }

  escribir(evento: Event): void {
    this.nuevaTarea.set((evento.target as HTMLInputElement).value);
  }

  alternarCompanero(id: string): void {
    this.seleccionados.update((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }

  crear(evento?: Event): void {
    evento?.preventDefault();
    const creada = this.depto.crearTarea(this.nuevaTarea(), this.seleccionados());
    if (!creada) return;

    this.nuevaTarea.set('');
    this.seleccionados.set([]);
    this.avisar(`Tarea creada: ${creada.titulo}`);
    this.entrada()?.nativeElement.focus();
  }

  unirme(tarea: Tarea): void {
    this.depto.unirmeATarea(tarea.id);
    this.avisar(`Te sumaste a "${tarea.titulo}"`);
  }

  editarMonito(): void {
    this.aspecto.abrir('monito');
  }

  colaboradoresDe(tarea: Tarea) {
    return this.depto.integrantesDe(tarea.asignados);
  }

  atajo(evento: KeyboardEvent): void {
    const objetivo = evento.target as HTMLElement | null;
    const escribiendo =
      objetivo !== null && ['INPUT', 'TEXTAREA', 'SELECT'].includes(objetivo.tagName);
    if (escribiendo || evento.ctrlKey || evento.metaKey || evento.altKey) return;

    if (evento.key.toLowerCase() === 'n') {
      evento.preventDefault();
      this.entrada()?.nativeElement.focus();
    }
  }

  private avisar(mensaje: string): void {
    this.toast.set(mensaje);
    if (this.temporizadorToast) clearTimeout(this.temporizadorToast);
    this.temporizadorToast = setTimeout(() => this.toast.set(''), 2800);
  }
}
