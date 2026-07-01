/**
 * Controller — coordina el Model y la View.
 */
const LinksController = (() => {
  async function iniciar() {
    LinksView.mostrarCargando();

    try {
      await LinksModel.cargar();
      LinksView.mostrarLinks(LinksModel.obtenerTodos());
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

    LinksView.alBuscar((termino) => {
      LinksView.mostrarLinks(LinksModel.filtrar(termino));
    });
  }

  return { iniciar };
})();

document.addEventListener('DOMContentLoaded', LinksController.iniciar);
