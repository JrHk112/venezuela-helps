/**
 * Controller — coordina el Model y la View.
 */
const LinksController = (() => {
  async function iniciar() {
    LinksView.mostrarCargando();

    try {
      await LinksModel.cargar();

      const categorias = LinksModel.obtenerCategorias();
      let categoriaActiva = null;
      let terminoBusqueda = '';

      function calcularConteos() {
        const todos = LinksModel.obtenerTodos();
        const mapa = new Map();
        todos.forEach((link) => {
          mapa.set(link.categoria, (mapa.get(link.categoria) || 0) + 1);
        });
        return mapa;
      }

      function actualizarVista() {
        const resultados = LinksModel.filtrar(terminoBusqueda, categoriaActiva);
        const conteos    = calcularConteos();
        LinksView.renderizarFiltros(categorias, categoriaActiva, (cat) => {
          categoriaActiva = cat;
          actualizarVista();
        }, conteos);
        LinksView.mostrarLinks(resultados, terminoBusqueda.trim());
      }

      actualizarVista();

      LinksView.alBuscar((termino) => {
        terminoBusqueda = termino;
        actualizarVista();
      });

    } catch (error) {
      console.error('Error crítico cargando los enlaces:', error);

      let mensajeError = 'Error al cargar el directorio de ayuda.';
      if (!navigator.onLine || error.message.includes('fetch') || error.name === 'TypeError') {
        mensajeError = 'No se pudo conectar. Verifica tu conexión a internet e intenta recargar.';
      } else if (error.message.includes('status')) {
        mensajeError = 'Problema al leer los datos locales. Intenta recargar la página.';
      }

      LinksView.mostrarError(mensajeError);
    }
  }

  return { iniciar };
})();

document.addEventListener('DOMContentLoaded', LinksController.iniciar);
