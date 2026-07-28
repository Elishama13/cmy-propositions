/* ============================================================
   CMY IMPRIMERIE DESIGN — scène « lettres boîtiers »
   ------------------------------------------------------------
   Les trois lettres sont fabriquées ici comme à l'atelier :
     1. on trace un profil (THREE.Shape) — c'est le fichier de découpe
     2. on l'extrude (ExtrudeGeometry) — c'est le chant du boîtier
     3. on pose une face diffusante émissive — c'est le PMMA
     4. on allume, lettre après lettre — c'est la mise sous tension
   La page reste utilisable sans WebGL et sans réseau : en cas
   d'échec, l'enseigne à plat du HTML prend le relais.
   ============================================================ */

const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
const switchBtn = document.getElementById('lightSwitch');
const switchLabel = document.getElementById('switchLabel');
const ctrlNote = document.getElementById('ctrlNote');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fallback() {
  if (stage) { stage.classList.add('no-webgl'); }
  if (switchBtn) { switchBtn.hidden = true; }
  if (ctrlNote) {
    ctrlNote.textContent = 'Enseigne présentée à plat : cet appareil n’affiche pas la 3D.';
  }
}

/* WebGL disponible ? */
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (!stage || !canvas || !hasWebGL()) {
  fallback();
} else {
  boot();
}

