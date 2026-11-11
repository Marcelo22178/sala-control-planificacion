# Sala de control · Departamento de Planificación y Proyectos Estratégicos

Mini app **Angular 21** (standalone, signals, zoneless) para demo visual: los integrantes del
departamento crean tareas al vuelo, marcan en qué están trabajando y la jefatura ve a todo el equipo
en vivo con monitos pixel art que se cansan según los días y la carga.

**Demo en vivo:** https://marcelo22178.github.io/sala-control-planificacion/

Repositorio: https://github.com/Marcelo22178/sala-control-planificacion

> **Datos de tareas solo en memoria.** No hay backend: al recargar la página o reiniciar el servidor
> vuelve el seed de ejemplo (`src/app/data/seed.ts`). El acceso a datos está aislado en
> `DepartamentoService`, listo para reemplazar por llamadas HTTP.
>
> La única preferencia que se recuerda es el **aspecto** (tema, acento, animaciones y fondo), guardada
> en `localStorage` para no configurarla en cada visita. Las tareas nunca se persisten.

## Requisitos y ejecución

```powershell
cd D:\mini-app
npm install      # ya ejecutado
npm start        # http://localhost:4200
```

Build de producción: `npm run build` (salida en `dist/mini-app`).

- Node instalado en esta máquina: **v22.13.0** → por eso el proyecto usa **Angular 21.2.x**.
- Angular 22 exige Node `^22.22.3`, `^24.15` o `>=26`; al actualizar Node basta con
  `npm i @angular/{core,common,compiler,forms,platform-browser,router}@latest @angular/{build,cli,compiler-cli}@latest`
  y volver a compilar (el código no usa APIs removidas).

## Rutas

| Ruta           | Vista                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| `/`            | Portada: elegir rol (funcionario/a o jefatura)                          |
| `/funcionario` | Panel personal: captura rápida, activar tareas, mini tareas             |
| `/jefatura`    | Sala de control: monitos por tarea, días, cargas, cansancio y simulador |

## Equipo de ejemplo

Jefatura: **Catarina González**. Funcionarios: **Josías Montecinos**, **Jessi Montecinos**,
**Marcelo Hurtado**, **Tamara Villega** y **Vicente Reyes**.

El seed deja estados listos para mostrar: dos personas en la misma tarea (Josías y Jessi), tres
**cansados** (Josías, Jessi y Marcelo), una **agotada** (Tamara, 12 días), una **fresca** (Vicente),
tareas al 0 % recién creadas y mini tareas activas. El usuario inicial del panel es Josías.

## Funcionario/a

- **Captura ultrarrápida**: input con autofocus, `Enter` crea la tarea al **0 %**. Atajo `N` para
  enfocar, chips para sumar colegas y toast de confirmación.
- **Click** en la tarjeta: activar/desactivar “estoy trabajando” (queda activa hasta el segundo
  click). Hay un debounce de 200 ms para convivir con el doble click.
- **Doble click** (o chevron): abre las **mini tareas**. Cada una tiene su propio %, se puede marcar
  varias a la vez y el monito se anima mientras haya alguna activa.
- Barra de avance, días acumulados, colaboradores y medidor de cansancio propio.
- **Tareas del equipo**: sumarse a la tarea de un colega con “Unirme”. En la jefatura aparecerán
  **dos monitos** en esa tarea, cada uno con su propio cansancio.
- Selector “¿Quién eres?” para probar la demo con cada integrante.
- **Click en la tarjeta del monito** (arriba a la derecha) para personalizar piel, pelo, polera y
  cara de tu personaje; la jefatura ve el mismo estilo.

## Jefatura

- KPIs: personas trabajando, tareas y mini tareas activas, avance promedio y alertas de cansancio.
- **Sala de trabajo**: una tarjeta por tarea con actividad, con un monito por persona (aunque trabajen
  en mini tareas) + lista de mini tareas activas con sus responsables.
- **Estado del equipo**: ordenado por cansancio, con días de la tarea más antigua, cargas y chips de
  tareas en curso.
- **Simulador**: “Simular día +1” sube un día a todas las tareas (y con ello el cansancio);
  “Reiniciar demo” vuelve al seed.

## Gestor de aspecto

Botón flotante **“Aspecto”** (abajo a la izquierda, presente en todas las rutas) con dos pestañas:

**Interfaz**

