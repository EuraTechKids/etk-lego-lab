(function () {
'use strict';
const $ = (s) => document.querySelector(s);

// ---------- Couleurs LDraw (code -> [nom, hex, alpha]) ----------
const COLORS = {
  0:['Noir','#1B2A34',255],1:['Bleu','#1E5AA8',255],2:['Vert','#00852B',255],3:['Turquoise foncé','#069D9F',255],
  4:['Rouge','#B40000',255],5:['Rose foncé','#D3359D',255],6:['Marron','#543324',255],7:['Gris clair','#8A928D',255],
  8:['Gris foncé','#545955',255],9:['Bleu clair','#97CBD9',255],10:['Vert vif','#58AB41',255],11:['Turquoise clair','#00AAA4',255],
  12:['Saumon','#F06D61',255],13:['Rose','#F6A9BB',255],14:['Jaune','#FAC80A',255],15:['Blanc','#F4F4F4',255],
  17:['Vert clair','#ADD9A8',255],18:['Jaune clair','#FFD67F',255],19:['Beige','#D7BA8C',255],20:['Violet clair','#AFBED6',255],
  22:['Violet','#671F81',255],23:['Bleu violet foncé','#0E3E9A',255],25:['Orange','#D67923',255],26:['Magenta','#901F76',255],
  27:['Citron vert','#A5CA18',255],28:['Beige foncé','#897D62',255],29:['Rose vif','#FF9ECD',255],30:['Lavande moyen','#A06EB9',255],
  31:['Lavande','#CDA4DE',255],33:['Bleu foncé transparent','#0020A0',128],34:['Vert transparent','#237841',128],
  35:['Vert vif transparent','#56E646',128],36:['Rouge transparent','#C91A09',128],37:['Rose transparent','#DF6695',128],
  38:['Orange fluo transparent','#FF800D',128],40:['Noir transparent','#635F52',128],41:['Bleu moyen transparent','#559AB7',128],
  42:['Vert fluo transparent','#C0FF00',128],43:['Bleu clair transparent','#AEE9EF',128],46:['Jaune transparent','#F5CD2F',128],
  47:['Transparent','#FCFCFC',128],70:['Brun rougeâtre','#5F3109',255],71:['Gris bleuté clair','#A0A5A9',255],
  72:['Gris bleuté foncé','#6C6E68',255],73:['Bleu moyen','#5A93DB',255],74:['Vert moyen','#73DCA1',255],
  78:['Nougat clair','#F6D7B3',255],84:['Nougat moyen','#AA7D55',255],85:['Violet foncé','#3F3691',255],
  191:['Orange clair vif','#FCAC00',255],212:['Bleu clair vif','#9DC3F7',255],226:['Jaune clair vif','#FFEC6C',255],
  272:['Bleu marine','#0A3463',255],288:['Vert foncé','#184632',255],308:['Brun foncé','#352100',255],320:['Rouge foncé','#720E0F',255],
  321:['Azur foncé','#078BC9',255],322:['Azur moyen','#36AEBF',255],323:['Aqua clair','#ADC3C0',255],326:['Vert jaunâtre','#DFEEA5',255],
  330:['Vert olive','#9B9A5A',255],353:['Corail','#FF6D77',255],378:['Vert sable','#A0BCAC',255],379:['Bleu sable','#6074A1',255],
  484:['Orange foncé','#A95500',255],
  158:['Vert clair moyen','#77C9A0',255],334:['Or chromé','#BBA53D',255],383:['Argent chromé','#E0E0E0',255],
};

// ---------- Noms de pièces (FR) ----------
const NAMES = {
  '3001':'Brique 2×4','3004':'Brique 1×2','3023b':'Plaque 1×2','3710':'Plaque 1×4','3062b':'Brique ronde 1×1',
  '3941':'Brique ronde 2×2','4032a':'Plaque ronde 2×2','3069b':'Plaque lisse 1×2','15535':'Plaque lisse ronde 2×2 avec trou',
  '14769p01':'Plaque lisse ronde 2×2 imprimée','2654':'Plaque ronde 2×2 à fond arrondi','3700':'Brique Technic 1×2 avec trou',
  '3701':'Brique Technic 1×4 avec trous','3709b':'Plaque Technic 2×4 avec trous','2780':'Cheville Technic avec friction',
  '3749':'Cheville-axe Technic','32062':'Axe Technic 2 cranté','87083':'Axe Technic 4 avec butée','44294':'Axe Technic 7',
  '62462':'Connecteur de cheville rond 2L','3040b':'Brique inclinée 45° 2×1','4286':'Brique inclinée 33° 3×1',
  '4287':'Brique inclinée inversée 33° 3×1','85984':'Plaque inclinée 30° 1×2','42022':'Pente incurvée 6×1',
  '50950':'Pente incurvée 3×1','93273':'Pente incurvée double 4×1','2458':'Brique 1×2 avec cheville',
  '87087':'Brique 1×1 avec tenon latéral','44728':'Équerre 1×2 – 2×2','55982':'Jante','56891':'Pneu',
  '32198':'Engrenage conique 20 dents','32270':'Engrenage 12 dents double conique','32192':'Connecteur d\'angle Technic n°4',
  '32016':'Connecteur d\'angle Technic n°3',
};

// ---------- Formes approximées (unités LDraw, Y vers le bas) ----------
const CAT = {
  '3001':['brick',80,40,24],'3004':['brick',40,20,24],'3023b':['brick',40,20,8],'3710':['brick',80,20,8],
  '3700':['brick',40,20,24],'3701':['brick',80,20,24],'3709b':['brick',80,40,8],'2458':['brick',40,20,24],'87087':['brick',20,20,24],
  '3069b':['tile',40,20,8],'3062b':['round',10,24],'3941':['round',20,24],'4032a':['round',20,8],'2654':['round',20,8],
  '15535':['rtile',20,8],'14769p01':['rtile',20,8],
  '2780':['rod',40,6],'3749':['rod',40,5],'32062':['rod',40,4],'87083':['rod',80,4],'44294':['rod',140,4],'62462':['rod',40,8],
  '55982':['wheel',22,35],'56891':['wheel',46,45],'32198':['wheel',20,8],
  '3040b':['slope',40,20,24,'x'],'85984':['slope',40,20,16,'x'],'50950':['slope',60,20,16,'x'],
  '4286':['slope',20,60,24,'z'],'4287':['slope',20,60,24,'z'],'42022':['slope',20,120,16,'z'],'93273':['tile',80,20,16],
};

const idOf = (p) => p.replace(/\.dat$/, '').replace(/^.*\//, '');
const baseCode = (k) => (k.startsWith('e:') ? k.slice(2) : k);
function colorInfo(k) {
  const b = baseCode(k);
  if (/^0x2[0-9a-f]{6}$/i.test(b)) return ['Couleur directe', '#' + b.slice(3), 255];
  return COLORS[b] || ['Couleur ' + b, '#9BA19D', 255];
}
function edgeHex(k) {
  const [, hex] = colorInfo(k);
  const c = parseInt(hex.slice(1), 16), l = (0.3 * (c >> 16) + 0.59 * ((c >> 8) & 255) + 0.11 * (c & 255)) / 255;
  return l < 0.22 ? '#6b6b6b' : '#1b1b1b';
}

// ---------- Three.js ----------
const canvas = $('#c3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 1, 20000);
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.12;
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4;
scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0xffffff, 0.3); scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.18 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const root = new THREE.Group(); root.rotation.x = Math.PI; scene.add(root); // LDraw : Y vers le bas

const mats = new Map();
function mat(k, dim) {
  const key = k + (dim ? '|d' : '');
  if (mats.has(key)) return mats.get(key);
  let m;
  if (k.startsWith('e:') || k === '24') m = new THREE.MeshStandardMaterial({ color: new THREE.Color(edgeHex(k)).convertSRGBToLinear(), side: THREE.DoubleSide });
  else {
    const [, hex, a] = colorInfo(k);
    const tr = a < 255;
    m = new THREE.MeshStandardMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), roughness: 0.32, metalness: 0,
      side: THREE.DoubleSide, transparent: tr || dim, opacity: dim ? 0.22 : (tr ? 0.55 : 1), depthWrite: !(tr || dim),
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  }
  mats.set(key, m); return m;
}
const lineMats = new Map();
function lineMat(k, dim) {
  const key = baseCode(k) + (dim ? '|d' : '');
  if (!lineMats.has(key)) lineMats.set(key, new THREE.LineBasicMaterial({ color: new THREE.Color(edgeHex(k)).convertSRGBToLinear(), transparent: true, opacity: dim ? 0.1 : 0.55 }));
  return lineMats.get(key);
}

// ----- géométries approximées -----
const procMemo = new Map();
function studs(nx, nz, list) {
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++)
    list.push(new THREE.CylinderGeometry(6, 6, 4, 16).translate((i - (nx - 1) / 2) * 20, -2, (j - (nz - 1) / 2) * 20));
}
function wedge(L, W, H, axis) {
  const s = new THREE.Shape();
  const top = Math.min(20, L / 3);
  s.moveTo(-L / 2, H); s.lineTo(L / 2, H); s.lineTo(L / 2, 0); s.lineTo(L / 2 - top, 0); s.lineTo(-L / 2, H - 4); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: W, bevelEnabled: false });
  const M = new THREE.Matrix4();
  if (axis === 'z') M.set(0, 0, 1, -W / 2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
  else M.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -W / 2, 0, 0, 0, 1);
  g.applyMatrix4(M); return g;
}
function procGeoms(part) {
  const id = idOf(part);
  if (procMemo.has(id)) return procMemo.get(id);
  const c = CAT[id] || ['box'], out = [];
  switch (c[0]) {
    case 'brick': out.push(new THREE.BoxGeometry(c[1], c[3], c[2]).translate(0, c[3] / 2, 0)); studs(Math.round(c[1] / 20), Math.round(c[2] / 20), out); break;
    case 'tile': out.push(new THREE.BoxGeometry(c[1], c[3], c[2]).translate(0, c[3] / 2, 0)); break;
    case 'round': out.push(new THREE.CylinderGeometry(c[1], c[1], c[2], 28).translate(0, c[2] / 2, 0)); c[1] >= 20 ? studs(2, 2, out) : studs(1, 1, out); break;
    case 'rtile': out.push(new THREE.CylinderGeometry(c[1], c[1], c[2], 28).translate(0, c[2] / 2, 0)); break;
    case 'rod': out.push(new THREE.CylinderGeometry(c[2], c[2], c[1], 16).rotateZ(Math.PI / 2)); break;
    case 'wheel': out.push(new THREE.CylinderGeometry(c[1], c[1], c[2], 32).rotateX(Math.PI / 2)); break;
    case 'slope': { const ax = c[4], L = ax === 'x' ? c[1] : c[2], W = ax === 'x' ? c[2] : c[1]; out.push(wedge(L, W, c[3], ax)); studs(ax === 'x' ? 1 : Math.round(c[1] / 20), ax === 'x' ? Math.round(c[2] / 20) : 1, out);
      out[out.length - 1].translate(ax === 'x' ? L / 2 - 10 : 0, 0, ax === 'z' ? L / 2 - 10 : 0); break; }
    default: out.push(new THREE.BoxGeometry(16, 16, 16));
  }
  const res = out.map((g, i) => ({ g, e: i === 0 ? new THREE.EdgesGeometry(g, 35) : null }));
  procMemo.set(id, res); return res;
}

