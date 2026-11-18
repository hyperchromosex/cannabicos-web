# Cannabicos · Página web

## Cómo está armada
- `index.html`, `styles.css`, `script.js`: la página.
- `datos/catalogo.json`: el catálogo completo (categorías → productos). Se edita desde el panel de Pages CMS, no a mano.
- `img/productos/`: las fotos que se suben desde el panel.
- `.pages.yml`: configuración del panel (qué campos ve quien edita).
- `_headers`: encabezados de seguridad (Cloudflare Pages).
- `build.js` y `package.json`: el paso que optimiza las fotos al publicar.

Cada cambio que llega a la rama `main` de GitHub (desde VS Code o desde el panel) se publica solo en **Cloudflare Pages** en uno o dos minutos.

## Publicación (Cloudflare Pages)
- Configuración del proyecto: **Build command** `npm run build` · **Build output directory** `dist`.
- `build.js` copia la página a `dist/` y convierte cada foto de `img/productos/` (de productos y de categorías) en una versión cuadrada de 800×800 en WebP, recortada desde el centro y mucho más liviana. Las fotos originales del repositorio no se tocan.
- `_headers` tiene los encabezados de seguridad.
- Para probar la publicación en tu computador: `npm install` y luego `npm run build` (crea la carpeta `dist/`, que no se sube a GitHub).

## Qué editar y dónde
- **Categorías, productos, precios y fotos:** en el panel de Pages CMS (app.pagescms.org) → Catálogo. Ahí se agregan, quitan, ocultan y ordenan. El orden del panel es el de la página.
- **Colores y fuentes:** al principio de `styles.css` (`:root`).
- **Textos, horario y dirección:** `index.html`. Busca los comentarios `TODO`.
- **Número de WhatsApp:** `script.js` (`WHATSAPP`) y los enlaces `wa.me` en `index.html`.

## Verla en tu computador
Abre la carpeta en VS Code y usa **Live Server** (clic derecho en `index.html` → Open with Live Server). El catálogo necesita Live Server: si abres `index.html` con doble clic, no carga los productos.

## Ojo
- Si agregas un servicio externo nuevo (otro mapa, videos, fuentes, etc.), hay que permitirlo en `Content-Security-Policy` dentro de `_headers`, o el navegador lo bloquea.
