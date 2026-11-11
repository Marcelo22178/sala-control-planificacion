import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AspectoService, CaraMonito } from '../../core/aspecto.service';
import { EstadoAnimo } from '../../core/models';
import { oscurecer } from '../../core/reglas';

interface Pixel {
  x: number;
  y: number;
  color: string;
}

/**
 * Personaje pixel art construido con una grilla de caracteres:
 * H = pelo, S = piel, C = camisa, D = sombra camisa, P = pantalón, B = zapatos.
 */
const CUERPO = [
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HSSSSSSH....',
  '....HSSSSSSH....',
  '....SSSSSSSS....',
  '....SSSSSSSS....',
  '.....SSSSSS.....',
  '......SSSS......',
  '....CCCCCCCC....',
  '...CCCCCCCCCC...',
  '...CCCCCCCCCC...',
  '...CCCCCCCCCC...',
  '...CDDDDDDDDC...',
  '....PPPPPPPP....',
  '....PPP..PPP....',
  '....BBB..BBB....',
  '................',
];

@Component({
  selector: 'app-monito-pixel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './monito-pixel.html',
})
export class MonitoPixel {
  private readonly aspecto = inject(AspectoService);

  /** Color de la camisa (normalmente el color del integrante). */
  readonly color = input('#22d3ee');
  readonly tonoPiel = input('#f2c9a0');
  readonly tonoPelo = input('#2f2b3a');
  readonly estado = input<EstadoAnimo>('fresco');
  readonly trabajando = input(false);
  readonly tamano = input(92);
  /** Nombre accesible del personaje. */
  readonly nombre = input('Monito trabajador');
  /** Si se entrega, aplica la personalización guardada de ese integrante. */
  readonly integranteId = input<string | null>(null);
  readonly cara = input<CaraMonito>('clasica');

  readonly avatar = computed(() => {
    const id = this.integranteId();
    return id ? this.aspecto.avatarDe(id) : undefined;
  });

  readonly colorCamisa = computed(() => this.avatar()?.color ?? this.color());
  readonly piel = computed(() => this.avatar()?.tonoPiel ?? this.tonoPiel());
  readonly pelo = computed(() => this.avatar()?.tonoPelo ?? this.tonoPelo());
  readonly caraFinal = computed(() => this.avatar()?.cara ?? this.cara());
  readonly pecas = computed(() => oscurecer(this.piel(), 0.62));

  readonly pixeles = computed<Pixel[]>(() => {
    const colores: Record<string, string> = {
      H: this.pelo(),
      S: this.piel(),
      C: this.colorCamisa(),
      D: oscurecer(this.colorCamisa()),
      P: '#334155',
      B: '#111827',
    };

    const resultado: Pixel[] = [];
    CUERPO.forEach((fila, y) => {
      fila.split('').forEach((caracter, x) => {
        const color = colores[caracter];
        if (color) resultado.push({ x, y, color });
      });
    });
    return resultado;
  });

  readonly alto = computed(() => Math.round((this.tamano() * 18) / 16));
}