// ----- géométries fidèles (bibliothèque LDraw) -----
const hqMemo = new Map();
function hqGeoms(part, color, flat) {
  const key = part + '|' + color;
  if (hqMemo.has(key)) return hqMemo.get(key);
  const out = { tri: [], lin: [] };
  const triBy = new Map(), linArr = [];
  for (const [k, arr] of flat.tri) { const nk = LDCore.resolveColor(k, color); if (!triBy.has(nk)) triBy.set(nk, []); const d = triBy.get(nk); for (const v of arr) d.push(v); }
  for (const [, arr] of flat.lin) for (const v of arr) linArr.push(v);
  for (const [k, arr] of triBy) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); g.computeVertexNormals();
    out.tri.push({ k, g });
  }
  if (linArr.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(linArr, 3)); out.lin = g; }
  hqMemo.set(key, out); return out;
}

// ---------- État ----------
let model = null, P = null, cur = 0, allMode = true, nodes = [];
const flatMemo = new Map(), parsedLib = new Map(), libDesc = new Map();
let hqCount = 0;

function partName(part) {
  const id = idOf(part);
  return NAMES[id] || libDesc.get(part) || 'Pièce ' + id;
}

function buildScene() {
  for (const n of nodes) root.remove(n.obj);
  nodes = []; hqCount = 0;
  const missing = new Set();
  for (const pl of P.list) {
    const obj = new THREE.Group();
    obj.matrixAutoUpdate = false;
    const [x, y, z, a, b, c, d, e, f, g, h, i] = pl.m;
    obj.matrix.set(a, b, c, x, d, e, f, y, g, h, i, z, 0, 0, 0, 1);
    const meshes = [], lines = [];
    let G = null;
    if (parsedLib.has(pl.part)) {
      if (!flatMemo.has(pl.part)) flatMemo.set(pl.part, LDCore.flatten(pl.part, parsedLib, new Map(), missing));
      G = hqGeoms(pl.part, pl.color, flatMemo.get(pl.part));
      if (!G.tri.length) G = null; // sous-fichiers absents : on garde la forme approximée
    }
    if (G) {
      hqCount++;
      for (const t of G.tri) { const m = new THREE.Mesh(t.g, mat(t.k)); m.userData.k = t.k; meshes.push(m); }
      if (G.lin && G.lin.isBufferGeometry) { const l = new THREE.LineSegments(G.lin, lineMat(pl.color)); l.userData.k = pl.color; lines.push(l); }
    } else {
      for (const s of procGeoms(pl.part)) {
        const m = new THREE.Mesh(s.g, mat(pl.color)); m.userData.k = pl.color; meshes.push(m);
        if (s.e) { const l = new THREE.LineSegments(s.e, lineMat(pl.color)); l.userData.k = pl.color; lines.push(l); }
      }
    }
    meshes.forEach((m) => { m.castShadow = true; m.userData.pl = pl; obj.add(m); });
    lines.forEach((l) => obj.add(l));
    root.add(obj);
    nodes.push({ obj, pl, meshes, lines });
  }
  const n = P.list.length;
  const chip = $('#mode');
  if (hqCount === n) { chip.textContent = 'Rendu fidèle'; chip.className = 'chip ok'; }
  else if (hqCount > 0) { chip.textContent = `Rendu fidèle : ${hqCount}/${n} pièces (le reste approximé)`; chip.className = 'chip warn'; }
  else { chip.textContent = 'Aperçu simplifié — charge la bibliothèque LDraw pour le rendu fidèle'; chip.className = 'chip warn'; }
  fitGround(); applyEdges(); setView('iso'); updateStep();
  const miss = [...missing].map((n) => n.replace(/\.dat$/, ''));
  $('#missStat').textContent = miss.length ? `Fichiers LDraw encore manquants (${miss.length}) : ${miss.slice(0, 40).join(', ')}${miss.length > 40 ? '…' : ''}` : '';
}

let bbox = new THREE.Box3();
function fitGround() {
  root.updateMatrixWorld(true);
  bbox = new THREE.Box3().setFromObject(root);
  const size = bbox.getSize(new THREE.Vector3()), ctr = bbox.getCenter(new THREE.Vector3());
  const r = Math.max(size.x, size.y, size.z);
  ground.position.set(ctr.x, bbox.min.y - 0.5, ctr.z); ground.scale.set(r * 6, r * 6, 1);
  sun.position.set(ctr.x + r * 0.6, ctr.y + r * 2, ctr.z + r * 0.9); sun.target.position.copy(ctr);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -r * 1.2; sc.right = sc.top = r * 1.2; sc.near = 1; sc.far = r * 5; sc.updateProjectionMatrix();
  fill.position.set(ctr.x - r, ctr.y + r * 0.3, ctr.z - r);
}

function setView(v) {
  tween = null;
  const ctr = bbox.getCenter(new THREE.Vector3()), size = bbox.getSize(new THREE.Vector3());
  const r = size.length() / 2 || 100;
  const dirs = { iso: [1, 0.75, 1.15], front: [0, 0.15, 1], side: [1, 0.15, 0], back: [0, 0.15, -1], top: [0.001, 1, 0.001] };
  const d = new THREE.Vector3(...dirs[v]).normalize();
  const dist = r / Math.sin((camera.fov * Math.PI) / 360) * 1.05;
  camera.position.copy(ctr).addScaledVector(d, dist);
  camera.near = dist / 100; camera.far = dist * 20; camera.updateProjectionMatrix();
  controls.target.copy(ctr); controls.update();
}

