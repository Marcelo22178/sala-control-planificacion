import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ResumenPersona } from '../../core/models';
import { etiquetaEstado } from '../../core/reglas';
import { Avatar } from '../../shared/avatar/avatar';
import { Icono } from '../../shared/icono/icono';
import { MonitoPixel } from '../../shared/monito-pixel/monito-pixel';

/** Ficha de una persona: carga, días y cansancio individual. */
@Component({
  selector: 'app-tarjeta-persona',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, Icono, MonitoPixel],
  templateUrl: './tarjeta-persona.html',
})
export class TarjetaPersona {
  readonly resumen = input.required<ResumenPersona>();

  readonly etiqueta = computed(() => etiquetaEstado(this.resumen().estado));
  readonly enMarcha = computed(() => this.resumen().carga > 0);
  readonly totalActivas = computed(
    () => this.resumen().tareasActivas + this.resumen().subtareasActivas,
  );
}
