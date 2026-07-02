/**
 * View — pinta el DOM.
 * No conoce de dónde vienen los datos ni cómo se obtienen.
 */
const LinksView = (() => {
  const contenedor        = document.getElementById('contenedor-links');
  const buscador          = document.getElementById('buscador');
  const resultsCount      = document.getElementById('results-count');
  const themeToggle       = document.getElementById('theme-toggle');
  const themeIcon         = document.getElementById('theme-icon');
  const filtrosContenedor = document.getElementById('filtros-categoria');

  // Escapa caracteres especiales HTML para evitar XSS.
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // Valida que una URL sea http/https antes de usarla como href.
  function urlSegura(url) {
    try {
      const parsed = new URL(url);
      return (parsed.protocol === 'https:' || parsed.protocol === 'http:')
        ? url
        : '#';
    } catch {
      return '#';
    }
  }

  // SVG internos — nunca datos externos.
  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
    searchOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    alertCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 3.9M15.4 6.6 8.6 10.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  };

  // Iconos por categoría (constantes internas).
  const CATEGORY_ICONS = {
    salud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/><path d="M9 12h3l1.5-2.5L15 14l1-2h2"/></svg>',
    'información': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
    'informacion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
    'alimentación': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v6a2 2 0 0 0 2 2v10M7 3v10M4 3v6a2 2 0 0 0 2 2M17 3a3 3 0 0 0-3 3v6h4v9M17 3v18"/></svg>',
    'alimentacion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v6a2 2 0 0 0 2 2v10M7 3v10M4 3v6a2 2 0 0 0 2 2M17 3a3 3 0 0 0-3 3v6h4v9M17 3v18"/></svg>',
    refugio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    vivienda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    'educación': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9 12 4l10 5-10 5-10-5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>',
    'educacion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9 12 4l10 5-10 5-10-5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>',
    emergencias: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 21h20L12 2z"/><path d="M12 9v5M12 17h.01"/></svg>',
    transporte: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="11" rx="2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/><path d="M3 11h18"/></svg>',
    legal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0zM5 7h14M8 21h8"/></svg>',
    empleo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
    comunidad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M2 20c0-3 2.7-5 6-5s6 2 6 5M15.5 15.2c2.5.3 4.5 2 4.5 4.8"/></svg>',
    'busqueda y localizacion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8v3l2 2"/></svg>',
    'directorio de ayuda': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6l2 2h8v12H4z"/><path d="M4 8h16"/></svg>',
    'voluntariado': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.6-9.8-9.4C.6 7.9 2.6 4 6.4 4c2 0 3.4 1 5.6 3 2.2-2 3.6-3 5.6-3 3.8 0 5.8 3.9 4.2 7.6C19.5 16.4 12 21 12 21z"/></svg>',
  };

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Resalta el término buscado dentro de un texto plano, devuelve un DocumentFragment.
  function resaltarTermino(texto, termino) {
    const fragmento = document.createDocumentFragment();
    if (!termino || termino.length < 2) {
      fragmento.appendChild(document.createTextNode(texto));
      return fragmento;
    }

    const textoNorm   = normalizar(texto);
    const terminoNorm = normalizar(termino);

    let cursor = 0;
    let idx;

    while ((idx = textoNorm.indexOf(terminoNorm, cursor)) !== -1) {
      if (idx > cursor) {
        fragmento.appendChild(document.createTextNode(texto.slice(cursor, idx)));
      }
      const mark = document.createElement('mark');
      mark.className = 'highlight';
      mark.textContent = texto.slice(idx, idx + termino.length);
      fragmento.appendChild(mark);
      cursor = idx + termino.length;
    }

    if (cursor < texto.length) {
      fragmento.appendChild(document.createTextNode(texto.slice(cursor)));
    }

    return fragmento;
  }

  function iconoDeCategoria(categoria) {
    const clave = normalizar(categoria || '');
    return CATEGORY_ICONS[clave] || CATEGORY_ICONS[categoria?.toLowerCase()] || CATEGORY_ICONS.default;
  }

  // Tema claro / oscuro
  function initTheme() {
    const savedTheme  = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      document.body.classList.add('light');
      themeIcon.innerHTML = ICONS.moon;
    } else {
      document.body.classList.remove('light');
      themeIcon.innerHTML = ICONS.sun;
    }
  }

  function toggleTheme() {
    if (document.body.classList.contains('light')) {
      document.body.classList.remove('light');
      themeIcon.innerHTML = ICONS.sun;
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light');
      themeIcon.innerHTML = ICONS.moon;
      localStorage.setItem('theme', 'light');
    }
  }

  initTheme();
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  // Construye tarjetas con createElement/textContent/setAttribute — sin innerHTML con datos.
  // termino (opcional): palabra buscada para resaltar coincidencias.
  function crearTarjeta(link, termino) {
    if (!link || typeof link !== 'object') return null;

    const nombre      = typeof link.nombre      === 'string' ? link.nombre.trim()      : '';
    const descripcion = typeof link.descripcion === 'string' ? link.descripcion.trim() : '';
    const categoria   = typeof link.categoria   === 'string' ? link.categoria.trim()   : '';
    const url         = urlSegura(typeof link.url === 'string' ? link.url.trim() : '');

    if (!nombre || url === '#') return null;

    const card = document.createElement('div');
    card.className = 'link-card';

    const head = document.createElement('div');
    head.className = 'link-card__head';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'link-card__icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.innerHTML = iconoDeCategoria(categoria);

    const headText = document.createElement('div');
    headText.className = 'link-card__head-text';

    const titulo = document.createElement('h3');
    titulo.className = 'link-card__title';
    titulo.appendChild(resaltarTermino(nombre, termino));

    const badge = document.createElement('span');
    badge.className = 'link-card__badge';
    badge.textContent = categoria;

    headText.appendChild(titulo);
    headText.appendChild(badge);
    head.appendChild(iconSpan);
    head.appendChild(headText);

    const desc = document.createElement('p');
    desc.className = 'link-card__desc';
    desc.appendChild(resaltarTermino(descripcion, termino));

    const topSection = document.createElement('div');
    topSection.appendChild(head);
    topSection.appendChild(desc);

    const enlace = document.createElement('a');
    enlace.className = 'link-card__cta';
    enlace.setAttribute('href', url);
    enlace.setAttribute('target', '_blank');
    enlace.setAttribute('rel', 'noopener noreferrer');
    enlace.innerHTML = 'Visitar sitio de ayuda ' + ICONS.externalLink;

    const btnCompartir = document.createElement('button');
    btnCompartir.type = 'button';
    btnCompartir.className = 'link-card__share';
    btnCompartir.setAttribute('aria-label', 'Compartir ' + nombre);
    btnCompartir.innerHTML = ICONS.share + '<span>Compartir</span>';

    btnCompartir.addEventListener('click', () => {
      const textoCompartir = `${nombre}\n${descripcion}\n${url}`;

      if (navigator.share) {
        navigator.share({
          title: nombre,
          text: descripcion,
          url: url,
        }).catch(() => {/* el usuario canceló — no hacer nada */});
      } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(textoCompartir).then(() => {
          btnCompartir.classList.add('link-card__share--copiado');
          btnCompartir.innerHTML = ICONS.check + '<span>¡Copiado!</span>';
          setTimeout(() => {
            btnCompartir.classList.remove('link-card__share--copiado');
            btnCompartir.innerHTML = ICONS.share + '<span>Compartir</span>';
          }, 2000);
        }).catch(() => {
          // Fallback final si clipboard tampoco está disponible
          const input = document.createElement('textarea');
          input.value = textoCompartir;
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          btnCompartir.classList.add('link-card__share--copiado');
          btnCompartir.innerHTML = ICONS.check + '<span>¡Copiado!</span>';
          setTimeout(() => {
            btnCompartir.classList.remove('link-card__share--copiado');
            btnCompartir.innerHTML = ICONS.share + '<span>Compartir</span>';
          }, 2000);
        });
      }
    });

    const acciones = document.createElement('div');
    acciones.className = 'link-card__actions';
    acciones.appendChild(enlace);
    acciones.appendChild(btnCompartir);

    card.appendChild(topSection);
    card.appendChild(acciones);
    return card;
  }

  function mostrarLinks(links, termino) {
    contenedor.innerHTML = '';

    if (resultsCount) {
      const total = links.length;
      resultsCount.textContent = total > 0
        ? `${total} resultado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`
        : '';
    }

    if (links.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'state-message state-message--empty';
      msg.innerHTML = ICONS.searchOff;
      const p = document.createElement('p');
      p.textContent = 'No encontramos recursos con esos términos.';
      msg.appendChild(p);
      const sugerencias = document.createElement('ul');
      sugerencias.className = 'state-message__tips';
      [
        'Revisa la ortografía o prueba con sinónimos (ej. "comida" en vez de "alimentación").',
        'Usa términos más generales como "salud", "medicinas" o "Caracas".',
        'Elimina el filtro de categoría activo y busca en todo el directorio.',
      ].forEach((texto) => {
        const li = document.createElement('li');
        li.textContent = texto;
        sugerencias.appendChild(li);
      });
      msg.appendChild(sugerencias);
      contenedor.appendChild(msg);
      return;
    }

    const fragmento = document.createDocumentFragment();
    links.forEach((link) => {
      const tarjeta = crearTarjeta(link, termino);
      if (tarjeta) fragmento.appendChild(tarjeta);
    });
    contenedor.appendChild(fragmento);
  }

  function mostrarError(mensaje) {
    contenedor.innerHTML = '';
    const msg = document.createElement('div');
    msg.className = 'state-message state-message--error';
    msg.innerHTML = ICONS.alertCircle;

    const p1 = document.createElement('p');
    p1.textContent = mensaje;

    const p2 = document.createElement('p');
    p2.className = 'text-xs mt-2 opacity-75';
    p2.textContent = 'Verifica tu conexión a internet o intenta recargar la página.';

    msg.appendChild(p1);
    msg.appendChild(p2);
    contenedor.appendChild(msg);
  }

  function mostrarCargando() {
    contenedor.innerHTML = `
      <div class="state-message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="animate-spin" aria-hidden="true">
          <path d="M12 4v.01M12 20v.01M4 12h.01M20 12h.01"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
        <p>Cargando directorio de ayuda...</p>
      </div>`;
  }

  function alBuscar(callback) {
    let debounceTimer;
    buscador.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => callback(e.target.value), 200);
    });
  }

  // Renderiza los botones de filtro de categoría.
  // conteosPorCategoria: Map<string, number> con el total de recursos por categoría.
  function renderizarFiltros(categorias, categoriaActiva, onFiltro, conteosPorCategoria) {
    if (!filtrosContenedor) return;
    filtrosContenedor.innerHTML = '';

    // Botón "Todos"
    const btnTodos = document.createElement('button');
    btnTodos.type = 'button';
    btnTodos.className = 'filtro-btn' + (!categoriaActiva ? ' filtro-btn--activo' : '');

    const labelTodos = document.createElement('span');
    labelTodos.textContent = 'Todas';
    btnTodos.appendChild(labelTodos);

    if (conteosPorCategoria) {
      const total = [...conteosPorCategoria.values()].reduce((a, b) => a + b, 0);
      const countTodos = document.createElement('span');
      countTodos.className = 'filtro-btn__count';
      countTodos.textContent = total;
      btnTodos.appendChild(countTodos);
    }

    btnTodos.addEventListener('click', () => onFiltro(null));
    filtrosContenedor.appendChild(btnTodos);

    categorias.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filtro-btn' + (categoriaActiva === cat ? ' filtro-btn--activo' : '');

      const iconSpan = document.createElement('span');
      iconSpan.setAttribute('aria-hidden', 'true');
      iconSpan.innerHTML = iconoDeCategoria(cat);

      const label = document.createElement('span');
      label.textContent = cat;

      btn.appendChild(iconSpan);
      btn.appendChild(label);

      if (conteosPorCategoria && conteosPorCategoria.has(cat)) {
        const countSpan = document.createElement('span');
        countSpan.className = 'filtro-btn__count';
        countSpan.textContent = conteosPorCategoria.get(cat);
        btn.appendChild(countSpan);
      }

      btn.addEventListener('click', () => onFiltro(cat));
      filtrosContenedor.appendChild(btn);
    });
  }

  return { mostrarLinks, mostrarError, alBuscar, mostrarCargando, renderizarFiltros };
})();