// ---------- Angles de la notice Studio ----------
let stepCams = null, tween = null;
function studioCam(c) {
  const T = new THREE.Vector3(c.t[0], -c.t[1], c.t[2]);
  const p = c.ca[0], y = c.ca[1];
  const D = new THREE.Vector3(-Math.cos(p) * Math.sin(y), -Math.sin(p), Math.cos(p) * Math.cos(y)).normalize();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-c.ma[0], c.ma[1], -c.ma[2], 'ZXY'));
  D.applyQuaternion(q.invert());
  const hgt = (c.s || 170) * 2.3, dist = hgt / 2 / Math.tan((camera.fov * Math.PI) / 360);
  return { pos: T.clone().addScaledVector(D, dist), tgt: T };
}
function flyTo(pos, tgt) { tween = { p0: camera.position.clone(), t0: controls.target.clone(), pos, tgt, st: performance.now() }; }
function stepTween() {
  if (!tween) return;
  const k = Math.min(1, (performance.now() - tween.st) / 550), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  camera.position.lerpVectors(tween.p0, tween.pos, e); controls.target.lerpVectors(tween.t0, tween.tgt, e);
  if (k >= 1) tween = null;
}
controls.addEventListener('start', () => (tween = null));
function setStepCams(c) {
  stepCams = c && c.length ? c : null;
  $('#camRow').style.display = stepCams ? '' : 'none';
}

