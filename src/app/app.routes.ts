import { Routes } from '@angular/router';

/**
 * Dos vistas separadas por link, tal como se pidió:
 *  · /funcionario  → creación rápida, activación y mini tareas
 *  · /jefatura     → visor de monitos, días, cargas y cansancio
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Planificación · Inicio',
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'funcionario',
    title: 'Planificación · Mi panel',
    loadComponent: () => import('./pages/funcionario/funcionario').then((m) => m.Funcionario),
  },
  {
    path: 'jefatura',
    title: 'Planificación · Jefatura',
    loadComponent: () => import('./pages/jefatura/jefatura').then((m) => m.Jefatura),
  },
  { path: '**', redirectTo: '' },
];
