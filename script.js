/* -------------------------------------------------------
   MODELO 3D — poné laptop.glb en la misma carpeta
------------------------------------------------------- */
const GLB_MODEL = "laptop.glb";

/* -------------------------------------------------------
   IMÁGENES DE LA PANTALLA
   Cambiá los nombres por los de tus archivos.
   Tienen que estar en la misma carpeta que index.html.
------------------------------------------------------- */
const IMG_AURA  = "1.png";   // ← imagen proyecto 01
const IMG_POLAR = "2.png";  // ← imagen proyecto 02

/* -------------------------------------------------------
   Setup de escena — una por canvas
------------------------------------------------------- */
function setupScene(canvasId, imgPath) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const wrap = canvas.parentElement;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d0d);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 60);
  camera.position.set(0, 1.2, 9);
  camera.lookAt(0, 0.2, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.40));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x99bbff, 0.8);
  rim.position.set(-5, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(0, -3, 4); scene.add(fill);

  /* 1. Cargamos la textura de pantalla */
  const screenTex = new THREE.TextureLoader().load(imgPath, () => {
    screenTex.encoding  = THREE.sRGBEncoding;
    screenTex.flipY     = true;
    screenTex.needsUpdate = true;

    /* 2. Cargamos el GLB */
    const loader = new THREE.GLTFLoader();
    loader.load(GLB_MODEL, (gltf) => {
      const model = gltf.scene;

      /* 3. Buscamos el nodo "Object_7" que es la pantalla (Mesh 3 / Material.004)
            y le reemplazamos el material con nuestra textura              */
      model.traverse((child) => {
        if (child.isMesh && child.name === "Object_7") {
          child.material = new THREE.MeshBasicMaterial({
            map: screenTex,
            side: THREE.FrontSide,
          });
        }
      });

      /* 4. Centrar y escalar automáticamente */
      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const scale  = 3.5 / Math.max(size.x, size.y, size.z);
      model.position.sub(center.multiplyScalar(scale));
      model.scale.setScalar(scale);
      model.position.y -= 0.4;

      scene.add(model);

      /* 5. Drag para rotar */
      let drag = false, px = 0, py = 0;
      let ry = -0.2, rx = 0.06;
      let ty = ry, tx = rx;
      let auto = true, t = 0;

      const start = (x, y) => { drag = true; px = x; py = y; auto = false; };
      const move  = (x, y) => {
        if (!drag) return;
        ty += (x - px) * 0.013;
        tx += (y - py) * 0.008;
        tx = Math.max(-0.35, Math.min(0.35, tx));
        px = x; py = y;
      };
      const end = () => { drag = false; };

      canvas.addEventListener("mousedown",  e => start(e.clientX, e.clientY));
      window.addEventListener("mousemove",  e => move(e.clientX, e.clientY));
      window.addEventListener("mouseup",    end);
      canvas.addEventListener("touchstart", e => { e.preventDefault(); start(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
      canvas.addEventListener("touchmove",  e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
      canvas.addEventListener("touchend",   end);

      (function animate() {
        requestAnimationFrame(animate);
        t++;
        if (auto) ty = Math.sin(t * 0.008) * 0.35 - 0.1;
        ry += (ty - ry) * 0.07;
        rx += (tx - rx) * 0.07;
        model.rotation.y = ry;
        model.rotation.x = rx;
        renderer.render(scene, camera);
      })();
    });
  });

  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(wrap);
  resize();
}

window.addEventListener("load", () => {
  setupScene("canvas-aura",  IMG_AURA);
  setupScene("canvas-polar", IMG_POLAR);
});


/* ── Cursor personalizado ── */
const cur = document.getElementById("cursor");
document.addEventListener("mousemove", e => {
  cur.style.left = e.clientX + "px";
  cur.style.top  = e.clientY + "px";
});
document.querySelectorAll("a, button").forEach(el => {
  el.addEventListener("mouseenter", () => cur.classList.add("hover"));
  el.addEventListener("mouseleave", () => cur.classList.remove("hover"));
});

/* ── Fade-up al hacer scroll ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".fade-up").forEach(el => obs.observe(el));
setTimeout(() => {
  document.querySelectorAll(".hero .fade-up").forEach((el, i) =>
    setTimeout(() => el.classList.add("visible"), i * 150 + 300));
}, 100);