// ---------- Étapes ----------
function updateStep() {
  const N = P.nSteps;
  const s = allMode ? N - 1 : cur;
  const hi = $('#ckHi').checked && !allMode;
  for (const n of nodes) {
    n.obj.visible = n.pl.step <= s;
    const dim = hi && n.pl.step < s;
    n.meshes.forEach((m) => (m.material = mat(m.userData.k, dim)));
    n.lines.forEach((l) => (l.material = lineMat(l.userData.k, dim)));
  }
  $('#slider').max = N; $('#slider').value = s + 1;
  if (!allMode && stepCams && $('#ckCam').checked && stepCams[s]) { const v = studioCam(stepCams[s]); flyTo(v.pos, v.tgt); }
  $('#stepnum').textContent = allMode ? 'Modèle complet' : `Étape ${s + 1} / ${N}`;
  $('#bAll').classList.toggle('on', allMode);
  const items = P.list.filter((p) => (allMode ? true : p.step === s));
  $('#stepList').innerHTML = groupHTML(items) || '<li style="cursor:default;color:#6b7385">Aucune pièce dans cette étape.</li>';
  document.querySelector('#p-step h3').textContent = allMode ? 'Toutes les pièces' : 'Pièces à ajouter';
}
function groupHTML(items) {
  const g = new Map();
  for (const p of items) { const k = p.part + '|' + p.color; g.set(k, (g.get(k) || 0) + 1); }
  return [...g].sort((a, b) => b[1] - a[1]).map(([k, q]) => {
    const [part, col] = k.split('|'); const [cn, hex] = colorInfo(col);
    return `<li><span class="sw" style="background:${hex}"></span><span class="nm">${esc(partName(part))}<small>${esc(cn)} · réf. ${esc(idOf(part))}</small></span><span class="qty">×${q}</span></li>`;
  }).join('');
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function updateInventory() {
  $('#invList').innerHTML = groupHTML(P.list);
  $('#sTot').textContent = P.list.length;
  $('#sRef').textContent = new Set(P.list.map((p) => p.part + '|' + p.color)).size;
  $('#sSteps').textContent = P.nSteps;
}

// Primitives LDraw simples générées si absentes (cylindres, bords, disques, anneaux)
function genPrimitive(n) {
  const m = n.match(/^(\d+)-(\d+)(cyli|edge|disc|cylo|ring(\d+))\.dat$/); if (!m) return null;
  const segs = Math.max(1, Math.round((16 * m[1]) / m[2])), L = ['0 primitive générée ' + n];
  const P = (i) => { const a = (i * 2 * Math.PI) / 16; return [Math.cos(a).toFixed(5), Math.sin(a).toFixed(5)]; };
  for (let i = 0; i < segs; i++) {
    const [c0, s0] = P(i), [c1, s1] = P(i + 1);
    if (m[3] === 'cyli' || m[3] === 'cylo') L.push(`4 16 ${c0} 1 ${s0} ${c1} 1 ${s1} ${c1} 0 ${s1} ${c0} 0 ${s0}`);
    if (m[3] === 'edge' || m[3] === 'cylo') L.push(`2 24 ${c0} 0 ${s0} ${c1} 0 ${s1}`);
    if (m[3] === 'cylo') L.push(`2 24 ${c0} 1 ${s0} ${c1} 1 ${s1}`);
    if (m[3] === 'disc') L.push(`3 16 0 0 0 ${c0} 0 ${s0} ${c1} 0 ${s1}`);
    if (m[4]) { const a = +m[4], b = a + 1; L.push(`4 16 ${c0 * a} 0 ${s0 * a} ${c1 * a} 0 ${s1 * a} ${c1 * b} 0 ${s1 * b} ${c0 * b} 0 ${s0 * b}`); }
  }
  return L.join('\n');
}

// ---------- Fichier Studio .io : modèle + pièces 3D + angles de la notice ----------
async function parseIo(file) {
  const zip = await IoZip.open(await file.arrayBuffer());
  const n2 = ['model2.ldr', 'modelv2.ldr', 'model.ldr'].find((n) => zip.has(n));
  if (!n2) throw new Error('fichier .io sans modèle');
  const txt = (await zip.text(n2)).replace(/^\uFEFF/, '');
  const m = LDCore.splitModel(txt);
  const models = [], fresh = [];
  for (const [name, body] of m.files) {
    if (name === m.main || /^\s*0\s+IsSubModel\s+True/im.test(body) || name === '__main__') models.push([name, body]);
    else { cache.set(name, body); fresh.push([name, body]); }
  }
  putCache(fresh);
  const modelText = models.length === 1 && models[0][0] === '__main__' ? models[0][1]
    : models.map(([n, b]) => `0 FILE ${n}\n${b}`).join('\n');
  let cams = null;
  if (zip.has('model.ins')) { try { cams = parseIns(await zip.text('model.ins')); } catch (e) {} }
  return { modelText, cams, nParts: fresh.length };
}
function parseIns(xml) {
  const doc = new DOMParser().parseFromString(xml.replace(/^\uFEFF/, ''), 'application/xml');
  const cams = [];
  const num = (s) => (s || '').trim().split(/\s+/).map(Number);
  doc.querySelectorAll('Step').forEach((st) => {
    const i = Number(st.getAttribute('SerializedIndex')); const pv = st.querySelector('StepPreview');
    if (!pv || Number.isNaN(i)) return;
    const g = (k) => pv.getAttribute(k) || pv.getAttribute('DefaultCameraControlInfo_' + k);
    const t = num(g('TargetPos')), ma = num(g('modelAngle')), ca = num(g('cameraAngle')), s = Number(g('cameraScale')) || 170;
    if (t.length === 3 && ma.length === 3 && ca.length === 2) cams[i] = { t, ma, ca, s };
  });
  return cams.length ? Array.from(cams, (c) => c || null) : null;
}

// ---------- Chargement d'un modèle ----------
async function loadModel(text, fname) {
  model = LDCore.splitModel(text);
  P = LDCore.placements(model);
  if (!P.list.length) { alertMsg('Aucune pièce trouvée dans ce fichier.'); return; }
  const nm = (text.match(/^\s*0\s+Name:\s*(.+)$/im) || [])[1];
  $('#mtitle').textContent = (nm && nm.trim().replace(/\.(ldr|mpd)$/i, '')) || (fname || '').replace(/\.(ldr|mpd)$/i, '') || 'Modèle';
  allMode = true; cur = P.nSteps - 1;
  updateInventory();
  await tryHQ();
  buildScene();
}
let toastT = null;
function alertMsg(t, ms) {
  const c = $('#toast'); c.textContent = t; c.classList.add('on');
  clearTimeout(toastT); if (ms !== 0) toastT = setTimeout(() => c.classList.remove('on'), ms || 6000);
}

// ---------- Bibliothèque LDraw + cache navigateur ----------
let lib = null; // { idx, read(path) }
const cache = new Map();
let db = null;
function idb() {
  return new Promise((res) => {
    try {
      const r = indexedDB.open('etk-lego-ldraw', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => res(r.result); r.onerror = () => res(null);
    } catch (e) { res(null); }
  });
}
async function loadCache() {
  db = await idb(); if (!db) return;
  await new Promise((res) => {
    try {
      const tx = db.transaction('files'), st = tx.objectStore('files');
      const kq = st.getAllKeys(), vq = st.getAll();
      tx.oncomplete = () => { kq.result.forEach((k, i) => cache.set(k, vq.result[i])); res(); };
      tx.onerror = () => res();
    } catch (e) { res(); }
  });
  if (cache.has('__ldconfig')) Object.assign(COLORS, LDCore.parseLDConfig(cache.get('__ldconfig')));
}
function putCache(entries) {
  if (!db || !entries.length) return;
  try { const tx = db.transaction('files', 'readwrite'), st = tx.objectStore('files'); for (const [k, v] of entries) st.put(v, k); } catch (e) {}
}

async function tryHQ() {
  const parts = [...new Set(P.list.map((p) => p.part))];
  const fresh = [];
  const read = async (name) => {
    const cands = [name], lo = name.replace(/^(48|8)\//, '');
    if (lo !== name) cands.push(lo);
    const mm = name.match(/^(.*?\d+)([a-z]|c\d\d)\.dat$/); if (mm) cands.push(mm[1] + '.dat');
    for (const c of cands) if (cache.has(c)) { const v = cache.get(c); if (c !== name) cache.set(name, v); return v; }
    if (lib) for (const c of cands) {
      const path = LDCore.lookup(lib.idx, c);
      if (path) { try { const v = await lib.read(path); cache.set(name, v); fresh.push([name, v]); return v; } catch (e) {} }
    }
    const g = genPrimitive(lo); if (g) { cache.set(name, g); return g; }
    return null;
  };
  const before = parsedLib.size;
  await LDCore.gather(parts.filter((p) => !parsedLib.has(p)), read, parsedLib, (d, t) => {
    $('#libBar').style.width = Math.round((d / t) * 100) + '%';
    $('#libStat').textContent = `Lecture des pièces : ${d} / ${t} fichiers`;
  });
  for (const p of parts) if (parsedLib.has(p) && parsedLib.get(p).title) libDesc.set(p, parsedLib.get(p).title);
  putCache(fresh);
  const ok = parts.filter((p) => parsedLib.has(p)).length;
  $('#libBar').style.width = '100%';
  $('#libStat').textContent = lib || ok ? `${ok} / ${parts.length} références trouvées${lib ? '' : ' (depuis le cache du navigateur)'}` +
    (ok < parts.length ? ' — manquantes : ' + parts.filter((p) => !parsedLib.has(p)).map(idOf).slice(0, 8).join(', ') : '') : '';
  if (parsedLib.size !== before) { flatMemo.clear(); hqMemo.clear(); }
}

let claudeReady = null;
const waitClaude = () => claudeReady || (claudeReady = new Promise((res) => {
  const t0 = Date.now();
  (function chk() { if (window.claude && typeof window.claude.use === 'function') return res(true); if (Date.now() - t0 > 12000) return res(false); setTimeout(chk, 100); })();
}));
const useCap = async (n) => { try { if (!(await waitClaude())) return null; return await window.claude.use(n); } catch (e) { return null; } };
// ---------- Pack des pièces (pour partager le rendu fidèle) ----------
function buildPack() {
  const files = {};
  for (const n of neededFiles()) if (cache.has(n)) files[n] = cache.get(n);
  const pack = { format: 'etk-ldraw-pack-1', model: $('#mtitle').textContent, files };
  if (cache.has('__ldconfig')) pack.ldconfig = cache.get('__ldconfig');
  return JSON.stringify(pack);
}
function loadPack(obj) {
  if (!obj || !obj.files) return 0;
  for (const [k, v] of Object.entries(obj.files)) cache.set(k, v);
  if (obj.ldconfig) { cache.set('__ldconfig', obj.ldconfig); Object.assign(COLORS, LDCore.parseLDConfig(obj.ldconfig)); }
  return Object.keys(obj.files).length;
}
$('#bPackUp').onclick = async () => {
  const msg = $('#packMsg'); msg.style.color = ''; msg.textContent = 'Préparation…';
  try {
    const assets = await useCap('assets');
    if (!assets) { msg.textContent = 'Enregistrement indisponible ici : utilise « Télécharger le pack ».'; return; }
    const json = buildPack();
    const r = await assets.upload(new Blob([json], { type: 'application/json' }));
    msg.style.color = 'var(--ok)';
    msg.textContent = `Pack enregistré ✓ (${(json.length / 1048576).toFixed(1)} Mo). Dis maintenant à Claude : « pack enregistré ».`;
  } catch (e) { msg.style.color = '#b00'; msg.textContent = 'Échec : ' + (e && e.message || e); }
};
$('#bPackDl').onclick = async () => {
  const msg = $('#packMsg'); msg.style.color = '';
  try {
    const dl = await useCap('downloads');
    if (!dl) { msg.textContent = 'Téléchargement indisponible ici.'; return; }
    await dl.save({ filename: ($('#mtitle').textContent || 'modele') + '-pieces.json', data: new Blob([buildPack()], { type: 'application/json' }) });
  } catch (e) { msg.textContent = 'Téléchargement annulé.'; }
};

async function setLibrary(idx, read, label) {
  lib = { idx, read };
  const cfg = LDCore.lookup(idx, 'ldconfig.ldr');
  if (cfg) { try { const t = await read(cfg); Object.assign(COLORS, LDCore.parseLDConfig(t)); mats.clear(); lineMats.clear(); putCache([['__ldconfig', t]]); } catch (e) {} }
  $('#libNote').innerHTML = `Bibliothèque chargée : <b>${esc(label)}</b> (${idx.size ? 'OK' : 'vide'}). Les pièces utilisées sont gardées dans ce navigateur pour les prochaines fois.`;
  if (P) { await tryHQ(); buildScene(); }
}
async function openZip(file) {
  $('#libStat').textContent = 'Ouverture du zip…';
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const idx = LDCore.libraryIndex(names);
  await setLibrary(idx, (p) => zip.file(p).async('string'), file.name);
}
async function openDir(files) {
  const map = new Map();
  for (const f of files) map.set(f.webkitRelativePath || f.name, f);
  const idx = LDCore.libraryIndex([...map.keys()]);
  await setLibrary(idx, (p) => map.get(p).text(), 'dossier ' + ((files[0] && (files[0].webkitRelativePath || '').split('/')[0]) || 'ldraw'));
}

// ---------- Interface ----------
document.querySelectorAll('.tabs button').forEach((b) => b.onclick = () => {
  document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b));
  document.querySelectorAll('.pane').forEach((p) => p.classList.toggle('on', p.id === 'p-' + b.dataset.t));
});
document.querySelectorAll('[data-v]').forEach((b) => b.onclick = () => setView(b.dataset.v));
let spin = false;
$('#bSpin').onclick = () => { spin = !spin; controls.autoRotate = spin; controls.autoRotateSpeed = 2.2; $('#bSpin').classList.toggle('on', spin); };
const go = (s) => { allMode = false; cur = Math.max(0, Math.min(P.nSteps - 1, s)); updateStep(); };
$('#bFirst').onclick = () => go(0);
$('#bPrev').onclick = () => go((allMode ? P.nSteps - 1 : cur) - 1);
$('#bNext').onclick = () => { if (!allMode) go(cur + 1); };
$('#slider').oninput = (e) => go(Number(e.target.value) - 1);
$('#bAll').onclick = () => { allMode = true; stopPlay(); updateStep(); };
$('#ckHi').onchange = updateStep;
$('#ckCam').onchange = updateStep;
let timer = null;
function stopPlay() { clearInterval(timer); timer = null; $('#bPlay').textContent = '▶ Lecture'; }
$('#bPlay').onclick = () => {
  if (timer) return stopPlay();
  if (allMode || cur >= P.nSteps - 1) go(0);
  $('#bPlay').textContent = '⏸ Pause';
  timer = setInterval(() => { if (cur >= P.nSteps - 1) { stopPlay(); return; } go(cur + 1); }, 1100);
};
$('#ckEdge').onchange = applyEdges;
function applyEdges() { const on = $('#ckEdge').checked; nodes.forEach((n) => n.lines.forEach((l) => (l.visible = on))); }
$('#ckGround').onchange = () => (ground.visible = $('#ckGround').checked);
let bg = '#ffffff';
function applyBg() { if (bg === 'transparent') { scene.background = null; renderer.setClearColor(0x000000, 0); canvas.style.background = 'repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/16px 16px'; } else { scene.background = new THREE.Color(bg); canvas.style.background = ''; } }
document.querySelectorAll('#bgs button').forEach((b) => b.onclick = () => {
  document.querySelectorAll('#bgs button').forEach((x) => x.classList.toggle('on', x === b)); bg = b.dataset.bg; applyBg();
});
$('#bCopyInv').onclick = async () => {
  const g = new Map(); for (const p of P.list) { const k = p.part + '|' + p.color; g.set(k, (g.get(k) || 0) + 1); }
  const txt = [...g].map(([k, q]) => { const [part, col] = k.split('|'); return `${q}\t${idOf(part)}\t${partName(part)}\t${colorInfo(col)[0]}`; }).join('\n');
  try { await navigator.clipboard.writeText('Qté\tRéf.\tPièce\tCouleur\n' + txt); $('#bCopyInv').textContent = 'Copiée ✓'; } catch (e) { $('#bCopyInv').textContent = 'Copie refusée'; }
  setTimeout(() => ($('#bCopyInv').textContent = 'Copier la liste'), 2000);
};

$('#bOpen').onclick = () => $('#fModel').click();
$('#bZip').onclick = () => $('#fZip').click();
$('#bDir').onclick = () => $('#fDir').click();
const cleanName = (n) => n.replace(/\.(io|ldr|mpd)$/i, '').replace(/[_ -]?copy$/i, '').replace(/_/g, ' ').trim();
async function openAnyModel(f) {
  if (/\.io$/i.test(f.name)) {
    try { alertMsg('Lecture de ' + f.name + '…', 0); const io = await parseIo(f); await startDraft(io.modelText, cleanName(f.name), io.cams); alertMsg('Modèle chargé ✓', 2000); }
    catch (er) { alertMsg('Impossible de lire ' + f.name + ' : ' + er.message, 10000); }
  } else startDraft(await f.text(), f.name, null);
}
$('#fModel').onchange = async (e) => {
  const fs = [...e.target.files]; e.target.value = '';
  if (fs.length > 1) batchImport(fs); else if (fs[0]) openAnyModel(fs[0]);
};
$('#fZip').onchange = (e) => { const f = e.target.files[0]; if (f) openZip(f).catch((er) => ($('#libStat').textContent = 'Zip illisible : ' + er.message)); e.target.value = ''; };
$('#fDir').onchange = (e) => { if (e.target.files.length) openDir([...e.target.files]); e.target.value = ''; };
const stage = $('#stage');
stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('drag'); });
stage.addEventListener('dragleave', () => stage.classList.remove('drag'));
stage.addEventListener('drop', async (e) => {
  e.preventDefault(); stage.classList.remove('drag');
  const f = e.dataTransfer.files[0]; if (!f) return;
  if (/\.zip$/i.test(f.name)) openZip(f).catch((er) => alertMsg('Zip illisible : ' + er.message));
  else openAnyModel(f);
});

