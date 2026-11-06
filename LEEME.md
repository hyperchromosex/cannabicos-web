# Cannabicos · Página web

## Cómo está armada
- `index.html`, `styles.css`, `script.js`: la página.
- `productos.json`: el catálogo. Se edita desde el panel de Pages CMS, no a mano.
- `img/productos/`: las fotos que se suben desde el panel.
- `.pages.yml`: configuración del panel (qué campos ve quien edita).
- `netlify.toml`: configuración de Netlify y encabezados de seguridad.

Cada cambio que llega a la rama `main` de GitHub (desde VS Code o desde el panel) se publica solo en Netlify en uno o dos minutos.

## Qué editar y dónde
- **Productos, precios y fotos:** en el panel de Pages CMS (app.pagescms.org).
- **Categorías:** en `script.js` (lista `CATEGORIAS`) **y** en `.pages.yml` (lista de la categoría). Deben coincidir.
- **Colores y fuentes:** al principio de `styles.css` (`:root`).
- **Textos, horario y dirección:** `index.html`. Busca los comentarios `TODO`.
- **Número de WhatsApp:** `script.js` (`WHATSAPP`) y los enlaces `wa.me` en `index.html`.

## Verla en tu computador
Abre la carpeta en VS Code y usa **Live Server** (clic derecho en `index.html` → Open with Live Server). El catálogo necesita Live Server: si abres `index.html` con doble clic, no carga los productos.

## Ojo
- Los precios actuales de `productos.json` son inventados, solo de ejemplo.
- Si agregas un servicio externo nuevo (otro mapa, videos, fuentes, etc.), hay que permitirlo en `Content-Security-Policy` dentro de `netlify.toml`, o el navegador lo bloquea.
