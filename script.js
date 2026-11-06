/* =========================================================
   CANNABICOS · Lógica de la página
   ---------------------------------------------------------
   Los productos se editan desde el panel (Pages CMS) y se guardan
   en productos.json. Las categorías se cambian aquí abajo.
   ========================================================= */

const WHATSAPP = "573244259048"; // número con indicativo de Colombia (57)


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
      ? `<img class="foto" src="${escapar(p.foto)}" alt="${escapar(p.nombre)}" loading="lazy">`
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

/* ---------- Lectura de productos.json (lo edita el panel) ---------- */
function rutaFoto(url) {
  url = String(url || "").trim();
  if (!url) return "";
  if (url.startsWith("/")) return url.slice(1);           // "/img/productos/x.jpg" → "img/productos/x.jpg"
  return /^https?:\/\//.test(url) || url.startsWith("img/") ? url : "";
}

function buscarCategoria(valor) {
  const v = normalizar(valor);
  const cat = CATEGORIAS.find((c) => normalizar(c.id) === v || normalizar(c.nombre) === v);
  return cat ? cat.id : "";
}

async function cargarProductos() {
  $("#productGrid").innerHTML = `<p class="empty">Cargando productos…</p>`;
  try {
    const resp = await fetch("productos.json", { cache: "no-cache" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const datos = await resp.json();
    productos = (Array.isArray(datos) ? datos : [])
      .filter((p) => p && p.nombre && p.visible !== false)
      .map((p) => ({
        nombre: String(p.nombre),
        cat: buscarCategoria(p.categoria),
        desc: String(p.descripcion || ""),
        precio: Number(p.precio) > 0 ? Math.round(Number(p.precio)) : null,
        foto: rutaFoto(p.foto),
      }));
    pintarProductos();
  } catch (err) {
    console.error("No se pudo leer productos.json:", err);
    $("#emptyMsg").hidden = true;
    $("#productGrid").innerHTML = `<p class="empty">No pudimos cargar el catálogo en este momento. ¡Escríbenos por WhatsApp y te ayudamos!</p>`;
  }
}

// Si una foto no carga, se muestra el logo en su lugar
$("#productGrid").addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName === "IMG" && img.classList.contains("foto")) {
    img.classList.replace("foto", "ph-logo");
    img.alt = "";
    img.src = "img/logo.png";
  }
}, true);

$("#year").textContent = new Date().getFullYear();
pintarCategorias();
pintarChips();
cargarProductos();