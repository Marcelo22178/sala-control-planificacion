import { Injectable, computed, effect, signal } from '@angular/core';
import { oscurecer } from './reglas';

export type TemaAspecto = 'noche' | 'dia';
export type SeccionAspecto = 'interfaz' | 'monito';
export type CaraMonito = 'clasica' | 'lentes' | 'barba' | 'pecas';

export interface AcentoAspecto {
  id: string;
  nombre: string;
  valor: string;
}

export interface AvatarPersonalizado {
  color?: string;
  tonoPiel?: string;
  tonoPelo?: string;
  cara?: CaraMonito;
}

export const ACENTOS: AcentoAspecto[] = [
  { id: 'cian', nombre: 'Cian', valor: '#22d3ee' },
  { id: 'ambar', nombre: 'Ámbar', valor: '#fbbf24' },
  { id: 'violeta', nombre: 'Violeta', valor: '#a78bfa' },
  { id: 'verde', nombre: 'Verde', valor: '#34d399' },
  { id: 'rosa', nombre: 'Rosa', valor: '#fb7185' },
];

/** Paletas básicas del editor de monito. */
export const PIELES = ['#f7d7b5', '#f2c9a0', '#d9a066', '#a86b3c', '#8a5a33', '#6b4423'];
export const PELOS = ['#1c1c22', '#2f2b3a', '#4a2f1b', '#7a4b1e', '#b87333', '#d1d5db'];
export const POLERAS = [
  '#22d3ee',
  '#a78bfa',
  '#34d399',
  '#fb7185',
  '#fbbf24',
  '#60a5fa',
  '#fb923c',
  '#e2e8f0',
];

export const CARAS: { id: CaraMonito; nombre: string }[] = [
  { id: 'clasica', nombre: 'Clásica' },
  { id: 'lentes', nombre: 'Lentes' },
  { id: 'barba', nombre: 'Barba' },
  { id: 'pecas', nombre: 'Pecas' },
];

const CLAVE = 'planificacion.aspecto.v1';

interface PreferenciasAspecto {
  tema: TemaAspecto;
  acento: string;
  animaciones: boolean;
  grilla: boolean;
  avatares: Record<string, AvatarPersonalizado>;
}

/**
 * Gestor de aspecto + editor del monito.
 * Escribe variables CSS/atributos en <html> y resuelve los colores personalizados
 * de cada integrante. Solo apariencia: no toca las tareas de la demo.
 */
@Injectable({ providedIn: 'root' })
export class AspectoService {
  readonly acentos = ACENTOS;
  readonly pieles = PIELES;
  readonly pelos = PELOS;
  readonly poleras = POLERAS;
  readonly caras = CARAS;

  readonly tema = signal<TemaAspecto>('noche');
  readonly acentoId = signal<string>('cian');
  readonly animaciones = signal(true);
  readonly grilla = signal(true);
  readonly avatares = signal<Record<string, AvatarPersonalizado>>({});

  /** Estado del panel flotante (compartido con la tarjeta del monito). */
  readonly panelAbierto = signal(false);
  readonly seccion = signal<SeccionAspecto>('interfaz');

  readonly acento = computed(
    () => ACENTOS.find((item) => item.id === this.acentoId()) ?? ACENTOS[0],
  );

  constructor() {
    this.cargar();

    effect(() => {
      const tema = this.tema();
      const acento = this.acento();
      const animaciones = this.animaciones();
      const grilla = this.grilla();
      const avatares = this.avatares();

      if (typeof document === 'undefined') return;

      const raiz = document.documentElement;
      raiz.dataset['tema'] = tema;
      raiz.dataset['animaciones'] = animaciones ? 'on' : 'off';
      raiz.dataset['grilla'] = grilla ? 'on' : 'off';
      raiz.style.setProperty('--cian', acento.valor);
      raiz.style.setProperty('--cian-oscuro', oscurecer(acento.valor, 0.62));

      try {
        const preferencias: PreferenciasAspecto = {
          tema,
          acento: acento.id,
          animaciones,
          grilla,
          avatares,
        };
        localStorage.setItem(CLAVE, JSON.stringify(preferencias));
      } catch {
        // Modo privado o storage lleno: la demo sigue funcionando sin recordar.
      }
    });
  }

