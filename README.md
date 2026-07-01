# Directorio de Ayuda Venezuela

Sitio estático con un directorio buscable de organizaciones e iniciativas de ayuda humanitaria en Venezuela. Los datos se cargan desde un archivo JSON local y se renderizan mediante JavaScript puro sin dependencias de backend.

## Estructura del proyecto (patrón MVC)

```
.
├── index.html            # Plantilla HTML principal
├── favicon.ico           # Icono del sitio
├── css/
│   └── styles.css        # Sistema de diseño: variables, componentes y utilidades
├── js/
│   ├── model.js          # Model: carga, valida y filtra los datos de links.json
│   ├── view.js           # View: renderiza tarjetas y estados en el DOM
│   └── controller.js     # Controller: orquesta la carga inicial y la búsqueda
├── data/
│   └── links.json        # Base de datos de organizaciones de ayuda
└── netlify.toml          # Configuración de despliegue y cabeceras de seguridad
```

**Model** (`js/model.js`) — obtiene el JSON, valida cada entrada (campos requeridos, longitudes máximas, URLs seguras) y expone métodos de filtrado por texto.

**View** (`js/view.js`) — construye tarjetas en el DOM usando `createElement` / `textContent` (sin `innerHTML` con datos externos), gestiona el tema claro/oscuro y el contador de resultados.

**Controller** (`js/controller.js`) — inicia la carga al arrancar la página y conecta el buscador con el modelo y la vista.

## Esquema de un enlace en `links.json`

```json
{
  "nombre":      "Nombre de la organización",
  "categoria":   "Salud",
  "descripcion": "Breve descripción de lo que ofrece.",
  "url":         "https://ejemplo.org",
  "etiquetas":   ["medicinas", "caracas", "nacional"]
}
```

Categorías disponibles: `Salud`, `Alimentación`, `Emergencias`, `Legal`, `Información`, `Búsqueda y Localización`, `Directorio de Ayuda`.

## Subir a GitHub

```bash
# 1. Inicializa el repositorio (solo la primera vez)
git init
git add .
git commit -m "feat: directorio de ayuda Venezuela"

# 2. Crea un repositorio en https://github.com/new (sin inicializar con README)
# Luego enlaza y sube:
git remote add origin https://github.com/TU_USUARIO/venezuela-hub.git
git branch -M main
git push -u origin main
```

> Cada vez que actualices `data/links.json` u otro archivo:
> ```bash
> git add .
> git commit -m "feat: agrega/actualiza enlace X"
> git push
> ```
> Netlify detectará el push y redesplegará automáticamente.

## Probar localmente

El sitio usa `fetch` para cargar `data/links.json`, por lo que necesita servirse por HTTP (no funciona abriendo `index.html` directamente con doble clic).

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000

## Desplegar en Netlify

**Opción A — Arrastrar y soltar:**
1. Entra a https://app.netlify.com/drop
2. Arrastra la carpeta completa del proyecto (`index.html` debe estar en la raíz).

**Opción B — Desde repositorio Git:**
1. Sube el proyecto a GitHub, GitLab o Bitbucket.
2. En Netlify: "Add new site" → "Import an existing project".
3. Conecta el repositorio. El `netlify.toml` ya configura la carpeta de publicación y las cabeceras de seguridad. No se requiere build command.

**Opción C — Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Créditos

Hecho por [José H](https://www.instagram.com/jrhk112?igsh=MXA5Z3ZjZ2thbWdueg==)
