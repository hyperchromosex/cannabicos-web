/* =========================================================
   CANNABICOS · Lógica de la página
   ---------------------------------------------------------
   Los productos se editan desde el panel (Pages CMS) y se guardan
   en productos.json. Las categorías se cambian aquí abajo.
   ========================================================= */

const WHATSAPP = "573244259048"; // número con indicativo de Colombia (57)


/* ---------- Categorías ----------
   Cada categoría tiene su imagen 3D en img/categorias/. Si agregas una
   categoría nueva sin imagen, se muestra el logo en su lugar. */
const CATEGORIAS = [
  { id: "minibongs",            nombre: "Mini bongs", img: "img/categorias/minibongs.webp" },
  { id: "destilado-nacional",   nombre: "Destilado nacional", img: "img/categorias/destilado-nacional.webp" },
  { id: "destilado-importado",  nombre: "Destilado importado", img: "img/categorias/destilado-importado.webp" },
  { id: "gomitas",              nombre: "Gomitas mágicas", img: "img/categorias/gomitas.webp" },
  { id: "palas",                nombre: "Palas dosificadoras", img: "img/categorias/palas.webp" },
  { id: "armadores",            nombre: "Armadores", img: "img/categorias/armadores.webp" },
  { id: "rascadores",           nombre: "Rascadores", img: "img/categorias/rascadores.webp" },
  { id: "lentes",               nombre: "Lentes de contacto", img: "img/categorias/lentes.webp" },
  { id: "filtros",              nombre: "Filtros", img: "img/categorias/filtros.webp" },
  { id: "bandejas",             nombre: "Bandejas", img: "img/categorias/bandejas.webp" },
  { id: "crema-tatuajes",       nombre: "Crema para tatuajes", img: "img/categorias/crema-tatuajes.webp" },
  { id: "cueros",               nombre: "Cueros", img: "img/categorias/cueros.webp" },
  { id: "vapers",               nombre: "Vaper nicotina", img: "img/categorias/vapers.webp" },
  { id: "pipas",                nombre: "Pipas", img: "img/categorias/pipas.webp" },
  { id: "baterias",             nombre: "Baterías para destilados", img: "img/categorias/baterias.webp" },
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
  const grid = $("#catGrid");
  grid.innerHTML = CATEGORIAS.map((c) => `
    <button class="cat-card" data-cat="${c.id}">
      <span class="cat-img"><img src="${c.img || "img/logo.png"}" alt="" loading="lazy" width="480" height="480"></span>
      <span class="cat-name">${c.nombre}</span>
    </button>`).join("");
  // si falta una imagen, se muestra el logo
  grid.addEventListener("error", (e) => {
    if (e.target.tagName === "IMG" && !e.target.src.endsWith("img/logo.png")) e.target.src = "img/logo.png";
  }, true);
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-card");
    if (!btn) return;
    filtroCat = btn.dataset.cat;
    pintarChips(); pintarProductos();
    $("#catalogo").scrollIntoView({ behavior: "smooth" });
  });
  // flechas del carrusel
  const paso = () => Math.max(grid.clientWidth * 0.8, 200);
  $("#catPrev").addEventListener("click", () => grid.scrollBy({ left: -paso(), behavior: "smooth" }));
  $("#catNext").addEventListener("click", () => grid.scrollBy({ left: paso(), behavior: "smooth" }));
  const actualizarFlechas = () => {
    $("#catPrev").disabled = grid.scrollLeft < 8;
    $("#catNext").disabled = grid.scrollLeft + grid.clientWidth > grid.scrollWidth - 8;
  };
  grid.addEventListener("scroll", actualizarFlechas, { passive: true });
  window.addEventListener("resize", actualizarFlechas);
  actualizarFlechas();
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

/* ---------- Productos ----------
   El catálogo se muestra por FILAS completas, no por número fijo de productos,
   para que la última fila siempre quede llena en cualquier pantalla.
   Cuántas filas por tanda depende del alto de la pantalla y del alto de una
   tarjeta: se busca mostrar más o menos PANTALLAS_POR_TANDA pantallas de
   productos antes del botón "Ver más", para no tener que hacer tanto scroll
   para llegar a "Somos cannábicos" y "Visítanos". */
const PANTALLAS_POR_TANDA = 2;   // cuánto scroll (en pantallas) ocupa cada tanda
const FILAS_MIN = 2, FILAS_MAX = 5;
let tandas = 1;                   // cuántas tandas se están mostrando
let listaActual = [];

