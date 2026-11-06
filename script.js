/* =========================================================
   CANNABICOS · Lógica de la página
   ---------------------------------------------------------
   Los productos se leen de la hoja de Google Sheets (HOJA_CSV).
   Si HOJA_CSV está vacío, se usan los PRODUCTOS de ejemplo de abajo.
   ========================================================= */

const WHATSAPP = "573244259048"; // número con indicativo de Colombia (57)

/* Enlace de la hoja publicada como CSV
   (Archivo → Compartir → Publicar en la web → pestaña Productos → CSV).
   Déjalo vacío ("") para usar los productos de ejemplo. */
const HOJA_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTTRS_HGy1_Dkzx1eFbHskeBQQIMqBdS7w5uxmIldMt3uHt39mR0_zBbvqVnZEKqA/pub?gid=251208778&single=true&output=csv";

/* ---------- Categorías ---------- */
const CATEGORIAS = [
  { id: "bongs",       nombre: "Bongs" },
  { id: "pipas",       nombre: "Pipas" },
  { id: "destilados",  nombre: "Destilados" },
  { id: "baterias",    nombre: "Baterías para destilados" },
  { id: "gomitas",     nombre: "Gomitas comestibles" },
  { id: "cueros",      nombre: "Cueros" },
  { id: "rascadores",  nombre: "Rascadores" },
  { id: "encendedores",nombre: "Encendedores y sopletes" },
  { id: "palas",       nombre: "Palas y tarros para sople" },
  { id: "antiolores",  nombre: "Antiolores y filtros" },
  { id: "ceniceros",   nombre: "Ceniceros" },
  { id: "bandejas",    nombre: "Bandejas" },
  { id: "armadores",   nombre: "Armadores" },
  { id: "vapers",      nombre: "Vapers de nicotina" },
  { id: "lentes",      nombre: "Lentes de contacto" },
  { id: "piercings",   nombre: "Joyería para piercings" },
];

/* ---------- Productos de EJEMPLO ----------
   Reemplaza por los productos reales. OJO: los precios son INVENTADOS, solo para ver cómo se ven.
   - precio: número en pesos (ej. 45000) o null para "Consultar precio"
   - foto: ruta a la imagen (ej. "img/productos/bong-azul.jpg") o "" para mostrar el logo mientras tanto
*/
const PRODUCTOS = [
  { nombre: "Bong de vidrio 30 cm",          cat: "bongs",        desc: "Vidrio grueso con percolador.",           precio: 180000, foto: "" },
  { nombre: "Bong de silicona irrompible",   cat: "bongs",        desc: "Ideal para viaje, varios colores.",       precio: 65000, foto: "" },
  { nombre: "Pipa de vidrio artesanal",      cat: "pipas",        desc: "Diseños únicos hechos a mano.",            precio: 45000, foto: "" },
  { nombre: "Pipa de madera",                cat: "pipas",        desc: "Clásica y resistente.",                    precio: 35000, foto: "" },
  { nombre: "Destilado nacional",            cat: "destilados",   desc: "Pregunta por sabores disponibles.",        precio: 90000, foto: "" },
  { nombre: "Destilado importado",           cat: "destilados",   desc: "Pregunta por marcas disponibles.",         precio: 140000, foto: "" },
  { nombre: "Batería 510 recargable",        cat: "baterias",     desc: "Voltaje ajustable, carga USB-C.",          precio: 45000, foto: "" },
  { nombre: "Gomitas comestibles",           cat: "gomitas",      desc: "Varios sabores. Solo mayores de 18.",      precio: 40000, foto: "" },
  { nombre: "Cueros king size",              cat: "cueros",       desc: "Papel delgado de combustión lenta.",       precio: 6000, foto: "" },
  { nombre: "Rascador metálico 4 piezas",    cat: "rascadores",   desc: "Dientes afilados y recolector de polen.",  precio: 38000, foto: "" },
  { nombre: "Soplete recargable",            cat: "encendedores", desc: "Llama tipo jet, regulable.",               precio: 32000, foto: "" },
  { nombre: "Encendedor clásico",            cat: "encendedores", desc: "Varios diseños.",                          precio: 4000, foto: "" },
  { nombre: "Kit de palas y tarro",          cat: "palas",        desc: "Acero inoxidable + tarro de silicona.",    precio: 25000, foto: "" },
  { nombre: "Spray antiolor",                cat: "antiolores",   desc: "Neutraliza olores al instante.",           precio: 22000, foto: "" },
  { nombre: "Filtros / tips de cartón",      cat: "antiolores",   desc: "Libretas de filtros.",                     precio: 3000, foto: "" },
  { nombre: "Cenicero de cerámica",          cat: "ceniceros",    desc: "Diseños psicodélicos.",                    precio: 28000, foto: "" },
  { nombre: "Bandeja metálica ilustrada",    cat: "bandejas",     desc: "Tamaño mediano.",                          precio: 35000, foto: "" },
  { nombre: "Armador manual",                cat: "armadores",    desc: "Arma perfecto en segundos.",               precio: 15000, foto: "" },
  { nombre: "Vaper desechable",              cat: "vapers",       desc: "Contiene nicotina. Solo mayores de 18.",   precio: 48000, foto: "" },
  { nombre: "Lentes de color",               cat: "lentes",       desc: "Varios tonos. Pregunta disponibilidad.",   precio: 70000, foto: "" },
  { nombre: "Argolla de titanio",            cat: "piercings",    desc: "Para nariz, oreja y más.",                 precio: 25000, foto: "" },
  { nombre: "Barra para ombligo",            cat: "piercings",    desc: "Acero quirúrgico.",                        precio: 30000, foto: "" },
];

