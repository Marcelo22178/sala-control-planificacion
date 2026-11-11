import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Barra de avance reutilizable. Se anima cuando la tarea está en marcha. */
@Component({
  selector: 'app-barra-progreso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="barra" [class.barra--viva]="animada()" [class.barra--completa]="progreso() >= 100">
      <span class="barra__relleno" [style.width.%]="progreso()"></span>
      <span class="barra__brillo"></span>
    </div>
    @if (mostrarValor()) {
      <span class="barra__valor" [class.barra__valor--viva]="animada()">{{ progreso() }}%</span>
    }
  `,
})
export class BarraProgreso {
  readonly progreso = input.required<number>();
  readonly animada = input(false);
  readonly mostrarValor = input(true);
}