| Control            | Opciones                                          |
| ------------------ | ------------------------------------------------- |
| Tema               | Noche / Día (paleta clara con contraste ajustado) |
| Color de acento    | Cian / Ámbar / Violeta / Verde / Rosa             |
| Animaciones        | Sí / No (congela monitos, barras y transiciones)  |
| Fondo cuadriculado | Sí / No                                           |
| Restablecer        | Vuelve a Noche + Cian + animaciones + grilla      |

**Mi monito** (también se abre al hacer click en la tarjeta del monito del panel)

| Control            | Opciones                                         |
| ------------------ | ------------------------------------------------ |
| Color de piel      | 6 tonos                                          |
| Color de pelo      | 6 tonos                                          |
| Color de polera    | 8 colores                                        |
| Cara               | Clásica / Lentes / Barba / Pecas                 |
| Volver a mi estilo | Quita la personalización y deja el look del seed |

La personalización se guarda **por integrante** y se aplica en el panel, en las tarjetas y en el
visor de jefatura. Se implementa con `core/aspecto.service.ts` (signals + `effect`) escribiendo
variables CSS y `data-*` en `<html>`; no toca la lógica de tareas. `index.html` aplica las
preferencias antes del primer paint para evitar el destello de tema.

## Reglas del cansancio (individual)

```
carga     = tareasActivas + 0.5 × miniTareasActivas
cansancio = clamp(0, 100, (diasMax - 1) × 8 + max(0, carga - 4) × 15)
fresco < 30 ≤ cansado < 65 ≤ agotado
```

Cada persona tiene su propio estado, aunque comparta tarea. El pixel art cambia de cara, añade
sudor (`cansado`) o `zzz` y postura encorvada (`agotado`), con animaciones más lentas.

## Estructura

```
src/app/
  core/models.ts                 tipos (Integrante, Tarea, MiniTarea, ResumenPersona…)
  core/reglas.ts                 fórmulas de carga/cansancio y utilidades
  core/departamento.service.ts   estado con signals + mutaciones (única capa de datos)
  core/aspecto.service.ts        tema, acento, animaciones, fondo y avatares
  data/seed.ts                   JSON fijo de ejemplo
  shared/monito-pixel/           personaje pixel art en SVG + animaciones CSS
  shared/barra-progreso/         barra animada reutilizable
  shared/avatar/                 iniciales con color
  shared/icono/                  set de iconos SVG inline (sin librerías)
  shared/gestor-aspecto/         panel flotante de apariencia
  pages/inicio/                  portada con los dos accesos
  pages/funcionario/             panel + tarjeta de tarea con mini tareas
  pages/jefatura/                sala de trabajo + fichas de equipo
  styles.css                     tokens, tema noche/día, animaciones y responsive
```

## Smoke test de interacción (opcional)

`tools/smoke.mjs` maneja Chrome por CDP y valida: crear tarea al 0 %, activar con click, abrir mini
tareas con doble click, agregar una mini tarea, el simulador de días de jefatura, el gestor de
aspecto (tema día + acento ámbar + animaciones off, persistencia y “Restablecer”) y el editor del
monito (piel, pelo, polera y cara, visible en jefatura, persistente y restablecible).

```powershell
# 1) app en :4300
npm start -- --port 4300
# 2) Chrome headless con CDP (otra terminal)
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --disable-gpu `
  --remote-debugging-port=9222 --remote-allow-origins=* `
  --user-data-dir="$env:TEMP\chrome-cdp" about:blank
# 3) ejecutar el test
npm run smoke
```

Resultado esperado: `SMOKE OK`.

## Cómo conectar el backend después

1. Reemplazar los métodos de `DepartamentoService` (`crearTarea`, `alternarTrabajo`,
   `alternarMiniTarea`, `ajustarProgreso`, …) por `HttpClient`.
2. Mantener los `computed` (KPIs, estaciones, cansancio) o moverlos al backend con los mismos campos.
3. Los modelos de `core/models.ts` ya describen el contrato mínimo de la API.

## Demo en GitHub Pages

- **URL:** https://marcelo22178.github.io/sala-control-planificacion/
- **Repo:** https://github.com/Marcelo22178/sala-control-planificacion
- Workflow: `.github/workflows/deploy.yml` compila con `--base-href /<repo>/`, copia `index.html`
  a `404.html` para que las rutas profundas (`/funcionario`, `/jefatura`) carguen la SPA y publica
  el artefacto con `actions/deploy-pages`.
- Cada push a `main` reconstruye y despliega la demo automáticamente.
- Nota: al entrar directo a `/funcionario` o `/jefatura`, GitHub Pages responde con el `404.html`
  copiado del index (la app carga normalmente, aunque el código HTTP sea 404). Es el mecanismo
  estándar para SPA en Pages.
