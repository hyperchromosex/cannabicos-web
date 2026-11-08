/* =========================================================
   CANNABICOS · Lógica de la página
   ---------------------------------------------------------
   Los productos se editan desde el panel (Pages CMS) y se guardan
   en productos.json. Las categorías se cambian aquí abajo.
   ========================================================= */

const WHATSAPP = "573244259048"; // número con indicativo de Colombia (57)


/* ---------- Categorías ---------- */
const CATEGORIAS = [
  { id: "minibongs",            nombre: "Mini bongs" },
  { id: "destilado-nacional",   nombre: "Destilado nacional" },
  { id: "destilado-importado",  nombre: "Destilado importado" },
  { id: "gomitas",              nombre: "Gomitas mágicas" },
  { id: "palas",                nombre: "Palas dosificadoras" },
  { id: "armadores",            nombre: "Armadores" },
  { id: "rascadores",           nombre: "Rascadores" },
  { id: "lentes",               nombre: "Lentes de contacto" },
  { id: "filtros",              nombre: "Filtros" },
  { id: "bandejas",             nombre: "Bandejas" },
  { id: "crema-tatuajes",       nombre: "Crema para tatuajes" },
  { id: "cueros",               nombre: "Cueros" },
  { id: "vapers",               nombre: "Vaper nicotina" },
  { id: "pipas",                nombre: "Pipas" },
  { id: "baterias",             nombre: "Baterías para destilados" },
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
    const msg = `¡Hola Cannábicos! 👋 Me interesa: ${p.nombre}. ¿Lo tienen disponible?`;
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

/* ---------- Textura animada de fondo (toda la página) ----------
   Una sola textura continua, inspirada en el cuadro del local, que fluye
   detrás de toda la página. Va pegada al contenido (se desplaza al hacer
   scroll), así cada sección muestra otra parte del mismo movimiento.
   En la cabecera se ve brillante; en el resto, detrás de una película oscura.
   Si el celular no soporta WebGL, queda la imagen fija img/hero-textura.jpg. */
(function texturaFondo() {
  const canvas = document.getElementById("fondoTextura");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return;
  const derivadas = !!gl.getExtension("OES_standard_derivatives");

  const VELO = 0.5; // intensidad de la película oscura fuera de la cabecera (0 = sin película, 1 = completa)

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
    // Mismos colores vistos detrás de una película oscura. El naranja se mantiene
    // saturado a propósito: un naranja oscurecido sin más se vuelve café.
    const vec3 CREMA_O   = vec3(0.075, 0.150, 0.088);
    const vec3 NARANJA_O = vec3(0.560, 0.215, 0.025);
    const vec3 VERDE_O   = vec3(0.105, 0.290, 0.115);
    const vec3 VERDE_G_O = vec3(0.125, 0.210, 0.128);
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
    float fbm(vec2 p){ return 0.72*snoise(p) + 0.24*snoise(p*1.97 + 7.1) + 0.04*snoise(p*4.01 - 3.3); }
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
      // fuera de la cabecera: la misma textura detrás de una película oscura
      vec3 osc = mix(mix(mix(CREMA_O, NARANJA_O, o), VERDE_G_O, gg), VERDE_O, gv);
      col = mix(col, osc, uVelo * step(uHeroFin, y));
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

  const ESCALA = window.__ESCALA_TEXTURA || 0.6;       // resolución relativa (menos = más liviano)
  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  const t0 = performance.now(), offset = Math.random() * 100;

  function ajustar() {
    const w = Math.max(1, Math.round(canvas.clientWidth * ESCALA));
    const h = Math.max(1, Math.round(canvas.clientHeight * ESCALA));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  function dibujar(ahora) {
    ajustar();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uEscala, canvas.width / Math.max(1, canvas.clientWidth));
    gl.uniform1f(uScroll, window.scrollY);
    gl.uniform1f(uHeroFin, hero.getBoundingClientRect().bottom + window.scrollY);
    gl.uniform1f(uVelo, VELO);
    gl.uniform1f(uTime, offset + (quieto ? 0 : (ahora - t0) / 1000));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!canvas.classList.contains("ready")) {
      canvas.classList.add("ready");
      document.documentElement.classList.add("textura-viva");
    }
  }
  function bucle(ahora) {
    dibujar(ahora);
    raf = !document.hidden && !quieto ? requestAnimationFrame(bucle) : 0;
  }
  function pedirDibujo() { if (!raf) raf = requestAnimationFrame((a) => { raf = 0; quieto ? dibujar(a) : bucle(a); }); }

  // Pausa cuando la pestaña está oculta (ahorra batería)
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pedirDibujo(); });
  // Sin animación (reducir movimiento): solo se redibuja al hacer scroll o cambiar tamaño
  window.addEventListener("scroll", () => { if (quieto) pedirDibujo(); }, { passive: true });
  window.addEventListener("resize", pedirDibujo);
  bucle(performance.now());
})();