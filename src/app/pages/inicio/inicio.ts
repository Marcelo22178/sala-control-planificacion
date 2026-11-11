import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepartamentoService } from '../../core/departamento.service';
import { Avatar } from '../../shared/avatar/avatar';
import { Icono } from '../../shared/icono/icono';
import { MonitoPixel } from '../../shared/monito-pixel/monito-pixel';

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icono, MonitoPixel, Avatar],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly depto = inject(DepartamentoService);

  readonly jefa = this.depto.jefa;
  readonly funcionarios = this.depto.funcionarios;
  readonly kpis = this.depto.kpis;
  readonly tareas = this.depto.tareas;
}