/* ================= No hace falta editar debajo de esta línea ================= */

const $ = (s) => document.querySelector(s);
const formatoPeso = (n) => "$" + n.toLocaleString("es-CO");
const catPorId = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c]));
const normalizar = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const escapar = (t) => String(t ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
let productos = [];
const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

let filtroCat = "todos";
let filtroTexto = "";

/* ---------- Verificación de edad ---------- */
(function ageGate() {
  const gate = $("#ageGate");
  let ok = false;
  try { ok = localStorage.getItem("cannabicos_18") === "si"; } catch (e) {}
  if (ok) { gate.classList.add("hidden"); return; }
  document.body.style.overflow = "hidden";
  $("#ageYes").addEventListener("click", () => {
    try { localStorage.setItem("cannabicos_18", "si"); } catch (e) {}
    gate.classList.add("hidden");
    document.body.style.overflow = "";
  });
  $("#ageNo").addEventListener("click", () => { $("#ageDenied").hidden = false; });
})();

/* ---------- Menú móvil ---------- */
const nav = $("#mainNav");
$("#menuToggle").addEventListener("click", (e) => {
  const open = nav.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

/* ---------- Categorías ---------- */
function pintarCategorias() {
  $("#catGrid").innerHTML = CATEGORIAS.map((c) => `
    <button class="cat-card" data-cat="${c.id}">
      <span class="cat-name">${c.nombre}</span>
      <span class="cat-arrow" aria-hidden="true">→</span>
    </button>`).join("");
  $("#catGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-card");
    if (!btn) return;
    filtroCat = btn.dataset.cat;
    pintarChips(); pintarProductos();
    $("#catalogo").scrollIntoView({ behavior: "smooth" });
  });
}

/* ---------- Chips de filtro ---------- */
function pintarChips() {
  const todas = [{ id: "todos", nombre: "Todo" }, ...CATEGORIAS];
  $("#chips").innerHTML = todas.map((c) =>
    `<button class="chip ${c.id === filtroCat ? "active" : ""}" data-cat="${c.id}">${c.nombre}</button>`).join("");
}
$("#chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filtroCat = chip.dataset.cat;
  pintarChips(); pintarProductos();
});
$("#searchInput").addEventListener("input", (e) => {
  filtroTexto = e.target.value.trim().toLowerCase();
  pintarProductos();
});