function columnasDelCatalogo() {
  const cols = getComputedStyle($("#productGrid")).gridTemplateColumns.split(" ").filter(Boolean).length;
  return Math.max(1, cols || 1);
}
function filasPorTanda() {
  const grid = $("#productGrid");
  const tarjeta = grid.querySelector(".product");
  const gap = parseFloat(getComputedStyle(grid).rowGap) || 0;
  const altoFila = tarjeta ? tarjeta.offsetHeight + gap : 560;
  const filas = Math.floor((window.innerHeight * PANTALLAS_POR_TANDA) / altoFila);
  return Math.min(FILAS_MAX, Math.max(FILAS_MIN, filas));
}
function cuantosMostrar() {
  return columnasDelCatalogo() * filasPorTanda() * tandas;
}

function pintarProductos(reiniciar = true) {
  if (reiniciar) tandas = 1;
  listaActual = productos.filter((p) =>
    (filtroCat === "todos" || p.cat === filtroCat) &&
    (!filtroTexto || (p.nombre + " " + p.desc).toLowerCase().includes(filtroTexto)));
  $("#emptyMsg").hidden = listaActual.length > 0;
  // primero se pinta una fila para medir la tarjeta, luego se completa la tanda
  if (!$("#productGrid").querySelector(".product")) dibujarTarjetas(listaActual.slice(0, columnasDelCatalogo()));
  const n = cuantosMostrar();
  dibujarTarjetas(listaActual.slice(0, n));
  actualizarVerMas(listaActual.length, n);
}

function dibujarTarjetas(lista) {
  $("#productGrid").innerHTML = lista.map((p) => {
    const cat = catPorId[p.cat] || { nombre: "" };
    const logo = `<img class="ph-logo" src="img/logo.png" alt="" aria-hidden="true">`;
    const imagen = p.foto
      ? `<img class="foto" src="${escapar(p.foto)}" alt="${escapar(p.nombre)}" loading="lazy" decoding="async" width="800" height="800">`
      : logo;
    const precio = p.precio ? formatoPeso(p.precio) : "Consultar precio";
    const msg = `¡Hola Cannábicos! 👋 Me interesa: ${p.nombre}. ¿Lo tienen disponible?`;
    return `
      <article class="product">
        <div class="product-img">${imagen}<span class="tag">${escapar(cat.nombre)}</span></div>
        <div class="product-body">
          <h3>${escapar(p.nombre)}</h3>
          <p>${escapar(p.desc)}</p>
          <p class="price">${precio}</p>
          <a class="btn btn-green btn-sm" href="${linkWhatsApp(msg)}" target="_blank" rel="noopener">Pedir<span class="solo-ancho"> por WhatsApp</span></a>
        </div>
      </article>`;
  }).join("");
}

function actualizarVerMas(total, mostrados) {
  const mas = $("#verMas"), menos = $("#verMenos");
  const faltan = total - mostrados;
  mas.hidden = faltan <= 0;
  if (faltan > 0) mas.textContent = `Ver más productos (${faltan})`;
  menos.hidden = tandas <= 1;     // se puede recoger apenas se haya abierto más de una tanda
}
$("#verMas").addEventListener("click", () => {
  tandas++;
  pintarProductos(false);
});
// al girar el celular o cambiar el tamaño de la ventana, se recalcula manteniendo las tandas abiertas
let esperaResize, anchoAnterior = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth === anchoAnterior) return;   // en celular, la barra del navegador cambia el alto al hacer scroll
  anchoAnterior = window.innerWidth;
  clearTimeout(esperaResize);
  esperaResize = setTimeout(() => { if (productos.length) pintarProductos(false); }, 200);
});
$("#verMenos").addEventListener("click", () => {
  pintarProductos(true);
  $("#catalogo").scrollIntoView({ behavior: "smooth" });
});

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

/* ---------- Textura animada de fondo (toda la página) ----------
   Una sola textura continua, inspirada en el cuadro del local, que fluye
   detrás de toda la página. Va pegada al contenido (se desplaza al hacer
   scroll), así cada sección muestra otra parte del mismo movimiento.
   En la cabecera se ve brillante; en el resto, suavizada con un velo beige.
   Si el celular no soporta WebGL, queda la imagen fija img/hero-textura.jpg. */
