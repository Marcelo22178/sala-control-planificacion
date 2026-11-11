import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GestorAspecto } from './shared/gestor-aspecto/gestor-aspecto';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GestorAspecto],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