const galEl = $('#gallery');
galEl.addEventListener('dragover', (e) => { e.preventDefault(); });
galEl.addEventListener('drop', (e) => {
  e.preventDefault();
  const fs = [...e.dataTransfer.files].filter((f) => /\.(io|ldr|mpd)$/i.test(f.name));
  if (fs.length > 1) batchImport(fs); else if (fs[0]) openAnyModel(fs[0]);
});

// Survol : nom de la pièce
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), tip = $('#tip');
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || e.buttons) { tip.style.display = 'none'; return; }
  const r = canvas.getBoundingClientRect();
  mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const vis = []; nodes.forEach((n) => { if (n.obj.visible) vis.push(...n.meshes); });
  const hit = ray.intersectObjects(vis, false)[0];
  if (!hit) { tip.style.display = 'none'; return; }
  const pl = hit.object.userData.pl;
  tip.textContent = `${partName(pl.part)} — ${colorInfo(pl.color)[0]} · étape ${pl.step + 1}`;
  tip.style.left = e.clientX - r.left + 14 + 'px'; tip.style.top = e.clientY - r.top + 14 + 'px'; tip.style.display = 'block';
});
canvas.addEventListener('pointerleave', () => (tip.style.display = 'none'));

// Capture
$('#bShot').onclick = () => {
  const k = Number($('#selRes').value), pr = renderer.getPixelRatio();
  const hideTip = tip.style.display; tip.style.display = 'none';
  renderer.setPixelRatio(k === 1 ? pr : k);
  resize(true); renderer.render(scene, camera);
  const url = canvas.toDataURL('image/png');
  renderer.setPixelRatio(pr); resize(true); tip.style.display = hideTip;
  $('#shot').src = url; $('#copyMsg').textContent = ''; $('#modal').classList.add('on');
};
$('#bSaveImg').onclick = async () => {
  const m = $('#copyMsg');
  try { const dl = await useCap('downloads'); if (!dl) { m.textContent = 'Téléchargement indisponible ici : clic droit → Enregistrer l\'image.'; return; }
    const blob = dataURLToBlob($('#shot').src);
    await dl.save({ filename: ($('#mtitle').textContent || 'modele') + '.png', data: blob }); m.textContent = 'Image enregistrée ✓';
  } catch (e) { m.textContent = e && e.code === 'declined' ? '' : 'Enregistrement impossible : clic droit → Enregistrer l\'image.'; }
};
$('#bClose').onclick = () => $('#modal').classList.remove('on');
$('#modal').onclick = (e) => { if (e.target.id === 'modal') $('#modal').classList.remove('on'); };
$('#bCopyImg').onclick = async () => {
  try { const blob = dataURLToBlob($('#shot').src); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); $('#copyMsg').textContent = 'Image copiée ✓'; }
  catch (e) { $('#copyMsg').textContent = 'Copie impossible ici : utilise clic droit → Enregistrer l\'image.'; }
};

function resize(force) {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!force && canvas.width === Math.floor(w * renderer.getPixelRatio()) && canvas.height === Math.floor(h * renderer.getPixelRatio())) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', () => resize(true));
window.addEventListener('keydown', (e) => {
  if (!P || e.target.tagName === 'INPUT' && e.target.type !== 'range') return;
  if (e.key === 'ArrowRight') $('#bNext').onclick(); if (e.key === 'ArrowLeft') $('#bPrev').onclick();
});
function loop() { requestAnimationFrame(loop); if (document.body.classList.contains('gal')) return; if (anim) { animFrame(performance.now()); renderer.render(scene, camera); return; } resize(false); stepTween(); controls.update(); renderer.render(scene, camera); }