async function boot() {
  let THREE, EffectComposer, RenderPass, UnrealBloomPass;

  try {
    // les noms « three » et « three/addons/ » sont résolus par la carte
    // d'imports déclarée dans la page : les modules d'effets en dépendent.
    THREE = await import('three');
    ({ EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js'));
    ({ RenderPass } = await import('three/addons/postprocessing/RenderPass.js'));
    ({ UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js'));
  } catch (err) {
    // hors ligne, ou CDN bloqué : on garde l'enseigne à plat
    fallback();
    return;
  }

  /* ---------- 1. Profils de découpe ---------- */
  /* Chaque lettre est un contour fermé, comme le fichier envoyé à la fraiseuse. */

  function shapeC() {
    const s = new THREE.Shape();
    const R = 1, r = 0.58, m = 0.42; // rayon extérieur, intérieur, ouverture
    s.absarc(0, 0, R, m, Math.PI * 2 - m, false);
    s.absarc(0, 0, r, Math.PI * 2 - m, m, true);
    s.closePath();
    return s;
  }

  function shapeM() {
    const s = new THREE.Shape();
    const w = 0.95, h = 1, t = 0.34;      // demi-largeur, demi-hauteur, épaisseur du jambage
    s.moveTo(-w, -h);
    s.lineTo(-w, h);
    s.lineTo(-w + t, h);
    s.lineTo(0, h - 0.62);
    s.lineTo(w - t, h);
    s.lineTo(w, h);
    s.lineTo(w, -h);
    s.lineTo(w - t, -h);
    s.lineTo(w - t, h - 0.72);
    s.lineTo(0, -0.02);
    s.lineTo(-w + t, h - 0.72);
    s.lineTo(-w + t, -h);
    s.closePath();
    return s;
  }

  function shapeY() {
    const s = new THREE.Shape();
    const w = 0.9, h = 1, t = 0.3;
    s.moveTo(-w, h);
    s.lineTo(-w + t, h);
    s.lineTo(0, 0.16);
    s.lineTo(w - t, h);
    s.lineTo(w, h);
    s.lineTo(t / 2, -0.06);
    s.lineTo(t / 2, -h);
    s.lineTo(-t / 2, -h);
    s.lineTo(-t / 2, -0.06);
    s.closePath();
    return s;
  }

  /* ---------- 2. Scène ---------- */
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.1, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if ('outputColorSpace' in renderer) { renderer.outputColorSpace = THREE.SRGBColorSpace; }

  /* ---------- 3. Matières ---------- */
  /* le chant : tôle pliée, thermolaquée, sombre */
  const chant = new THREE.MeshStandardMaterial({ color: 0x323B47, metalness: 0.5, roughness: 0.45 });

  /* la face : PMMA diffusant. L'intensité émissive EST la mise sous tension. */
  function faceMaterial(hex) {
    return new THREE.MeshStandardMaterial({
      color: 0x1A2028,
      emissive: new THREE.Color(hex),
      emissiveIntensity: 0,
      metalness: 0,
      roughness: 0.75
    });
  }

  const LETTERS = [
    { shape: shapeC(), x: -2.5, tint: 0xFFC978 },  // blanc chaud
    { shape: shapeM(), x: 0,    tint: 0xFFD79A },
    { shape: shapeY(), x: 2.45, tint: 0x7FD4F5 }   // blanc froid
  ];

  const group = new THREE.Group();
  const faces = [];
  const lamps = [];

  LETTERS.forEach((def, i) => {
    const geo = new THREE.ExtrudeGeometry(def.shape, {
      depth: 0.46,               // le chant du boîtier
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 24
    });
    geo.center();

    const face = faceMaterial(def.tint);
    faces.push(face);

    // matériau 0 = flancs (chant), matériau 1 = faces avant/arrière
    const mesh = new THREE.Mesh(geo, [face, chant]);
    mesh.position.x = def.x;
    mesh.userData.n = i;
    group.add(mesh);

    // la LED interne : elle éclaire le mur derrière la lettre
    const lamp = new THREE.PointLight(def.tint, 0, 6, 2);
    lamp.position.set(def.x, 0, 0.9);
    lamps.push(lamp);
    group.add(lamp);
  });

  group.scale.setScalar(0.98);
  scene.add(group);

  /* le mur : ce qui reçoit le halo */
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 18),
    new THREE.MeshStandardMaterial({ color: 0x0E1218, roughness: 1, metalness: 0 })
  );
  wall.position.z = -1.5;
  scene.add(wall);

  /* Éclairage de rue : assez pour que l'enseigne éteinte reste lisible.
     Une enseigne noire sur fond noir ne raconte rien — c'est le contraste
     entre les deux états qui est l'argument. */
  scene.add(new THREE.AmbientLight(0x3D4B5C, 1.5));
  const key = new THREE.DirectionalLight(0xA8BED4, 1.15);
  key.position.set(-3.5, 3, 4.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6E86A0, 0.5);
  rim.position.set(3, -1.5, 2);
  scene.add(rim);

  /* ---------- 4. Bloom : le halo d'une enseigne vue de loin ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.7, 0.42);
  const wideScreen = window.matchMedia('(min-width: 700px)').matches;
  if (wideScreen) { composer.addPass(bloom); }

  /* ---------- 5. Dimensions ---------- */
  /* l'enseigne doit tenir dans le cadre quelle que soit la fenêtre :
     on recule la caméra jusqu'à ce que la largeur ET la hauteur passent,
     au lieu de régler une distance à l'œil. */
  const SIGN_W = 7.4;   // largeur de l'enseigne, marges comprises
  const SIGN_H = 3.4;

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) { return; }

    const aspect = w / h;
    camera.aspect = aspect;

    const halfFov = (camera.fov * Math.PI) / 180 / 2;
    const distForHeight = (SIGN_H / 2) / Math.tan(halfFov);
    const distForWidth = (SIGN_W / 2) / (Math.tan(halfFov) * aspect);
    camera.position.z = Math.max(distForHeight, distForWidth);
    camera.updateProjectionMatrix();

    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- 6. Allumage ---------- */
  let lit = true;          // état visé
  let t0 = performance.now();
  const MAX_FACE = 1.85;   // au-delà, le PMMA « crame » et perd sa couleur
  const MAX_LAMP = 2.4;

  function setLit(next) {
    lit = next;
    t0 = performance.now();
    if (switchBtn) { switchBtn.setAttribute('aria-pressed', String(lit)); }
    if (switchLabel) { switchLabel.textContent = lit ? 'Enseigne allumée' : 'Enseigne éteinte'; }
    if (ctrlNote) {
      ctrlNote.textContent = lit
        ? 'Coupez le courant pour voir ce que vos clients voient le jour.'
        : 'Rallumez : c’est ce que voient vos clients après 18 h.';
    }
  }

  if (switchBtn) {
    switchBtn.addEventListener('click', () => setLit(!lit));
  }

  /* parallaxe : la tête bouge devant l'enseigne, l'enseigne ne bouge pas */
  const aim = { x: 0, y: 0 };
  if (!reduced) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      aim.x = ((e.clientX - r.left) / r.width - 0.5) * 0.34;
      aim.y = ((e.clientY - r.top) / r.height - 0.5) * 0.22;
    });
    stage.addEventListener('pointerleave', () => { aim.x = 0; aim.y = 0; });
  }

  /* ---------- 7. Boucle ---------- */
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.01 }).observe(stage);
  }

  function frame(now) {
    if (visible) {
      const elapsed = (now - t0) / 1000;

      faces.forEach((face, i) => {
        // chaque lettre s'allume à son tour, comme on branche les circuits
        const delay = lit ? i * 0.3 : (2 - i) * 0.12;
        const k = Math.min(Math.max((elapsed - delay) / 0.5, 0), 1);
        const eased = k * k * (3 - 2 * k);
        const target = lit ? eased : 1 - eased;

        // léger frémissement de l'alimentation, comme un vrai transfo
        const flicker = lit && target > 0.9 && !reduced
          ? 1 + Math.sin(now / 240 + i * 2.1) * 0.035
          : 1;

        face.emissiveIntensity = target * MAX_FACE * flicker;
        lamps[i].intensity = target * MAX_LAMP;
      });

      if (!reduced) {
        group.rotation.y += (aim.x - group.rotation.y) * 0.055;
        group.rotation.x += (-aim.y - group.rotation.x) * 0.055;
      }

      composer.render();
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