(function texturaFondo() {
  const canvas = document.getElementById("fondoTextura");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false });
  window.__textura = { webgl: !!gl, quieto: window.matchMedia("(prefers-reduced-motion: reduce)").matches, cuadros: 0 };
  if (!gl) return;
  const derivadas = !!gl.getExtension("OES_standard_derivatives");

  const VELO = 0.72; // qué tan suave se ve la textura fuera de la cabecera (0 = igual, 1 = beige liso)

  const vert = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const frag = `${derivadas ? "#extension GL_OES_standard_derivatives : enable\n" : ""}
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 uRes; uniform float uTime; uniform float uEscala;
    uniform float uScroll; uniform float uHeroFin; uniform float uVelo;
    // Colores (iguales al cuadro)
    const vec3 CREMA   = vec3(0.980, 0.847, 0.675);
    const vec3 NARANJA = vec3(0.953, 0.514, 0.137);
    const vec3 VERDE   = vec3(0.243, 0.608, 0.247);
    const vec3 VERDE_G = vec3(0.333, 0.498, 0.322);
    const vec3 BEIGE   = vec3(0.953, 0.937, 0.918);
    vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    // 2 capas de ruido (antes 3): casi igual a la vista y ~33% menos trabajo por pixel
    float fbm(vec2 p){ return 0.75*snoise(p) + 0.25*snoise(p*1.97 + 7.1); }
    float grano(vec2 c){ return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
    float paso(float borde, float v){
      ${derivadas ? "float w = max(fwidth(v) * 0.9, 0.002);" : "float w = 0.012;"}
      return smoothstep(borde - w, borde + w, v);
    }
    void main(){
      // posición en la PÁGINA (px CSS), para que la textura sea continua entre secciones
      vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uEscala;
      float y = css.y + uScroll;
      vec2 p = vec2(css.x, -y) * 0.00095;
      float t = uTime;
      vec2 q = vec2(fbm(p + vec2(0.0, 0.11*t)), fbm(p + vec2(5.2, 1.3) - 0.09*t));
      vec2 r = p + 0.95*q;
      float fo = fbm(r + vec2(1.7, 9.2) + 0.07*t);
      float fg = fbm(r*0.95 + vec2(8.3, 2.8) - 0.06*t);
      float o = paso(0.18, fo) * (1.0 - paso(0.40, fo) * (1.0 - paso(0.46, fo)));
      float gg = paso(0.26, fg), gv = paso(0.36, fg);
      vec3 col = mix(mix(mix(CREMA, NARANJA, o), VERDE_G, gg), VERDE, gv);
      // fuera de la cabecera: misma textura, suavizada con un velo beige
      col = mix(col, BEIGE, uVelo * step(uHeroFin, y));
      col -= (grano(floor(css)) - 0.5) * 0.045;   // grano de impresión vintage
      gl_FragColor = vec4(col, 1.0);
    }`;

  function shader(tipo, src) {
    const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = shader(gl.VERTEX_SHADER, vert), fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes"), uTime = u("uTime"), uEscala = u("uEscala"), uScroll = u("uScroll"), uHeroFin = u("uHeroFin"), uVelo = u("uVelo");

  /* Calidad automática: empieza en el nivel más alto y, si el celular no
     alcanza a dibujar fluido (menos de ~40 cuadros por segundo), baja de nivel.
     El nivel se recuerda en ese celular para la próxima visita. */
  const NIVELES = [
    { escala: 0.6,  salto: 1 },   // 0: máxima calidad, 60 cuadros/s
    { escala: 0.45, salto: 1 },   // 1: menos resolución
    { escala: 0.4,  salto: 2 },   // 2: textura a 30 cuadros/s (se mueve lento, casi no se nota)
    { escala: 0.32, salto: 3 },   // 3: 20 cuadros/s
    { escala: 0.3,  salto: 0 },   // 4: textura quieta (solo se redibuja al hacer scroll)
  ];
  const CLAVE = "cannabicos_nivel_textura";
  let nivel = 0;
  try { nivel = Math.min(NIVELES.length - 1, Math.max(0, parseInt(localStorage.getItem(CLAVE), 10) || 0)); } catch (e) {}
  if (window.__ESCALA_TEXTURA) NIVELES[nivel] = { escala: window.__ESCALA_TEXTURA, salto: 1 };
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__textura.nivel = nivel;
  let raf = 0, cuadro = 0, ultimoScroll = -1, tiempoCongelado = 0;
  const t0 = performance.now(), offset = Math.random() * 100;
  // medición de fluidez
  let medidos = 0, sumaMs = 0, ultimoRaf = 0;

  function ajustar() {
    const esc = NIVELES[nivel].escala;
    const w = Math.max(1, Math.round(canvas.clientWidth * esc));
    const h = Math.max(1, Math.round(canvas.clientHeight * esc));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function dibujar(ahora) {
    ajustar();
    const animada = !quieto && NIVELES[nivel].salto > 0;
    if (animada) tiempoCongelado = (ahora - t0) / 1000;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uEscala, canvas.width / Math.max(1, canvas.clientWidth));
    gl.uniform1f(uScroll, window.scrollY);
    gl.uniform1f(uHeroFin, hero.getBoundingClientRect().bottom + window.scrollY);
    gl.uniform1f(uVelo, VELO);
    gl.uniform1f(uTime, offset + tiempoCongelado);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ultimoScroll = window.scrollY;
    if (!canvas.classList.contains("ready")) {
      canvas.classList.add("ready");
      document.documentElement.classList.add("textura-viva");
    }
  }
  function medir(ahora) {
    if (ultimoRaf) { sumaMs += ahora - ultimoRaf; medidos++; }
    ultimoRaf = ahora;
    if (medidos >= 90) {                         // ~1,5 s de muestra
      const promedio = sumaMs / medidos;
      if (promedio > 24 && nivel < NIVELES.length - 1) {
        nivel++;
        window.__textura.nivel = nivel;
        try { localStorage.setItem(CLAVE, String(nivel)); } catch (e) {}
      }
      medidos = 0; sumaMs = 0;
    }
  }
  function bucle(ahora) {
    medir(ahora);
    const salto = NIVELES[nivel].salto;
    cuadro++;
    // se dibuja en su turno, o siempre que hubo scroll (para que la textura no "tiemble" respecto al contenido)
    if ((salto > 0 && cuadro % salto === 0) || window.scrollY !== ultimoScroll) {
      dibujar(ahora);
      window.__textura.cuadros++;
    }
    raf = !document.hidden ? requestAnimationFrame(bucle) : 0;
  }
  function pedirDibujo() { if (!raf) raf = requestAnimationFrame((a) => { raf = 0; quieto ? dibujar(a) : (ultimoRaf = 0, bucle(a)); }); }

  // Pausa cuando la pestaña está oculta (ahorra batería)
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pedirDibujo(); });
  // Sin animación (reducir movimiento): solo se redibuja al hacer scroll o cambiar tamaño
  window.addEventListener("scroll", () => { if (quieto) pedirDibujo(); }, { passive: true });
  window.addEventListener("resize", pedirDibujo);
  if (quieto) dibujar(performance.now()); else bucle(performance.now());
})();