function dataURLToBlob(url) {
  const [head, b64] = url.split(','), bin = atob(b64), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: (head.match(/data:([^;]+)/) || [])[1] || 'image/png' });
}
// ---------- Illustration ----------
const IL = { color: 'orange', style: 'tenons', fmt: '1080x1080' };
const PAL = { orange: ['#FFB547', '#FF7A1A', '#ffffff', 'rgba(120,40,0,.35)'], ciel: ['#D6F1FF', '#6EC3F0', '#0E3557', 'rgba(255,255,255,.6)'] };
function renderRobot(S) {
  // rendu 3D carré, fond transparent, cadré sur le modèle dans l'angle actuel
  const pr = renderer.getPixelRatio(), camPos = camera.position.clone(), tgt = controls.target.clone(), aspect = camera.aspect;
  const vis = new THREE.Box3(); root.updateMatrixWorld(true);
  nodes.forEach((n) => { if (n.obj.visible) vis.expandByObject(n.obj); });
  const box = vis.isEmpty() ? bbox : vis;
  const ctr = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2 || 100;
  const dir = camPos.clone().sub(tgt).normalize();
  camera.aspect = 1; camera.position.copy(ctr).addScaledVector(dir, r / Math.sin((camera.fov * Math.PI) / 360) * 1.02);
  camera.lookAt(ctr); camera.updateProjectionMatrix();
  const gv = ground.visible; ground.visible = $('#iShadow').checked;
  scene.background = null; renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1); renderer.setSize(S, S, false); renderer.render(scene, camera);
  const out = document.createElement('canvas'); out.width = out.height = S; out.getContext('2d').drawImage(canvas, 0, 0, S, S);
  ground.visible = gv; renderer.setPixelRatio(pr); applyBg();
  camera.position.copy(camPos); camera.aspect = aspect; controls.target.copy(tgt); camera.updateProjectionMatrix(); controls.update(); resize(true);
  return out;
}
function drawIllustration() {
  const [W, H] = IL.fmt.split('x').map(Number), [c1, c2, ink, dots] = PAL[IL.color];
  const cv = $('#illuCv'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  if (IL.style === 'uni') g.fillStyle = c2;
  else { const gr = g.createLinearGradient(0, 0, W * 0.6, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; }
  g.fillRect(0, 0, W, H);
  if (IL.style === 'tenons') {
    const step = Math.round(Math.min(W, H) / 9), rad = step * 0.3;
    for (let y = step / 2; y < H + step; y += step) for (let x = step / 2; x < W + step; x += step) {
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fillStyle = dots; g.globalAlpha = 0.35; g.fill();
      g.beginPath(); g.arc(x - rad * 0.12, y - rad * 0.12, rad * 0.78, 0, Math.PI * 2); g.globalAlpha = 0.18; g.fillStyle = '#fff'; g.fill();
    }
    g.globalAlpha = 1;
  }
  // halo derrière le robot
  const txt = $('#iTxt').checked, title = $('#iTitle').value.trim(), sub = $('#iSub').value.trim();
  const textH = txt && (title || sub) ? Math.min(W, H) * 0.2 : 0;
  const S = Math.round(Math.min(W * 0.92, (H - textH) * 0.92));
  const cx = W / 2, cy = (H - textH) / 2 + (textH ? Math.min(W, H) * 0.02 : 0);
  const halo = g.createRadialGradient(cx, cy, S * 0.05, cx, cy, S * 0.55);
  halo.addColorStop(0, 'rgba(255,255,255,.55)'); halo.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = halo; g.fillRect(0, 0, W, H);
  g.drawImage(renderRobot(S), cx - S / 2, cy - S / 2, S, S);
  if (textH) {
    const base = Math.min(W, H);
    g.textAlign = 'center'; g.fillStyle = ink;
    g.shadowColor = IL.color === 'orange' ? 'rgba(90,30,0,.35)' : 'rgba(255,255,255,.6)'; g.shadowBlur = base * 0.012; g.shadowOffsetY = base * 0.004;
    let y = H - textH + base * 0.075;
    if (title) { g.font = `800 ${Math.round(base * 0.085)}px Nunito, sans-serif`; g.fillText(title, W / 2, y, W * 0.9); y += base * 0.075; }
    if (sub) { g.font = `700 ${Math.round(base * 0.042)}px Nunito, sans-serif`; g.globalAlpha = 0.9; g.fillText(sub, W / 2, y, W * 0.9); g.globalAlpha = 1; }
    g.shadowColor = 'transparent';
  }
}
$('#bIllu').onclick = async () => {
  if (!P) return;
  if (!$('#iTitle').dataset.touched) $('#iTitle').value = $('#mtitle').textContent;
  $('#iMsg').textContent = ''; $('#illu').classList.add('on');
  try { await document.fonts.load('800 40px Nunito'); } catch (e) {}
  drawIllustration();
};
$('#iTitle').oninput = () => { $('#iTitle').dataset.touched = '1'; drawIllustration(); };
['#iSub', '#iTxt', '#iShadow'].forEach((s) => ($(s).oninput = drawIllustration));
document.querySelectorAll('[data-ic]').forEach((b) => b.onclick = () => { IL.color = b.dataset.ic; document.querySelectorAll('[data-ic]').forEach((x) => x.classList.toggle('on', x === b)); drawIllustration(); });
document.querySelectorAll('[data-is]').forEach((b) => b.onclick = () => { IL.style = b.dataset.is; document.querySelectorAll('[data-is]').forEach((x) => x.classList.toggle('on', x === b)); drawIllustration(); });
document.querySelectorAll('[data-if]').forEach((b) => b.onclick = () => { IL.fmt = b.dataset.if; document.querySelectorAll('[data-if]').forEach((x) => x.classList.toggle('on', x === b)); drawIllustration(); });
$('#iClose').onclick = () => $('#illu').classList.remove('on');
$('#illu').onclick = (e) => { if (e.target.id === 'illu') $('#illu').classList.remove('on'); };
const illuBlob = () => new Promise((r) => $('#illuCv').toBlob(r, 'image/png'));
$('#iSave').onclick = async () => {
  const m = $('#iMsg');
  try { const dl = await useCap('downloads'); if (!dl) { m.textContent = 'Téléchargement indisponible ici : clic droit sur l\'image → Enregistrer.'; return; }
    await dl.save({ filename: `${slugify($('#iTitle').value || 'robot')}-${IL.color}.png`, data: await illuBlob() }); m.textContent = 'Image enregistrée ✓';
  } catch (e) { m.textContent = e && e.code === 'declined' ? '' : 'Enregistrement impossible : clic droit sur l\'image → Enregistrer.'; }
};
$('#iCopy').onclick = async () => {
  try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': await illuBlob() })]); $('#iMsg').textContent = 'Image copiée ✓'; }
  catch (e) { $('#iMsg').textContent = 'Copie impossible ici : utilise Télécharger.'; }
};

// ---------- Vidéo de montage ----------
const VD = { speed: 0.35, bg: '#FFA640', fmt: '1280x720' };
let anim = null, vidBlob = null, vidUrl = null;
const easeBounce = (x) => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
function vidPlan() {
  const sd = VD.speed, fall = Math.max(0.35, sd * 1.5), stag = Math.min(0.08, sd / 4);
  return { sd, fall, stag, build: P.nSteps * sd + fall + 0.3, end: $('#vEnd').checked ? 3.2 : 0.8 };
}
function updateVidInfo() { if (!P) return; const p = vidPlan(); $('#vInfo').textContent = `${P.nSteps} étapes · durée ≈ ${Math.round(p.build + p.end)} s`; }
function startAnim(record) {
  if (!P || anim) return;
  stopPlay(); tween = null; $('#tip').style.display = 'none';
  const plan = vidPlan(), [W, H] = VD.fmt.split('x').map(Number);
  // ordre des pièces dans chaque étape
  const perStep = {};
  nodes.forEach((n) => { n.base = n.obj.matrix.clone(); n.k = (perStep[n.pl.step] = (perStep[n.pl.step] || 0) + 1) - 1;
    n.meshes.forEach((m) => (m.material = mat(m.userData.k))); n.lines.forEach((l) => (l.material = lineMat(l.userData.k))); n.obj.visible = false; });
  // cadrage sur le robot complet
  const ctr = bbox.getCenter(new THREE.Vector3()), size = bbox.getSize(new THREE.Vector3()), rad = size.length() / 2;
  const saved = { pos: camera.position.clone(), tgt: controls.target.clone(), aspect: camera.aspect, pr: renderer.getPixelRatio() };
  const dir = camera.position.clone().sub(controls.target); const a0 = Math.atan2(dir.x, dir.z);
  const drop = size.y * 1.6 + 200;
  if (record) { renderer.setPixelRatio(1); renderer.setSize(W, H, false); camera.aspect = W / H; }
  else { camera.aspect = stage.clientWidth / stage.clientHeight; }
  camera.updateProjectionMatrix();
  const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect), fit = Math.min(vf, hf);
  const dist = rad / Math.sin(fit / 2) * 1.02;
  if (VD.bg !== 'cur') scene.background = new THREE.Color(VD.bg);
  else if (bg === 'transparent') scene.background = new THREE.Color('#ffffff');
  anim = { t0: performance.now() + 250, plan, ctr, dist, a0, drop, saved, record, rec: null, chunks: [], bounce: $('#vBounce').checked };
  if (record) {
    const types = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mime = types.find((x) => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
    if (!mime) { endAnim(false); $('#vMsg').textContent = 'Ce navigateur ne sait pas enregistrer de vidéo : essaie Chrome ou Edge.'; return; }
    const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: mime, videoBitsPerSecond: 8e6 });
    const chunks = anim.chunks;
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    anim.rec = rec; anim.mime = mime; rec.start(250);
  }
  $('#vid').classList.add('on', 'running'); $('#vidDot').style.display = record ? '' : 'none';
}
function animFrame(now) {
  const A = anim, p = A.plan, t = (now - A.t0) / 1000;
  for (const n of nodes) {
    const start = n.pl.step * p.sd + n.k * p.stag, q = (t - start) / p.fall;
    if (q < 0) { n.obj.visible = false; continue; }
    n.obj.visible = true; n.obj.matrix.copy(n.base);
    if (q < 1) n.obj.matrix.elements[13] -= A.drop * (1 - (A.bounce ? easeBounce(q) : 1 - Math.pow(1 - q, 3)));
  }
  const ang = A.a0 + ($('#vSpin').checked ? Math.max(0, t) * 0.32 : 0) + (t > p.build ? (t - p.build) * 1.6 : 0) * ($('#vEnd').checked ? 1 : 0);
  camera.position.set(A.ctr.x + Math.sin(ang) * A.dist * 0.9, A.ctr.y + A.dist * 0.42, A.ctr.z + Math.cos(ang) * A.dist * 0.9);
  camera.lookAt(A.ctr);
  const done = Math.min(P.nSteps, Math.max(0, Math.floor(t / p.sd) + 1));
  $('#vidTxt').textContent = (A.record ? 'Enregistrement · ' : 'Aperçu · ') + `étape ${done} / ${P.nSteps}`;
  if (t > p.build + p.end) endAnim(true);
}
function endAnim(ok) {
  const A = anim; if (!A) return;
  anim = null;
  nodes.forEach((n) => { if (n.base) n.obj.matrix.copy(n.base); });
  renderer.setPixelRatio(A.saved.pr); applyBg(); resize(true);
  camera.position.copy(A.saved.pos); controls.target.copy(A.saved.tgt); camera.updateProjectionMatrix(); controls.update();
  allMode = true; updateStep();
  $('#vid').classList.remove('running');
  if (A.rec) {
    A.rec.onstop = () => {
      if (!ok) return;
      vidBlob = new Blob(A.chunks, { type: A.mime.split(';')[0] });
      if (vidUrl) URL.revokeObjectURL(vidUrl);
      vidUrl = URL.createObjectURL(vidBlob);
      const v = $('#vVideo'); v.src = vidUrl; v.style.display = 'block'; $('#vDlRow').style.display = 'flex';
      $('#vMsg').textContent = `${(vidBlob.size / 1048576).toFixed(1)} Mo · ${vidBlob.type.includes('mp4') ? 'MP4' : 'WebM'}`;
    };
    try { A.rec.stop(); } catch (e) {}
  }
}
$('#bVid').onclick = () => { if (!P) return; updateVidInfo(); $('#vid').classList.add('on'); };
$('#vClose').onclick = () => { $('#vid').classList.remove('on'); };
$('#vPreview').onclick = () => startAnim(false);
$('#vRec').onclick = () => { $('#vVideo').style.display = 'none'; $('#vDlRow').style.display = 'none'; startAnim(true); };
$('#vStop').onclick = () => endAnim(false);
$('#vEnd').onchange = updateVidInfo;
document.querySelectorAll('[data-vs]').forEach((b) => b.onclick = () => { VD.speed = Number(b.dataset.vs); document.querySelectorAll('[data-vs]').forEach((x) => x.classList.toggle('on', x === b)); updateVidInfo(); });
document.querySelectorAll('[data-vb]').forEach((b) => b.onclick = () => { VD.bg = b.dataset.vb; document.querySelectorAll('[data-vb]').forEach((x) => x.classList.toggle('on', x === b)); });
document.querySelectorAll('[data-vf]').forEach((b) => b.onclick = () => { VD.fmt = b.dataset.vf; document.querySelectorAll('[data-vf]').forEach((x) => x.classList.toggle('on', x === b)); });
$('#vSave').onclick = async () => {
  const m = $('#vMsg'); if (!vidBlob) return;
  try { const dl = await useCap('downloads'); if (!dl) { m.textContent = 'Téléchargement indisponible ici : clic droit sur la vidéo → Enregistrer.'; return; }
    const ext = vidBlob.type.includes('mp4') ? 'mp4' : 'webm';
    await dl.save({ filename: `${slugify($('#mtitle').textContent || 'robot')}-montage.${ext}`, data: vidBlob }); m.textContent = 'Vidéo enregistrée ✓';
  } catch (e) { m.textContent = e && e.code === 'declined' ? '' : 'Enregistrement impossible (' + ((e && e.code) || 'erreur') + ').'; }
};

