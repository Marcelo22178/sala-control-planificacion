import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepartamentoService } from '../../core/departamento.service';
import { Avatar } from '../../shared/avatar/avatar';
import { Icono } from '../../shared/icono/icono';
import { MonitoPixel } from '../../shared/monito-pixel/monito-pixel';
import { TarjetaEstacion } from './tarjeta-estacion';
import { TarjetaPersona } from './tarjeta-persona';

@Component({
  selector: 'app-jefatura',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Icono, MonitoPixel, TarjetaEstacion, TarjetaPersona],
  templateUrl: './jefatura.html',
})
export class Jefatura {
  private readonly depto = inject(DepartamentoService);

  readonly jefa = this.depto.jefa;
  readonly kpis = this.depto.kpis;
  readonly estaciones = this.depto.estaciones;
  readonly resumenEquipo = this.depto.resumenEquipo;
  readonly funcionarios = this.depto.funcionarios;
  readonly tareas = this.depto.tareas;

  readonly fecha = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  readonly enMarcha = computed(
    () => this.resumenEquipo().filter((resumen) => resumen.carga > 0).length,
  );

  avanzarDia(): void {
    this.depto.avanzarDia();
  }

  reiniciar(): void {
    if (confirm('¿Reiniciar la demo con los datos de ejemplo?')) {
      this.depto.reiniciarDemo();
    }
  }
}
