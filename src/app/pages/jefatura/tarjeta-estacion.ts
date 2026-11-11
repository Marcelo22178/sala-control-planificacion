import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DepartamentoService } from '../../core/departamento.service';
import { EstacionTrabajo } from '../../core/models';
import { etiquetaEstado } from '../../core/reglas';
import { Avatar } from '../../shared/avatar/avatar';
import { BarraProgreso } from '../../shared/barra-progreso/barra-progreso';
import { Icono } from '../../shared/icono/icono';
import { MonitoPixel } from '../../shared/monito-pixel/monito-pixel';

/** Tarjeta del visor de jefatura: una tarea con sus monitos trabajando. */
@Component({
  selector: 'app-tarjeta-estacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, BarraProgreso, Icono, MonitoPixel],
  templateUrl: './tarjeta-estacion.html',
})
export class TarjetaEstacion {
  private readonly depto = inject(DepartamentoService);

  readonly estacion = input.required<EstacionTrabajo>();

  readonly resumenes = this.depto.resumenesPorId;
  readonly agotados = computed(
    () =>
      this.estacion().trabajadores.filter(
        (persona) => this.resumenes().get(persona.id)?.estado === 'agotado',
      ).length,
  );

  estadoDe(id: string) {
    return this.resumenes().get(id)?.estado ?? 'fresco';
  }

  cansancioDe(id: string): number {
    return this.resumenes().get(id)?.cansancio ?? 0;
  }

  cargaDe(id: string): number {
    return this.resumenes().get(id)?.carga ?? 0;
  }

  etiquetaDe(id: string): string {
    return etiquetaEstado(this.estadoDe(id));
  }

  primerNombre(nombre: string): string {
    return nombre.split(' ')[0];
  }
}
