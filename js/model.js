/**
 * Model — obtiene y filtra los datos.
 * No conoce el DOM ni la interfaz.
 */
const LinksModel = (() => {
  let links = [];

  // Campos requeridos y tipos esperados para cada entrada del JSON.
  const CAMPO_REQUERIDO = {
    nombre:      'string',
    descripcion: 'string',
    categoria:   'string',
    url:         'string',
    etiquetas:   'object',
  };

  // Longitud máxima permitida por campo.
  const MAX_LEN = {
    nombre:      120,
    descripcion: 400,
    categoria:   60,
    url:         300,
  };

  function esUrlValida(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }

  // Valida y sanea un objeto de enlace. Devuelve el objeto limpio o null si es inválido.
  function validateLink(item) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;

    for (const [campo, tipo] of Object.entries(CAMPO_REQUERIDO)) {
      if (typeof item[campo] !== tipo) return null;
    }
    if (!Array.isArray(item.etiquetas)) return null;

    for (const [campo, max] of Object.entries(MAX_LEN)) {
      if (item[campo].length > max) return null;
    }

    if (!esUrlValida(item.url)) return null;

    return {
      nombre:      item.nombre.trim(),
      descripcion: item.descripcion.trim(),
      categoria:   item.categoria.trim(),
      url:         item.url.trim(),
      etiquetas:   item.etiquetas
        .filter((t) => typeof t === 'string')
        .map((t) => t.trim().slice(0, 50)),
    };
  }

  async function cargar() {
    const respuesta = await fetch('data/links.json', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar links.json (status ${respuesta.status})`);
    }

    // Rechazar respuestas mayores a 500 KB.
    const contentLength = respuesta.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 500_000) {
      throw new Error('El archivo de datos es demasiado grande.');
    }

    const raw = await respuesta.json();

    if (!Array.isArray(raw)) {
      throw new Error('El formato de links.json no es válido.');
    }

    // Máximo 200 entradas.
    links = raw
      .slice(0, 200)
      .map(validateLink)
      .filter(Boolean);

    return links;
  }

  function obtenerTodos() {
    return links;
  }

  // Devuelve las categorías únicas ordenadas.
  function obtenerCategorias() {
    const cats = [...new Set(links.map((l) => l.categoria))];
    return cats.sort((a, b) => a.localeCompare(b, 'es'));
  }

  function normalizar(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Filtra por término de búsqueda y/o categoría activa.
  function filtrar(termino, categoriaActiva) {
    const busqueda = normalizar((termino || '').slice(0, 100).trim());

    return links.filter((link) => {
      // Filtro por categoría
      if (categoriaActiva && link.categoria !== categoriaActiva) return false;

      // Filtro por texto
      if (!busqueda) return true;

      const campos = [
        link.nombre,
        link.descripcion,
        link.categoria,
        ...link.etiquetas,
      ].map(normalizar);

      return campos.some((c) => c.includes(busqueda));
    });
  }

  return { cargar, obtenerTodos, filtrar, obtenerCategorias };
})();
