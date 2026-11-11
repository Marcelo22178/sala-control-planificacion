import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NombreIcono =
  | 'rayo'
  | 'play'
  | 'pausa'
  | 'mas'
  | 'chevron'
  | 'reloj'
  | 'usuarios'
  | 'alerta'
  | 'grafico'
  | 'basura'
  | 'objetivo'
  | 'refrescar'
  | 'dia'
  | 'equipo'
  | 'flecha'
  | 'check'
  | 'cruz'
  | 'chispa'
  | 'enlace'
  | 'paleta'
  | 'luna';

/** Set de iconos inline (sin librerías): heredan el color del texto. */
@Component({
  selector: 'app-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="tamano()"
      [attr.height]="tamano()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (nombre()) {
        @case ('rayo') {
          <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10.5H13z" fill="currentColor" stroke="none" />
        }
        @case ('play') {
          <path d="M7 4.4v15.2L19.5 12z" fill="currentColor" stroke="none" />
        }
        @case ('pausa') {
          <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
          <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
        }
        @case ('mas') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('chevron') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('reloj') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5.2l3.4 2" />
        }
        @case ('usuarios') {
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M16 5.3a3.2 3.2 0 0 1 0 5.4M17.5 14.2A5.5 5.5 0 0 1 20.5 20" />
        }
        @case ('alerta') {
          <path d="M12 3.5 21 20H3z" />
          <path d="M12 9.5v4.2M12 17h.01" />
        }
        @case ('grafico') {
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        }
        @case ('basura') {
          <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
        }
        @case ('objetivo') {
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        }
        @case ('refrescar') {
          <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
          <path d="M20.5 4v5h-5" />
        }
        @case ('dia') {
          <circle cx="12" cy="12" r="4.2" />
          <path
            d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6"
          />
        }
        @case ('equipo') {
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
        }
        @case ('flecha') {
          <path d="M19 12H5M11 19l-7-7 7-7" />
        }
        @case ('check') {
          <path d="M20 6 9 17l-5-5" />
        }
        @case ('cruz') {
          <path d="M18 6 6 18M6 6l12 12" />
        }
        @case ('chispa') {
          <path d="M12 3.2l1.9 5.3 5.3 1.9-5.3 1.9L12 17.6l-1.9-5.3L4.8 10.4l5.3-1.9z" />
          <path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
        }
        @case ('enlace') {
          <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
          <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
        }
        @case ('paleta') {
          <path
            d="M12 3a9 9 0 1 0 0 18h1.6a2.4 2.4 0 0 0 0-4.8H12a2 2 0 0 1 0-4h4.2A4.8 4.8 0 0 0 21 7.5C21 5 17 3 12 3z"
          />
          <circle cx="7.6" cy="11.4" r="1" fill="currentColor" stroke="none" />
          <circle cx="9.6" cy="7.6" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.2" cy="7" r="1" fill="currentColor" stroke="none" />
        }
        @case ('luna') {
          <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3z" />
        }
      }
    </svg>
  `,
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  readonly tamano = input(18);
}
