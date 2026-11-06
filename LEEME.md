# Cannabicos · Página web

## Cómo verla
1. Abre la carpeta `cannabicos-web` en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.

## Qué editar
- **Productos y categorías:** `script.js`, en las listas `CATEGORIAS` y `PRODUCTOS`.
  - `precio: 45000` muestra $45.000. Con `null` aparece "Consultar precio".
  - `foto: "img/productos/mi-foto.jpg"` pone una foto real. Guarda las fotos en `img/productos/`.
- **Colores:** `styles.css`, al principio (`:root`).
- **Textos, horario y dirección:** `index.html`. Busca los comentarios `TODO`.
- **Número de WhatsApp:** `script.js` (`WHATSAPP`) y los enlaces `wa.me` en `index.html`.

## Publicarla gratis
Entra a netlify.com → **Add new site** → **Deploy manually** y arrastra la carpeta completa.