/* ---------- Modo diagnóstico ----------
   Abre la página con ?diagnostico al final de la dirección
   (ej. cannabicos.pages.dev/?diagnostico) para ver por qué la
   animación se mueve o no en ese celular. No afecta a los clientes. */
(function diagnostico() {
  if (!/[?&]diagnostico\b/.test(location.search)) return;
  const caja = document.createElement("div");
  caja.className = "diag";
  document.body.appendChild(caja);
  const filas = [];
  const fila = (k, v, ok) => filas.push(`<div><b>${k}:</b> <span class="${ok ? "ok" : "mal"}">${v}</span></div>`);
  const t0 = performance.now(), c0 = (window.__textura || {}).cuadros || 0;
  setTimeout(() => {
    const t = window.__textura || {};
    const fps = Math.round((((t.cuadros || 0) - c0) * 1000) / (performance.now() - t0));
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fila("Reducir movimiento (pedido por el celular o el navegador)", reducir ? "SÍ → por eso no se mueve" : "no", !reducir);
    fila("WebGL (necesario para la textura animada)", t.webgl ? "sí" : "NO → se muestra la imagen fija", !!t.webgl);
    fila("Cuadros por segundo de la textura", t.webgl && !reducir ? fps : "—", fps > 15);
    fila("Nivel de calidad automático (0 = máximo, 4 = textura quieta)", t.nivel ?? "—", (t.nivel ?? 0) < 4);
    fila("Ahorro de datos", navigator.connection && navigator.connection.saveData ? "activado" : "no", true);
    fila("Navegador", navigator.userAgent.replace(/^Mozilla\/5.0 /, "").slice(0, 140), true);
    caja.innerHTML = `<p class="diag-titulo">Diagnóstico de la animación</p>${filas.join("")}<button class="btn btn-ghost btn-sm" id="diagCerrar">Cerrar</button>`;
    $("#diagCerrar").addEventListener("click", () => caja.remove());
  }, 2500);
  caja.innerHTML = "<p class='diag-titulo'>Midiendo… (2 segundos)</p>";
})();