// ---------- Galerie ----------
let DB = null, USER = null, canEdit = false, robots = null, currentId = null, draft = null, publishForce = false;
function neededFiles() {
  const seen = new Set(), st = [...new Set(P.list.map((p) => p.part))];
  while (st.length) { const n = st.pop(); if (seen.has(n)) continue; seen.add(n); const p = parsedLib.get(n); if (p) for (const r of p.refs) st.push(r.f); }
  return seen;
}
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'robot';
function showGallery() {
  document.body.classList.add('gal'); stopPlay();
  $('#mtitle').textContent = "Les robots EuraTech'Kids"; $('#msub').textContent = "Visionneuse 3D LEGO — EuraTech'Kids";
}
function showViewer() { document.body.classList.remove('gal'); resize(true); }

function renderGallery() {
  const g = $('#grid');
  if (robots === null) return;
  if (!robots.length) { g.innerHTML = `<div class="empty">Aucun robot pour l'instant.${canEdit ? ' Clique sur « Ajouter un robot » pour publier ton premier modèle.' : ''}</div>`; return; }
  g.innerHTML = robots.map((r) => `<a class="card" href="#robot-${esc(r.id)}">
    <div class="th">${r.thumbId ? `<img src="/_blob/${esc(r.thumbId)}" alt="${esc(r.name)}" loading="lazy">` : '<span class="ph">🤖</span>'}</div>
    <div class="bd"><b>${esc(r.name || 'Robot')}</b><span>${r.nParts || '?'} pièces · ${r.nSteps || '?'} étapes</span>${r.desc ? `<p>${esc(r.desc)}</p>` : ''}</div></a>`).join('');
}

async function openRobot(id) {
  let r = robots && robots.find((x) => x.id === id);
  if (currentId === id && P) {
    showViewer();
    $('#adminBox').style.display = $('#bThumb2').style.display = canEdit && DB ? '' : 'none';
    if (r) { $('#mtitle').textContent = r.name || 'Robot'; $('#msub').textContent = r.desc || `${P.list.length} pièces · ${P.nSteps} étapes`; }
    return;
  }
  if (!r && !DB && id === 'minerrobot') r = { id, name: 'MinerRobot', ldr: document.getElementById('defaultModel').textContent, packId: PACKS[0] };
  if (!r) { if (robots === null) return; location.hash = 'galerie'; return; }
  showViewer(); draft = null; $('#draftBar').classList.remove('on');
  $('#mode').textContent = 'Chargement des pièces…'; $('#mode').className = 'chip';
  if (r.packId) { try { const res = await fetch('/_blob/' + r.packId); if (res.ok) loadPack(await res.json()); } catch (e) {} }
  currentId = id; setStepCams(r.cams);
  await loadModel(r.ldr, r.name);
  $('#mtitle').textContent = r.name || 'Robot'; $('#msub').textContent = r.desc || `${P.list.length} pièces · ${P.nSteps} étapes`;
  $('#adminBox').style.display = canEdit && DB ? 'block' : 'none';
  $('#bThumb2').style.display = canEdit && DB ? '' : 'none';
}

async function startDraft(text, fname, cams) {
  showViewer(); currentId = null; publishForce = false;
  $('#bReroll').style.display = 'none';
  draft = { ldr: text, cams: cams || null }; setStepCams(cams);
  if (location.hash !== '#nouveau') history.replaceState(null, '', '#nouveau');
  await loadModel(text, fname);
  $('#adminBox').style.display = 'none'; $('#bThumb2').style.display = 'none';
  $('#dName').value = cleanName(fname || $('#mtitle').textContent); $('#dDesc').value = '';
  $('#draftBar').classList.add('on');
  const miss = P.list.length - hqCount;
  $('#bPublish').style.display = canEdit && DB ? '' : 'none';
  $('#dMsg').style.color = miss ? '#9a5b00' : 'var(--ok)';
  $('#dMsg').textContent = !(canEdit && DB) ? 'Aperçu local : seuls les éditeurs de la page peuvent publier.'
    : miss ? `${miss} pièce(s) en forme simplifiée : charge complete.zip (onglet Rendu) avant de publier.` : 'Toutes les pièces sont en rendu fidèle ✓';
}

async function thumbBlob() {
  // vignette = robot complet, dans l'angle de vue actuel (tourne-le avant de cliquer)
  if (!allMode) { allMode = true; updateStep(); }
  const c = renderRobot(640);
  return dataURLToBlob(c.toDataURL('image/png'));
}

async function publishDraft(name, desc) {
  const assets = await useCap('assets');
  if (!assets || !DB) throw new Error('publication indisponible ici');
  const pack = await assets.upload(new Blob([buildPack()], { type: 'application/json' }));
  const th = await assets.upload(await thumbBlob());
  const id = slugify(name) + '-' + Date.now().toString(36).slice(-4);
  await DB.doc('robots/' + id).set({ name, desc, ldr: draft.ldr, packId: pack.id, thumbId: th.id, cams: draft.cams || null,
    nParts: P.list.length, nSteps: P.nSteps, createdAt: Date.now() });
  return id;
}
$('#bPublish').onclick = async () => {
  const msg = $('#dMsg'), name = $('#dName').value.trim();
  msg.style.color = '#b00';
  if (!draft) return;
  if (!name) { msg.textContent = 'Donne un nom au robot.'; return; }
  if (draft.ldr.length > 200000) { msg.textContent = 'Ce modèle est trop gros pour la galerie (fichier de plus de 200 Ko).'; return; }
  const miss = P.list.length - hqCount;
  if (miss && !publishForce) { publishForce = true; msg.textContent = `${miss} pièce(s) resteront simplifiées. Clique encore pour publier quand même.`; return; }
  $('#bPublish').disabled = true; msg.style.color = ''; msg.textContent = 'Publication…';
  try {
    const id = await publishDraft(name, $('#dDesc').value.trim());
    draft = null; $('#draftBar').classList.remove('on');
    currentId = id; location.hash = 'robot-' + id;
    $('#mtitle').textContent = name; $('#adminBox').style.display = 'block'; $('#bThumb2').style.display = '';
  } catch (e) { msg.style.color = '#b00'; msg.textContent = 'Échec : ' + ((e && (e.message || e.code)) || e); }
  $('#bPublish').disabled = false;
};

