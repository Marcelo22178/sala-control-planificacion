import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  AspectoService,
  CaraMonito,
  SeccionAspecto,
  TemaAspecto,
} from '../../core/aspecto.service';
import { DepartamentoService } from '../../core/departamento.service';
import { Icono } from '../icono/icono';
import { MonitoPixel } from '../monito-pixel/monito-pixel';

/**
 * Gestor de aspecto (tema/acento/animaciones/fondo) + editor del monito propio.
 * Flota sobre todas las vistas; no modifica las tareas de la demo.
 */
@Component({
  selector: 'app-gestor-aspecto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icono, MonitoPixel],
  templateUrl: './gestor-aspecto.html',
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class GestorAspecto {
  private readonly aspecto = inject(AspectoService);
  private readonly depto = inject(DepartamentoService);

  readonly abierto = this.aspecto.panelAbierto;
  readonly seccion = this.aspecto.seccion;

  readonly tema = this.aspecto.tema;
  readonly acentoId = this.aspecto.acentoId;
  readonly acento = this.aspecto.acento;
  readonly animaciones = this.aspecto.animaciones;
  readonly grilla = this.aspecto.grilla;
  readonly acentos = this.aspecto.acentos;
  readonly pieles = this.aspecto.pieles;
  readonly pelos = this.aspecto.pelos;
  readonly poleras = this.aspecto.poleras;
  readonly caras = this.aspecto.caras;

  readonly usuario = this.depto.usuario;
  readonly miResumen = this.depto.miResumen;

  readonly avatarActual = computed(() => this.aspecto.avatarDe(this.usuario().id));
  readonly pielActual = computed(() => this.avatarActual()?.tonoPiel ?? this.usuario().tonoPiel);
  readonly peloActual = computed(() => this.avatarActual()?.tonoPelo ?? this.usuario().tonoPelo);
  readonly poleraActual = computed(() => this.avatarActual()?.color ?? this.usuario().color);
  readonly caraActual = computed(() => this.avatarActual()?.cara ?? 'clasica');

  alternarPanel(): void {
    this.aspecto.alternar();
  }

  cerrar(): void {
    this.aspecto.cerrar();
  }

  ver(seccion: SeccionAspecto): void {
    this.aspecto.ver(seccion);
  }

  cambiarTema(tema: TemaAspecto): void {
    this.aspecto.cambiarTema(tema);
  }

  cambiarAcento(id: string): void {
    this.aspecto.cambiarAcento(id);
  }

  alternarAnimaciones(): void {
    this.aspecto.alternarAnimaciones();
  }

  alternarGrilla(): void {
    this.aspecto.alternarGrilla();
  }

  reiniciar(): void {
    this.aspecto.reiniciar();
  }

  cambiarPiel(tono: string): void {
    this.aspecto.personalizarAvatar(this.usuario().id, { tonoPiel: tono });
  }

  cambiarPelo(tono: string): void {
    this.aspecto.personalizarAvatar(this.usuario().id, { tonoPelo: tono });
  }

  cambiarPolera(color: string): void {
    this.aspecto.personalizarAvatar(this.usuario().id, { color });
  }

  cambiarCara(cara: CaraMonito): void {
    this.aspecto.personalizarAvatar(this.usuario().id, { cara });
  }

  reiniciarMonito(): void {
    this.aspecto.reiniciarAvatar(this.usuario().id);
  }
}