/* ---------- Productos ---------- */
function pintarProductos() {
  const lista = productos.filter((p) =>
    (filtroCat === "todos" || p.cat === filtroCat) &&
    (!filtroTexto || (p.nombre + " " + p.desc).toLowerCase().includes(filtroTexto)));

  $("#emptyMsg").hidden = lista.length > 0;
  $("#productGrid").innerHTML = lista.map((p) => {
    const cat = catPorId[p.cat] || { nombre: "" };
    const logo = `<img class="ph-logo" src="img/logo.png" alt="" aria-hidden="true">`;
    const imagen = p.foto
      ? `<img src="${escapar(p.foto)}" alt="${escapar(p.nombre)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('img'),{className:'ph-logo',src:'img/logo.png',alt:''}))">`
      : logo;
    const precio = p.precio ? formatoPeso(p.precio) : "Consultar precio";
    const msg = `¡Hola Cannabicos! 👋 Me interesa: ${p.nombre}. ¿Lo tienen disponible?`;
    return `
      <article class="product">
        <div class="product-img">${imagen}<span class="tag">${escapar(cat.nombre)}</span></div>
        <div class="product-body">
          <h3>${escapar(p.nombre)}</h3>
          <p>${escapar(p.desc)}</p>
          <p class="price">${precio}</p>
          <a class="btn btn-green btn-sm" href="${linkWhatsApp(msg)}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
        </div>
      </article>`;
  }).join("");
}

/* ---------- Texto circular alrededor del logo ---------- */
(function textoCircular() {
  const ring = document.querySelector(".badge-ring");
  if (!ring) return;
  const texto = ring.textContent;
  ring.textContent = "";
  const paso = 360 / texto.length;
  [...texto].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "ring-letter";
    s.textContent = ch;
    s.style.transform = `translateX(-50%) rotate(${i * paso}deg)`;
    ring.appendChild(s);
  });
})();

/* ---------- Lectura de la hoja de Google Sheets ---------- */
function parsearCSV(texto) {
  const filas = []; let fila = []; let campo = ""; let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

// Convierte un enlace de Google Drive en un enlace de imagen que la página puede mostrar
function fotoDesdeEnlace(url) {
  url = String(url || "").trim();
  if (!url) return "";
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  return /^https?:\/\//.test(url) || url.startsWith("img/") ? url : "";
}

function buscarCategoria(valor) {
  const v = normalizar(valor);
  const cat = CATEGORIAS.find((c) => normalizar(c.id) === v || normalizar(c.nombre) === v);
  return cat ? cat.id : "";
}

async function cargarProductos() {
  if (!HOJA_CSV) { productos = PRODUCTOS; pintarProductos(); return; }
  $("#productGrid").innerHTML = `<p class="empty">Cargando productos…</p>`;
  try {
    const resp = await fetch(HOJA_CSV, { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const [encabezados, ...filas] = parsearCSV(await resp.text());
    const col = Object.fromEntries(encabezados.map((h, i) => [normalizar(h), i]));
    const dato = (fila, nombre) => (fila[col[nombre]] ?? "").trim();
    productos = filas
      .filter((f) => dato(f, "nombre") && !["no", "n", "false", "0"].includes(normalizar(dato(f, "mostrar"))))
      .map((f) => ({
        nombre: dato(f, "nombre"),
        cat: buscarCategoria(dato(f, "categoria")),
        desc: dato(f, "descripcion"),
        precio: parseInt(dato(f, "precio").replace(/[^\d]/g, ""), 10) || null,
        foto: fotoDesdeEnlace(dato(f, "foto")),
      }));
    pintarProductos();
  } catch (err) {
    console.error("No se pudo leer la hoja de productos:", err);
    $("#emptyMsg").hidden = true;
    $("#productGrid").innerHTML = `<p class="empty">No pudimos cargar el catálogo en este momento. ¡Escríbenos por WhatsApp y te ayudamos!</p>`;
  }
}

$("#year").textContent = new Date().getFullYear();
pintarCategorias();
pintarChips();
cargarProductos();