// Import de plusieurs robots d'un coup (publication automatique)
async function batchImport(files) {
  if (!(canEdit && DB)) { alertMsg("Seuls les éditeurs de la page peuvent ajouter des robots à la galerie.", 8000); return; }
  const ok = [], bad = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    alertMsg(`Import ${i + 1} / ${files.length} : ${f.name}…`, 0);
    try {
      let text, cams = null;
      if (/\.io$/i.test(f.name)) { const io = await parseIo(f); text = io.modelText; cams = io.cams; } else text = await f.text();
      await startDraft(text, cleanName(f.name), cams);
      if (draft.ldr.length > 200000) throw new Error('fichier trop gros');
      await new Promise((res) => setTimeout(res, 300));
      await publishDraft(cleanName(f.name), '');
      ok.push(f.name);
    } catch (er) { bad.push(f.name + ' (' + ((er && er.message) || er) + ')'); }
  }
  draft = null; $('#draftBar').classList.remove('on'); currentId = null;
  location.hash = 'galerie';
  alertMsg(`${ok.length} robot(s) ajouté(s)` + (bad.length ? ` · échec pour : ${bad.join(', ')}` : ' ✓'), bad.length ? 15000 : 6000);
}
$('#bCancel').onclick = () => { draft = null; $('#draftBar').classList.remove('on'); currentId = null; location.hash = 'galerie'; };
$('#bGallery').onclick = () => { location.hash = 'galerie'; };
$('#bAdd').onclick = () => $('#fModel').click();
$('#bIoCam').onclick = () => $('#fIoCam').click();
$('#fIoCam').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const m = $('#adminMsg'); m.textContent = 'Lecture du .io…';
  try {
    const zip = await IoZip.open(await f.arrayBuffer());
    const cams = zip.has('model.ins') ? parseIns(await zip.text('model.ins')) : null;
    if (!cams) { m.textContent = 'Aucun angle de notice trouvé dans ce fichier.'; return; }
    if (cams.length !== P.nSteps) { m.textContent = `Ce .io a ${cams.length} étapes, ce robot en a ${P.nSteps} : est-ce le bon fichier ?`; return; }
    await DB.doc('robots/' + currentId).update({ cams }); setStepCams(cams);
    const r0 = robots && robots.find((x) => x.id === currentId); if (r0) r0.cams = cams;
    m.textContent = `Angles importés ✓ (${cams.length} étapes)`;
  } catch (er) { m.textContent = 'Échec : ' + ((er && (er.message || er.code)) || er); }
};
$('#bThumb2').onclick = async () => {
  const b = $('#bThumb2'); b.disabled = true; b.textContent = 'Enregistrement…';
  try { const assets = await useCap('assets'); const th = await assets.upload(await thumbBlob()); await DB.doc('robots/' + currentId).update({ thumbId: th.id }); b.textContent = 'Vignette enregistrée ✓'; }
  catch (e) { b.textContent = 'Échec, réessaie'; }
  setTimeout(() => { b.disabled = false; b.textContent = '📌 Cette vue comme vignette'; }, 2200);
};
$('#bThumb').onclick = async () => {
  const m = $('#adminMsg'); m.textContent = 'Mise à jour…';
  try { const assets = await useCap('assets'); const th = await assets.upload(await thumbBlob()); await DB.doc('robots/' + currentId).update({ thumbId: th.id }); m.textContent = 'Vignette mise à jour ✓'; }
  catch (e) { m.textContent = 'Échec : ' + ((e && (e.message || e.code)) || e); }
};
let delArmed = false;
$('#bDel').onclick = async () => {
  if (!delArmed) { delArmed = true; $('#bDel').textContent = 'Confirmer le retrait ?'; setTimeout(() => { delArmed = false; $('#bDel').textContent = '🗑 Retirer de la galerie'; }, 4000); return; }
  try { await DB.doc('robots/' + currentId).delete(); currentId = null; location.hash = 'galerie'; } catch (e) { $('#adminMsg').textContent = 'Échec : ' + ((e && (e.message || e.code)) || e); }
};

// ---------- Conception de robots ----------
const GEN = { age: '7-9', size: 'moyen', drive: 'engrenages', type: 'vehicule', form: 'tracteur' };
let genOpts = null;
['gAge', 'gSize', 'gDrive', 'gType', 'gForm'].forEach((id) => {
  const key = { gAge: 'age', gSize: 'size', gDrive: 'drive', gType: 'type', gForm: 'form' }[id];
  document.querySelectorAll('#' + id + ' button').forEach((b) => b.onclick = () => {
    if (b.disabled) return; GEN[key] = b.dataset.v;
    document.querySelectorAll('#' + id + ' button').forEach((x) => x.classList.toggle('on', x === b));
  });
});
$('#bDesign').onclick = () => { $('#design').style.display = 'flex'; };
$('#gClose').onclick = () => { $('#design').style.display = 'none'; };
// Charge les packs de la galerie jusqu'à avoir toutes les pièces d'un modèle généré
async function ensurePartsFor(ldr) {
  const need = new Set(LDCore.parse(ldr).refs.map((r) => r.f));
  const missing = () => [...need].filter((n) => !cache.has(n));
  const ids = [PACKS[0], ...((robots || []).map((r) => r.packId).filter(Boolean))];
  for (const id of [...new Set(ids)]) {
    if (!missing().length) return;
    try { const r = await fetch('/_blob/' + id); if (r.ok) loadPack(await r.json()); } catch (e) {}
  }
}
async function runGenerator(opts) {
  genOpts = opts;
  const r = RobotGen.generate(opts);
  await ensurePartsFor(r.ldr);
  await startDraft(r.ldr, r.name, null);
  $('#dName').value = r.name; $('#dDesc').value = r.desc;
  $('#mtitle').textContent = r.name; $('#msub').textContent = `${r.nParts} pièces · ${r.nSteps} étapes · kit WeDo 2.0`;
  $('#bReroll').style.display = '';
  const m = $('#dMsg');
  if (!r.kitOk) { m.style.color = '#b00'; m.textContent = 'Attention, pièces en trop par rapport au kit : ' + r.over.join(', '); }
  else if (canEdit && DB) { m.style.color = 'var(--ok)'; m.textContent = '✓ Toutes les pièces sont dans le kit. Tourne-le, puis publie-le si il te plaît.'; }
}
$('#gGo').onclick = () => {
  $('#design').style.display = 'none';
  runGenerator({ age: GEN.age, size: GEN.size, drive: GEN.drive, form: GEN.form, name: $('#gName').value.trim() || null, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0 });
};
$('#bReroll').onclick = () => { if (genOpts) runGenerator(Object.assign({}, genOpts, { name: $('#gName').value.trim() || null, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0 })); };

async function route() {
  const h = location.hash.slice(1);
  if (h.startsWith('robot-')) return openRobot(h.slice(6));
  if (h === 'nouveau' && draft) return showViewer();
  showGallery();
}
window.addEventListener('hashchange', route);

const PACKS = ['fb23414bfb81bf4cb367931c3e995d0e'];
async function initGallery() {
  USER = await useCap('user');
  try { canEdit = USER ? !!(await USER.canEdit()) : false; } catch (e) { canEdit = false; }
  DB = await useCap('db');
  $('#bAdd').style.display = canEdit && DB ? '' : 'none';
  if (!DB) {
    const st0 = $('#gstat'); st0.style.display = 'block';
    st0.textContent = 'Galerie partagée indisponible dans cette vue : ouvre la page depuis son lien claude.ai (bouton d\'ouverture en plein écran), puis recharge.';
    robots = [{ id: 'minerrobot', name: 'MinerRobot', nParts: 103, nSteps: 52 }];
    renderGallery(); route(); return;
  }
  const st = $('#gstat');
  const timer = setTimeout(() => { st.style.display = 'block'; st.textContent = 'La galerie met du temps à répondre…'; }, 10000);
  DB.collection('robots').onSnapshot((snap) => {
    if (!snap.metadata.fromCache) { clearTimeout(timer); st.style.display = 'none'; }
    const first = robots === null;
    robots = snap.docs.map((d) => Object.assign({ id: d.id }, d.data())).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    renderGallery();
    if (first) route();
  }, (e) => { clearTimeout(timer); st.style.display = 'block'; st.textContent = 'Galerie indisponible pour le moment.'; });
}

// ---------- Démarrage ----------
(async function start() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  applyBg(); resize(true); loop();
  showGallery();
  await loadCache();
  try { const emb = JSON.parse(document.getElementById('embeddedParts').textContent || 'null'); loadPack(emb); } catch (e) {}
  initGallery();
})();
})();
