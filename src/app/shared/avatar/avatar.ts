import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Integrante } from '../../core/models';

/** Avatar de iniciales con el color del integrante. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="avatar"
      [style.--avatar-color]="integrante().color"
      [style.width.px]="tamano()"
      [style.height.px]="tamano()"
      [style.font-size.px]="tamano() * 0.38"
      [attr.title]="integrante().nombre"
      >{{ integrante().iniciales }}</span
    >
  `,
})
export class Avatar {
  readonly integrante = input.required<Integrante>();
  readonly tamano = input(34);
}
