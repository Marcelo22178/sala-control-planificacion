/**
 * Smoke test de interacción vía Chrome DevTools Protocol.
 * Uso local: node tools/smoke.mjs (app en :4300 + Chrome con --remote-debugging-port=9222)
 * Uso contra la demo: APP_URL=https://marcelo22178.github.io/sala-control-planificacion/funcionario node tools/smoke.mjs
 */
const CDP = 'http://localhost:9222';
const APP = process.env.APP_URL ?? 'http://localhost:4300/funcionario';
const ORIGEN = new URL(APP);
const BASE = ORIGEN.origin + ORIGEN.pathname.replace(/funcionario\/?$/, '');
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pendientes = new Map();

  ws.addEventListener('message', (evento) => {
    const mensaje = JSON.parse(evento.data);
    if (mensaje.id && pendientes.has(mensaje.id)) {
      pendientes.get(mensaje.id)(mensaje);
      pendientes.delete(mensaje.id);
    }
  });

  const listo = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const enviar = async (method, params = {}) => {
    await listo;
    const mid = ++id;
    const respuesta = new Promise((resolve) => pendientes.set(mid, resolve));
    ws.send(JSON.stringify({ id: mid, method, params }));
    return respuesta;
  };

  return { ws, listo, enviar };
}

async function main() {
  const objetivos = await (await fetch(`${CDP}/json/list`)).json();
  const pagina = objetivos.find((t) => t.type === 'page');
  if (!pagina) throw new Error('No hay pestaña disponible en Chrome');

  const { enviar } = conectar(pagina.webSocketDebuggerUrl);
  await enviar('Page.enable');
  await enviar('Runtime.enable');
  await enviar('Network.enable');
  await enviar('Network.setCacheDisabled', { cacheDisabled: true });

  const evaluar = async (expresion) => {
    const respuesta = await enviar('Runtime.evaluate', {
      expression: expresion,
      awaitPromise: true,
      returnByValue: true,
    });
    if (respuesta.result?.exceptionDetails) {
      throw new Error(JSON.stringify(respuesta.result.exceptionDetails.exception));
    }
    return respuesta.result?.result?.value;
  };

  await enviar('Page.navigate', { url: APP });
  await esperar(3000);

  // Estado limpio: evita que preferencias de corridas anteriores alteren el test.
  await evaluar(`localStorage.clear()`);
  await enviar('Page.reload', { ignoreCache: true });
  await esperar(2600);

  const inicial = await evaluar(`(() => ({
    titulo: document.querySelector('h1')?.textContent?.trim(),
    tareas: document.querySelectorAll('.tarea').length,
    vivas: document.querySelectorAll('.tarea--viva').length,
    subtareasAbiertas: document.querySelectorAll('.subtareas').length,
  }))()`);
  console.log('inicial:', inicial);

  // 1) click activa el trabajo (espera el debounce de 200 ms)
  const indiceInactivo = await evaluar(`(() => {
    const cabezas = [...document.querySelectorAll('.tarea__cabeza')];
    const indice = cabezas.findIndex((cabeza) => cabeza.getAttribute('aria-pressed') === 'false');
    cabezas[indice]?.click();
    return indice;
  })()`);
  await esperar(600);
  const trasClick = await evaluar(`(() => {
    const objetivo = document.querySelectorAll('.tarea')[${indiceInactivo}];
    return {
      indice: ${indiceInactivo},
      vivas: document.querySelectorAll('.tarea--viva').length,
      estado: objetivo?.querySelector('.estado-pastilla')?.textContent?.trim(),
      ariaPressed: objetivo?.querySelector('.tarea__cabeza')?.getAttribute('aria-pressed'),
    };
  })()`);
  console.log('tras click:', trasClick);

  // 2) doble click abre mini tareas
  await evaluar(`(() => {
    const cabeza = document.querySelectorAll('.tarea__cabeza')[0];
    cabeza?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  })()`);
  await esperar(400);
  const trasDoble = await evaluar(`(() => ({
    paneles: document.querySelectorAll('.subtareas').length,
    miniTareas: document.querySelectorAll('.mini').length,
    tituloPanel: document.querySelector('.subtareas h4')?.textContent?.trim(),
  }))()`);
  console.log('tras doble click:', trasDoble);

  // 3) crear tarea nueva al 0 %
  await evaluar(`(() => {
    const input = document.querySelector('.captura__input');
    input.value = 'Smoke test: ordenar expedientes';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.captura form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await esperar(500);
  const trasCrear = await evaluar(`(() => {
    const primera = document.querySelector('.tarea');
    return {
      tareas: document.querySelectorAll('.tarea').length,
      primeroTitulo: primera?.querySelector('.tarea__titulo')?.textContent?.trim(),
      primeroEstado: primera?.querySelector('.estado-pastilla')?.textContent?.trim(),
      progreso: primera?.querySelector('.barra__valor')?.textContent?.trim(),
      toast: document.querySelector('.toast')?.textContent?.trim(),
    };
  })()`);
  console.log('tras crear:', trasCrear);

  // 4) mini tarea nueva dentro de la tarea abierta
  await evaluar(`(() => {
    const input = document.querySelector('.subtareas__nueva input');
    input.value = 'Mini smoke: revisar anexos';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.subtareas__nueva').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await esperar(400);
  const trasMini = await evaluar(`(() => {
    const filas = [...document.querySelectorAll('.mini')];
    const ultima = filas[filas.length - 1];
    return {
      miniTareas: filas.length,
      ultima: ultima?.querySelector('.mini__titulo')?.textContent?.trim(),
      valor: ultima?.querySelector('.mini__valor')?.textContent?.trim(),
    };
  })()`);
  console.log('tras mini tarea:', trasMini);

  // 5) jefatura: estaciones, monitos y simulador de día
  await enviar('Page.navigate', { url: BASE + 'jefatura' });
  await esperar(3000);
  const jefaturaInicial = await evaluar(`(() => ({
    estaciones: document.querySelectorAll('app-tarjeta-estacion').length,
    trabajadores: document.querySelectorAll('.celda-monito').length,
    personas: document.querySelectorAll('app-tarjeta-persona').length,
    cansancioTop: document.querySelector('.persona__cansancio-linea strong')?.textContent?.trim(),
    alertas: document.querySelector('.metrica--roja strong')?.textContent?.trim(),
    diasTop: document.querySelector('.estacion .chip')?.textContent?.trim(),
  }))()`);
  console.log('jefatura inicial:', jefaturaInicial);

  await evaluar(`[...document.querySelectorAll('.controles-demo .boton')]
    .find((boton) => boton.textContent.includes('Simular día'))?.click()`);
  await esperar(500);

  const jefaturaTrasDia = await evaluar(`(() => ({
    cansancioTop: document.querySelector('.persona__cansancio-linea strong')?.textContent?.trim(),
    diasTop: document.querySelector('.estacion .chip')?.textContent?.trim(),
    aviso: document.querySelector('.metrica--roja strong')?.textContent?.trim(),
  }))()`);
  console.log('jefatura tras día:', jefaturaTrasDia);

  const numero = (texto) => Number((texto ?? '').replace('%', ''));

  // 6) gestor de aspecto: tema, acento, animaciones y persistencia
  await evaluar(`document.querySelector('.gestor__disparador')?.click()`);
  await esperar(300);
  const panelAbierto = await evaluar(`(() => ({
    panel: Boolean(document.querySelector('.gestor__panel')),
    opciones: document.querySelectorAll('.gestor__opciones .opcion').length,
    muestras: document.querySelectorAll('.muestra').length,
  }))()`);
  console.log('gestor abierto:', panelAbierto);

  await evaluar(`(() => {
    const botones = [...document.querySelectorAll('.gestor__opciones .opcion')];
    botones.find((boton) => boton.textContent.includes('Día'))?.click();
    document.querySelector('.muestra[aria-label="Acento Ámbar"]')?.click();
    const switches = [...document.querySelectorAll('.gestor__grupo--fila .switch')];
    if (switches[0]?.getAttribute('aria-checked') === 'true') switches[0].click();
  })()`);
  await esperar(400);

  const aspectoAplicado = await evaluar(`(() => {
    const raiz = document.documentElement;
    return {
      tema: raiz.dataset.tema,
      animaciones: raiz.dataset.animaciones,
      acento: getComputedStyle(raiz).getPropertyValue('--cian').trim(),
      fondo: getComputedStyle(document.body).backgroundColor,
    };
  })()`);
  console.log('aspecto aplicado:', aspectoAplicado);

  // persistencia tras recargar
  await enviar('Page.navigate', { url: BASE + 'jefatura' });
  await esperar(2500);
  const aspectoPersistido = await evaluar(`(() => {
    const raiz = document.documentElement;
    return {
      tema: raiz.dataset.tema,
      animaciones: raiz.dataset.animaciones,
      acento: getComputedStyle(raiz).getPropertyValue('--cian').trim(),
    };
  })()`);
  console.log('aspecto persistido:', aspectoPersistido);

  // restablecer
  await evaluar(`document.querySelector('.gestor__disparador')?.click()`);
  await esperar(250);
  await evaluar(`document.querySelector('.gestor__pie .boton')?.click()`);
  await esperar(350);
  const aspectoReiniciado = await evaluar(`(() => {
    const raiz = document.documentElement;
    return {
      tema: raiz.dataset.tema,
      animaciones: raiz.dataset.animaciones,
      acento: getComputedStyle(raiz).getPropertyValue('--cian').trim(),
    };
  })()`);
  console.log('aspecto reiniciado:', aspectoReiniciado);

  // 7) editor del monito: se abre desde la tarjeta y se ve en jefatura
  await enviar('Page.navigate', { url: BASE + 'funcionario' });
  await esperar(2800);
  await evaluar(`document.querySelector('.tarjeta-monito')?.click()`);
  await esperar(350);
  const editorAbierto = await evaluar(`(() => ({
    activo: document.querySelector('.gestor__tab--activa')?.textContent?.trim(),
    preview: Boolean(document.querySelector('.monito-editor__preview')),
    pieles: document.querySelectorAll('[aria-label^="Piel "]').length,
    pelos: document.querySelectorAll('[aria-label^="Pelo "]').length,
    poleras: document.querySelectorAll('[aria-label^="Polera "]').length,
    caras: document.querySelectorAll('.gestor__caras .opcion').length,
  }))()`);
  console.log('editor monito:', editorAbierto);

  await evaluar(`(() => {
    document.querySelector('[aria-label="Piel 6"]')?.click();
    document.querySelector('[aria-label="Pelo 5"]')?.click();
    document.querySelector('[aria-label="Polera 7"]')?.click();
    [...document.querySelectorAll('.gestor__caras .opcion')]
      .find((boton) => boton.textContent.includes('Lentes'))?.click();
  })()`);
  await esperar(450);

  const monitoPersonalizado = await evaluar(`(() => {
    const tarjeta = document.querySelector('.tarjeta-monito');
    const tiene = (color) => Boolean(tarjeta?.querySelector('.monito__cuerpo rect[fill="' + color + '"]'));
    return {
      piel: tiene('#6b4423'),
      pelo: tiene('#b87333'),
      polera: tiene('#fb923c'),
      lentes: Boolean(tarjeta?.querySelector('.monito__lentes')),
    };
  })()`);
  console.log('monito personalizado:', monitoPersonalizado);

  await enviar('Page.navigate', { url: BASE + 'jefatura' });
  await esperar(2600);
  const monitoEnJefatura = await evaluar(`(() => ({
    polera: document.querySelectorAll('.estacion__monitos rect[fill="#fb923c"]').length,
    lentes: document.querySelectorAll('.estacion__monitos .monito__lentes').length,
  }))()`);
  console.log('monito en jefatura:', monitoEnJefatura);

  await enviar('Page.navigate', { url: BASE + 'funcionario' });
  await esperar(2600);
  const monitoPersiste = await evaluar(
    `Boolean(document.querySelector('.tarjeta-monito rect[fill="#fb923c"]'))`,
  );

  await evaluar(`document.querySelector('.tarjeta-monito')?.click()`);
  await esperar(300);
  await evaluar(`[...document.querySelectorAll('.gestor__pie .boton')]
    .find((boton) => boton.textContent.includes('Volver a mi estilo'))?.click()`);
  await esperar(350);
  const monitoRestablecido = await evaluar(`(() => {
    const tarjeta = document.querySelector('.tarjeta-monito');
    return {
      poleraOriginal: Boolean(tarjeta?.querySelector('.monito__cuerpo rect[fill="#22d3ee"]')),
      pielOriginal: Boolean(tarjeta?.querySelector('.monito__cuerpo rect[fill="#d9a066"]')),
      sinLentes: !tarjeta?.querySelector('.monito__lentes'),
      personalizada: Boolean(tarjeta?.querySelector('.monito__cuerpo rect[fill="#fb923c"]')),
    };
  })()`);
  console.log('monito restablecido:', monitoRestablecido);

  const ok =
    inicial.tareas > 0 &&
    inicial.titulo?.includes('Josías') &&
    indiceInactivo >= 0 &&
    trasClick.vivas === inicial.vivas + 1 &&
    trasClick.ariaPressed === 'true' &&
    trasClick.estado === 'Trabajando' &&
    trasDoble.paneles === 1 &&
    trasCrear.tareas === inicial.tareas + 1 &&
    trasCrear.primeroTitulo === 'Smoke test: ordenar expedientes' &&
    trasCrear.progreso === '0%' &&
    trasMini.ultima === 'Mini smoke: revisar anexos' &&
    jefaturaInicial.estaciones > 0 &&
    jefaturaInicial.trabajadores > jefaturaInicial.estaciones &&
    jefaturaInicial.personas === 6 &&
    numero(jefaturaTrasDia.cansancioTop) > numero(jefaturaInicial.cansancioTop) &&
    panelAbierto.panel &&
    panelAbierto.opciones === 2 &&
    panelAbierto.muestras === 5 &&
    aspectoAplicado.tema === 'dia' &&
    aspectoAplicado.animaciones === 'off' &&
    aspectoAplicado.acento === '#fbbf24' &&
    aspectoPersistido.tema === 'dia' &&
    aspectoPersistido.acento === '#fbbf24' &&
    aspectoReiniciado.tema === 'noche' &&
    aspectoReiniciado.animaciones === 'on' &&
    aspectoReiniciado.acento === '#22d3ee' &&
    editorAbierto.activo?.includes('Mi monito') &&
    editorAbierto.preview &&
    editorAbierto.pieles === 6 &&
    editorAbierto.pelos === 6 &&
    editorAbierto.poleras === 8 &&
    editorAbierto.caras === 4 &&
    monitoPersonalizado.piel &&
    monitoPersonalizado.pelo &&
    monitoPersonalizado.polera &&
    monitoPersonalizado.lentes &&
    monitoEnJefatura.polera >= 1 &&
    monitoEnJefatura.lentes >= 1 &&
    monitoPersiste &&
    monitoRestablecido.poleraOriginal &&
    monitoRestablecido.pielOriginal &&
    monitoRestablecido.sinLentes &&
    !monitoRestablecido.personalizada;

  console.log(ok ? 'SMOKE OK' : 'SMOKE FALLIDO');
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error('SMOKE ERROR:', error.message);
  process.exit(1);
});