  // ------------------------------------------------------------ panel

  abrir(seccion: SeccionAspecto = 'interfaz'): void {
    this.seccion.set(seccion);
    this.panelAbierto.set(true);
  }

  cerrar(): void {
    this.panelAbierto.set(false);
  }

  alternar(): void {
    if (this.panelAbierto()) {
      this.cerrar();
      return;
    }
    this.abrir('interfaz');
  }

  ver(seccion: SeccionAspecto): void {
    this.seccion.set(seccion);
  }

  // ------------------------------------------------------------ interfaz

  cambiarTema(tema: TemaAspecto): void {
    this.tema.set(tema);
  }

  cambiarAcento(id: string): void {
    if (ACENTOS.some((item) => item.id === id)) this.acentoId.set(id);
  }

  alternarAnimaciones(): void {
    this.animaciones.update((valor) => !valor);
  }

  alternarGrilla(): void {
    this.grilla.update((valor) => !valor);
  }

  reiniciar(): void {
    this.tema.set('noche');
    this.acentoId.set('cian');
    this.animaciones.set(true);
    this.grilla.set(true);
  }

  // ------------------------------------------------------------ monito

  avatarDe(integranteId: string): AvatarPersonalizado | undefined {
    return this.avatares()[integranteId];
  }

  personalizarAvatar(integranteId: string, cambios: AvatarPersonalizado): void {
    this.avatares.update((avatares) => ({
      ...avatares,
      [integranteId]: { ...avatares[integranteId], ...cambios },
    }));
  }

  reiniciarAvatar(integranteId: string): void {
    this.avatares.update((avatares) => {
      const copia = { ...avatares };
      delete copia[integranteId];
      return copia;
    });
  }

  // ------------------------------------------------------------ persistencia

  private cargar(): void {
    try {
      const crudo = localStorage.getItem(CLAVE);
      if (!crudo) return;

      const datos = JSON.parse(crudo) as Partial<PreferenciasAspecto>;
      if (datos.tema === 'noche' || datos.tema === 'dia') this.tema.set(datos.tema);
      if (typeof datos.acento === 'string' && ACENTOS.some((item) => item.id === datos.acento)) {
        this.acentoId.set(datos.acento);
      }
      if (typeof datos.animaciones === 'boolean') this.animaciones.set(datos.animaciones);
      if (typeof datos.grilla === 'boolean') this.grilla.set(datos.grilla);
      this.avatares.set(this.normalizarAvatares(datos.avatares));
    } catch {
      // Preferencias corruptas: se usan los valores por defecto.
    }
  }

  private normalizarAvatares(valor: unknown): Record<string, AvatarPersonalizado> {
    if (!valor || typeof valor !== 'object') return {};

    const salida: Record<string, AvatarPersonalizado> = {};
    for (const [id, crudo] of Object.entries(valor as Record<string, unknown>)) {
      if (!crudo || typeof crudo !== 'object') continue;

      const datos = crudo as AvatarPersonalizado;
      const avatar: AvatarPersonalizado = {};
      if (typeof datos.color === 'string') avatar.color = datos.color;
      if (typeof datos.tonoPiel === 'string') avatar.tonoPiel = datos.tonoPiel;
      if (typeof datos.tonoPelo === 'string') avatar.tonoPelo = datos.tonoPelo;
      if (datos.cara && CARAS.some((cara) => cara.id === datos.cara)) avatar.cara = datos.cara;

      if (Object.keys(avatar).length > 0) salida[id] = avatar;
    }
    return salida;
  }
}
