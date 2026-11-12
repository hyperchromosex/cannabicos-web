/* =========================================================
   CANNÁBICOS · Paso de publicación (lo corre Cloudflare Pages)
   ---------------------------------------------------------
   1. Copia la página a la carpeta dist/ (lo que se publica).
   2. Convierte cada foto de img/productos/ en una versión
      cuadrada de 800×800 px en WebP, recortada desde el centro
      (en X y en Y), y mucho más liviana (~50–100 KB en vez de 2–3 MB).
   3. Cambia productos.json (solo dentro de dist/) para que el
      catálogo use esas versiones livianas.
   Las fotos originales del repositorio NO se tocan.
   Si una foto no se puede convertir, se usa la original.
   ========================================================= */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const RAIZ = __dirname;
const DIST = path.join(RAIZ, "dist");
const LADO = 800;          // tamaño del cuadrado en px
const CALIDAD = 78;        // calidad WebP (0–100)
const CARPETA_OPT = "img/productos-opt";

// Lo que NO se publica
const EXCLUIR = new Set([".git", ".github", "node_modules", "dist", "package.json", "package-lock.json", "build.js", "netlify.toml", ".gitignore"]);

function copiar(origen, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const nombre of fs.readdirSync(origen)) {
    if (EXCLUIR.has(nombre)) continue;
    const o = path.join(origen, nombre), d = path.join(destino, nombre);
    if (fs.statSync(o).isDirectory()) copiar(o, d);
    else fs.copyFileSync(o, d);
  }
}

function nombreOpt(rutaFoto) {
  // "img/productos/IMG 1.jpeg" → "img/productos-opt/IMG-1.webp"
  const base = path.basename(rutaFoto, path.extname(rutaFoto)).replace(/[^\w.-]+/g, "-");
  return `${CARPETA_OPT}/${base}.webp`;
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  copiar(RAIZ, DIST);
  fs.mkdirSync(path.join(DIST, CARPETA_OPT), { recursive: true });

  const productos = JSON.parse(fs.readFileSync(path.join(RAIZ, "productos.json"), "utf8"));
  let ok = 0, fallos = 0, antes = 0, despues = 0;
  const hechas = new Map();

  for (const p of productos) {
    if (!p || !p.foto || /^https?:\/\//.test(p.foto)) continue;
    const rel = String(p.foto).replace(/^\//, "");
    const origen = path.join(RAIZ, rel);
    if (!fs.existsSync(origen)) { console.warn("⚠ No existe la foto:", rel); continue; }
    try {
      let destinoRel = hechas.get(rel);
      if (!destinoRel) {
        destinoRel = nombreOpt(rel);
        await sharp(origen)
          .rotate()                                   // respeta la orientación de la foto del celular
          .resize(LADO, LADO, { fit: "cover", position: "centre" }) // cuadrado, centrado en X y Y
          .webp({ quality: CALIDAD })
          .toFile(path.join(DIST, destinoRel));
        hechas.set(rel, destinoRel);
        antes += fs.statSync(origen).size;
        despues += fs.statSync(path.join(DIST, destinoRel)).size;
        ok++;
      }
      p.foto = "/" + destinoRel;
    } catch (err) {
      fallos++;
      console.warn("⚠ No se pudo optimizar", rel, "→ se usa la original.", err.message);
    }
  }

  fs.writeFileSync(path.join(DIST, "productos.json"), JSON.stringify(productos, null, 2));
  const mb = (n) => (n / 1e6).toFixed(1) + " MB";
  console.log(`✔ Fotos optimizadas: ${ok} (fallos: ${fallos}) · ${mb(antes)} → ${mb(despues)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
