// ===== Générateur de robots (modules vérifiés, kit WeDo 2.0 45300) =====
const RobotGen = (function () {
  const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const RYn = [[0, 0, -1], [0, 1, 0], [1, 0, 0]];
  const RYp = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]];
  const R180 = [[-1, 0, 0], [0, 1, 0], [0, 0, -1]];
  // Inventaire du kit 45300 (codes LDraw « pièce|couleur » → quantité)
  const KIT = {
    '21980|71': 1, '19071c01|15': 1, '32062|4': 4, '32270|0': 2, '32198|19': 2, '44294|71': 2, '3700|27': 4, '3710|15': 4,
    '3023b|15': 6, '3062b|46': 2, '3062b|34': 2, '3062b|36': 2, '64799|71': 2, '3709b|191': 4, '55982|15': 6, '56891|0': 2,
    '2654|0': 6, '3001|191': 4, '3001|322': 2, '87087|15': 2, '14769p01|15': 2, '4286|191': 4, '4287|27': 4, '85984|191': 4,
    '32059|27': 2, '2458|71': 4, '3737|0': 2, '4185|43': 6, '3666|15': 4, '3010|322': 2, '3701|27': 4, '92402|0': 4, '32016|322': 2, '2780|0': 8, '32192|27': 2, '3749|19': 4, '62462|10': 2,
  };
  const NAMES_SIDECAR = ['Le Side-Car Rouge', 'Moto-Copain', 'Le Baroudeur', 'Side-Car Express', 'La Moto du Facteur', 'Duo Pétaradant'];
  const NAMES_TRACTEUR = ['Le Petit Tracteur', 'Tracto-Malin', 'Le Laboureur', 'Gros Ronron', 'Le Tracteur Orange', 'Fermier Turbo', 'Le Roule-Champs'];
  const NAMES = ['Le Petit Bolide', 'Turbo Tortue', 'La Fusée Orange', 'Le Rapido', 'Zigzag', 'Le Scarabée Turbo', 'Bip-Bip',
    'Le Roule-Malin', 'Flash Citron', 'Le Bolide Azur', 'Rouli-Roulant', 'Le Petit Explorateur'];

  // Ajouts pré-vérifiés (variants.py) : remplacé à l'assemblage de la page, chargé depuis variants.json sous node
  let VARIANTS = /*__VARIANTS__*/null;
  if (!VARIANTS && typeof require !== 'undefined') { try { VARIANTS = require('./variants.json'); } catch (e) {} }
  // Styles : poids de chaque ajout (le style change l'allure générale d'une variante à l'autre)
  const STYLES = {
    costaud: { bloc: 5, 'bloc-feux': 3, 'bloc-radar': 3, mur: 4, technic: 3, tourelle: 2, coin: 2, rampe: 2 },
    futuriste: { 'bloc-radar': 4, radar: 5, feu: 4, tourelle: 4, pente: 3, aile: 4, rampe: 3 },
    chantier: { technic: 5, 'technic-court': 5, plaque: 3, mur: 3, 'bloc-feux': 3, 'petite-plaque': 2 },
    course: { aile: 5, pente: 5, coin: 4, rampe: 4, 'petite-plaque': 3, plaque: 3, feu: 2 },
    fantaisie: {},
  };
  const STYLE_NAMES = { costaud: 'costaud', futuriste: 'futuriste', chantier: 'de chantier', course: 'de course', fantaisie: 'fantaisie' };

  // Cases occupées (grille LEGO : 20 × 8 × 20 LDU) par une pièce, d'après sa boîte englobante
  function cells(f, bb, x, y, z, R) {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const cx of [bb[0], bb[3]]) for (const cy of [bb[1], bb[4]]) for (const cz of [bb[2], bb[5]]) {
      const w = [0, 1, 2].map((i) => R[i * 3] * cx + R[i * 3 + 1] * cy + R[i * 3 + 2] * cz + [x, y, z][i]);
      for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], w[i]); hi[i] = Math.max(hi[i], w[i]); }
    }
    const g = [20, 8, 20], out = [];
    const a = lo.map((v, i) => Math.floor((v + 1.5) / g[i])), b = hi.map((v, i) => Math.floor((hi[i] - 1.5) / g[i]));
    for (let i = a[0]; i <= b[0]; i++) for (let j = a[1]; j <= b[1]; j++) for (let k = a[2]; k <= b[2]; k++) out.push(i + ',' + j + ',' + k);
    return out;
  }
  const ROT = [[1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 0, 1, 0, 1, 0, -1, 0, 0], [-1, 0, 0, 0, 1, 0, 0, 0, -1], [0, 0, -1, 0, 1, 0, 1, 0, 0]];
  const mul9 = (A, B) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]));
  const MIR = (R) => [R[0], -R[1], -R[2], -R[3], R[4], R[5], -R[6], R[7], R[8]];   // M·R·M, M = symétrie x → -x
  const rot = (R, v) => [0, 1, 2].map((i) => R[i * 3] * v[0] + R[i * 3 + 1] * v[1] + R[i * 3 + 2] * v[2]);
  // Pièces d'un ajout `ai` tourné de R puis déplacé de t (mir : version symétrique gauche/droite)
  function addonParts(ai, R, t, color, mir) {
    return VARIANTS.cat[ai][1].map(([f, cols, x, y, z, Rl, bb], n) => {
      let pos = rot(R, [x, y, z]).map((v, i) => v + t[i]), Rw = mul9(R, Rl);
      if (mir) { pos = [-pos[0], pos[1], pos[2]]; Rw = MIR(Rw); }
      return { f, c: color[n], x: pos[0], y: pos[1], z: pos[2], R: [Rw.slice(0, 3), Rw.slice(3, 6), Rw.slice(6, 9)], cells: cells(f, bb, pos[0], pos[1], pos[2], Rw) };
    });
  }
  const sigOf = (parts) => parts.map((p) => [p.f, Math.round(p.x), Math.round(p.y), Math.round(p.z), p.R.flat().map(Math.round).join('')].join(':')).sort().join('|');
  function addOns(key, rand, stock, extra, style) {
    const poses = (VARIANTS && VARIANTS.bases[key]) || [], cat = VARIANTS ? VARIANTS.cat : [];
    const w = STYLES[style], wt = (ai) => w[cat[ai][0]] || (style === 'fantaisie' ? 2 : 0.4);
    const used = new Set(), steps = [], chosen = [];
    let n = 0;
    // essaie d'ajouter un groupe (pièces de l'ajout + son symétrique) en respectant kit, cases libres et budget
    function tryGroup(ai, build, copies) {
      const color = cat[ai][1].map(([f, cols]) => { const ok = cols.filter((c) => (stock[f + '|' + c] || 0) >= copies); return ok.length ? ok[Math.floor(rand() * ok.length)] : null; });
      if (color.includes(null)) return null;
      const need = {};
      cat[ai][1].forEach(([f], j) => { const kk = f + '|' + color[j]; need[kk] = (need[kk] || 0) + copies; });
      if (Object.entries(need).some(([kk, q]) => (stock[kk] || 0) < q)) return null;
      const parts = build(color);
      if (n + parts.length > extra + 2) return null;
      const cs = parts.flatMap((q) => q.cells);
      if (new Set(cs).size < cs.length || cs.some((c) => used.has(c))) return null;
      cs.forEach((c) => used.add(c));
      Object.entries(need).forEach(([kk, q]) => { stock[kk] -= q; });
      steps.push(parts.map(({ f, c, x, y, z, R }) => ({ f, c, x, y, z, R })));
      n += parts.length;
      return parts;
    }
    // 1er étage : poses pré-vérifiées sur la base
    const order = poses.map((p, i) => ({ i, s: -Math.log(rand() + 1e-9) / wt(p[0]) })).sort((a, b) => a.s - b.s);
    const done = new Set(), level1 = [];
    for (const { i } of order) {
      if (n >= extra) break;
      const p = poses[i], m = p[5];
      if (done.has(i)) continue;
      done.add(i); done.add(m);
      const R = ROT[p[1]], t0 = [p[2], p[3], p[4]];
      const self = m === i;
      const parts = tryGroup(p[0], (color) => self ? addonParts(p[0], R, t0, color, false) : [...addonParts(p[0], R, t0, color, false), ...addonParts(p[0], R, t0, color, true)], self ? 1 : 2);
      if (parts) { chosen.push(Math.min(i, m)); level1.push({ p, self }); }
    }
    // 2e étage : sur les ajouts qui ont des tenons dessus, dans la hauteur libre mesurée
    const tops = cat.map((c, ai) => ai).filter((ai) => cat[ai][5]);
    for (const { p, self } of level1) {
      if (n >= extra || !cat[p[0]][3].length || rand() < 0.25) continue;
      const R = ROT[p[1]], t0 = [p[2], p[3], p[4]];
      const studs = new Set(cat[p[0]][3].map((q) => rot(R, q).map((v, i) => Math.round(v + t0[i])).join(',')));
      const cand = tops.filter((ai) => cat[ai][4] - 4 <= p[6]).map((ai) => ({ ai, s: -Math.log(rand() + 1e-9) / wt(ai) })).sort((a, b) => a.s - b.s);
      let placed = false;
      for (const { ai } of cand) {
        if (placed) break;
        for (const k of [0, 1, 2, 3].sort(() => rand() - 0.5)) {
          if (placed) break;
          const Rc = ROT[k], foot = cat[ai][2].map((q) => rot(Rc, q));
          for (const s0 of [...studs].sort(() => rand() - 0.5)) {
            const sv = s0.split(',').map(Number), tc = [0, 1, 2].map((i) => sv[i] - foot[0][i]);
            if (!foot.every((q) => studs.has(q.map((v, i) => Math.round(v + tc[i])).join(',')))) continue;
            const one = (color, mir) => addonParts(ai, Rc, tc, color, mir);
            // côté droit + côté gauche (sur le support symétrique, ou sur le même support s'il est centré)
            const build = (color) => {
              const a = one(color, false), b = one(color, true);
              if (self && sigOf(a) === sigOf(b)) return a;
              return [...a, ...b];
            };
            const probe = build(cat[ai][1].map(([, cols]) => cols[0]));
            if (tryGroup(ai, build, probe.length / cat[ai][1].length)) { placed = true; break; }
          }
        }
      }
    }
    return { steps, sig: chosen.sort((a, b) => a - b).join('.') + '/' + n, n };
  }

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  function build(opts, seed, boost = 0) {
    const rand = rng(seed);
    const pick = (a) => a[Math.floor(rand() * a.length)];
    const size = opts.size || 'moyen'; // petit | moyen | grand
    const steps = []; // chaque étape : liste de pièces
    const S = (...p) => steps.push(p);
    const P = (f, c, x, y, z, R = I) => ({ f, c, x, y, z, R });
    const lights = pick([46, 34]), antenna = lights === 46 ? 34 : 46;

    // 1. Moteur + transmission (reprise du MinerRobot, posée à plat)
    S(P('21980', 71, 0, 0, 0), P('32062', 4, 0, 26, -20, RYn));
    S(P('32270', 0, 0, 26, -28.73));
    if (size !== 'petit') {
      S(P('3023b', 15, -30, 40, -40, RYn), P('3023b', 15, 30, 40, -40, RYn));
      S(P('3700', 27, -30, 16, -60, RYn), P('3700', 27, 30, 16, -60, RYn), P('3062b', lights, -30, 16, -30), P('3062b', lights, 30, 16, -30));
    } else S(P('3700', 27, -30, 16, -60, RYn), P('3700', 27, 30, 16, -60, RYn));
    const elastic = opts.drive === 'elastique';
    if (!elastic) S(P('3710', 15, -30, 8, -60, RYp), P('3710', 15, 30, 8, -60, RYp));
    else {
      // support de l'axe des roues, 3 tenons plus loin vers l'avant, relié par des plaques 1×6
      S(P('3700', 27, -30, 16, -120, RYn), P('3700', 27, 30, 16, -120, RYn));
      S(P('3666', 15, -30, 8, -80, RYp), P('3666', 15, 30, 8, -80, RYp));
    }
    S(P('44294', 71, 3.28, 26, -60), P('32198', 19, 17.37, 26, -60, RYp));
    if (elastic) {
      // poulie = 2 roues 4185 dos à dos contre la face de la brique Technic (montage du walkbot)
      S(P('4185', 43, 44.44, 26, -60, RYp), P('4185', 43, 53.27, 26, -60, RYp));
      S(P('3737', 0, 0, 26, -120), P('4185', 43, 44.44, 26, -120, RYp), P('4185', 43, 53.27, 26, -120, RYp));
    }
    S(P('64799', 71, 0, 0, -60));
    // 2. Plateau
    const sidecar = opts.form === 'sidecar';   // moto side-car : châssis du tracteur, moto à gauche, nacelle (hub) à droite
    const deckZ = size === 'petit' && opts.form === 'bolide' ? [-20, 20] : [-60, -20, 20, 60];
    S(...deckZ.map((z) => P('3709b', 191, 0, -8, z)));
    const tractor = opts.form === 'tracteur' || sidecar;
    // arrière du bolide : patin, ou essieu à petites roues (montage de l'avant du tracteur)
    const rear = tractor ? 'roues' : (opts.rear || (rand() < 0.75 ? 'roues' : 'patin'));   // Mathieu préfère le bolide 4 roues
    // place du hub : arrière / centre / avant (le petit bolide garde le hub au centre, plateau trop court)
    const HUBS = sidecar ? { arriere: [-60, [-60, -20]], centre: [-20, [-40, 0]] } : tractor ? { arriere: [-60, [-60, -20]], centre: [-20, [-40, 0]], avant: [20, [20, 60]] }
      : size === 'petit' ? { centre: [0, deckZ] } : { avant: [-40, [-60, -20]], centre: [0, deckZ], arriere: [40, [20, 60]] };
    const hubPos = HUBS[opts.hub] ? opts.hub : pick(Object.keys(HUBS));
    if (!tractor && rear === 'patin') {
      // 3. Patin arrière
      S(P('3023b', 15, -10, 56, 70), P('3023b', 15, -10, 56, 90), P('2654', 0, -10, 64, 80));
    } else if (!tractor) {
      // 3. Essieu arrière à petites roues
      S(P('3710', 15, -20, -8, 120, RYp), P('3710', 15, 20, -8, 120, RYp));
      S(P('3010', 322, -20, 0, 140, RYp), P('3010', 322, 20, 0, 140, RYp));
      S(P('3701', 27, -20, 24, 140, RYn), P('3701', 27, 20, 24, 140, RYn));
      S(P('44294', 71, 0, 34, 140));
      S(P('55982', 15, 56, 34, 140, [[0, 0, -1], [1, 0, 0], [0, -1, 0]]), P('92402', 0, 56, 34, 140, RYn),
        P('55982', 15, -56, 34, 140, [[0, 0, 1], [1, 0, 0], [0, 1, 0]]), P('92402', 0, -56, 34, 140, RYp));
    } else {
      // 3. Avant du tracteur (capot) : plaques sur l'arrière du moteur, briques, essieu avant 8 LDU plus bas (petites roues r=38)
      S(P('3710', 15, -20, -8, 120, RYp), P('3710', 15, 20, -8, 120, RYp));
      S(P('3010', 322, -20, 0, 140, RYp), P('3010', 322, 20, 0, 140, RYp));
      S(P('3701', 27, -20, 24, 140, RYn), P('3701', 27, 20, 24, 140, RYn));
      S(P('44294', 71, 0, 34, 140));
      // petites roues (jante 55982 + pneu 92402), montage repris de TekNo ; side-car : seule la roue avant de la moto (gauche)
      if (sidecar) S(P('55982', 15, -56, 34, 140, [[0, 0, 1], [1, 0, 0], [0, 1, 0]]), P('92402', 0, -56, 34, 140, RYp));
      else S(P('55982', 15, 56, 34, 140, [[0, 0, -1], [1, 0, 0], [0, -1, 0]]), P('92402', 0, 56, 34, 140, RYn),
        P('55982', 15, -56, 34, 140, [[0, 0, 1], [1, 0, 0], [0, 1, 0]]), P('92402', 0, -56, 34, 140, RYp));
      // pont entre le plateau et le capot (pas de place quand la cabine est à l'avant)
      if (hubPos !== 'avant') S(P('3666', 15, -20, -16, 80, RYp), P('3666', 15, 20, -16, 80, RYp));
    }
    // 4. Roues
    const wx = elastic ? 90 : 59.02, wz = elastic ? -120 : -60;
    S(P('55982', 15, wx, 26, wz, RYn), P('56891', 0, wx, 26, wz, [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]),
      P('55982', 15, -wx - 0.62, 26, wz, RYp), P('56891', 0, -wx - 0.62, 26, wz, [[0, 0, 1], [-1, 0, 0], [0, -1, 0]]));
    // 5. Réhausse + hub
    const riserZ = HUBS[hubPos][1];
    const riserCols = riserZ.length === 2 ? pick([[322, 322], [191, 191], [191, 322]])
      : pick([[322, 191, 191, 322], [191, 322, 322, 191], [191, 191, 191, 191], [322, 191, 322, 191]]);
    S(...riserZ.map((z, i) => P('3001', riserCols[i], 0, -32, z)));
    const H = -104;
    const hz = HUBS[hubPos][0]; // centre du hub
    const mul = (A, B) => A.map((row, i) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
    const hx = sidecar ? 40 : 0; // side-car : le hub (nacelle) est décalé à droite, au-dessus de la grande roue droite
    S(P('19071c01', 15, hx, H, hz, tractor ? R180 : I));
    // pièces dans le repère du hub (tourné de 180° pour le tracteur : les yeux regardent vers le capot)
    const h = (f, c, x, y, z, R = I) => tractor ? P(f, c, hx - x, H + y, hz - z, mul(R180, R)) : P(f, c, x, H + y, hz + z, R);
    if (sidecar) {
      // la moto (côté gauche) : selle sur la réhausse, réservoir, guidon sur le pont
      S(P('3701', 27, -30, -56, hz + 20, RYn), P('85984', 191, -30, -56, hz + 50, RYn));
      S(P('3701', 27, -20, -40, 80, RYn), P('32062', 4, -20, -30, 80));
    }
    // 6. Yeux (+ joues)
    if (size !== 'petit') S(h('4286', 191, 50, 0, -10, R180), h('4286', 191, -50, 0, -10, R180), h('87087', 15, 50, 0, -30), h('87087', 15, -50, 0, -30));
    else S(h('87087', 15, 50, 0, -30), h('87087', 15, -50, 0, -30));
    S(h('14769p01', 15, 60, 20, -48, [[-1, 0, 0], [0, 0, 1], [0, 1, 0]]), h('14769p01', 15, -60, 20, -48, [[0, 0, 1], [1, 0, 0], [0, 1, 0]]));
    // 7. Finitions
    if (size !== 'petit') {
      if (sidecar) S(P('85984', 191, -20, 0, -90), P('85984', 191, 20, 0, -90), P('3062b', 36, -20, -32, 150), P('3062b', 36, 20, -40, 130));   // phare de la moto + échappement
      else if (tractor) S(P('85984', 191, -20, 0, -90), P('85984', 191, 20, 0, -90), P('3062b', 36, -20, -40, 130), P('3062b', 36, 20, -40, 130));
      else if (rear === 'patin') S(P('85984', 191, -20, 0, -90), P('85984', 191, 20, 0, -90), P('3062b', 36, -20, -24, 90), P('3062b', 36, 20, -24, 90));
      else S(P('85984', 191, -20, 0, -90), P('85984', 191, 20, 0, -90), P('3062b', 36, -20, -32, 150), P('3062b', 36, 20, -32, 150));
    }
    // 8. Toit et antennes (repris de la tête du MinerRobot)
    if (size !== 'petit') {
      S(h('32059', 27, 0, -8, 0, R180));
      S(h('2458', 71, 40, -32, -30), h('2458', 71, -40, -32, -30));
      S(h('32016', 322, 40, -22, -50, [[0, 0, 1], [0, -1, 0], [1, 0, 0]]), h('32016', 322, -40, -22, -50, [[0, 0, -1], [0, -1, 0], [-1, 0, 0]]));
    }
    if (size === 'grand') {
      S(h('4287', 27, 50, 48, -10, R180), h('4287', 27, -50, 48, -10, R180));
      S(h('2780', 0, 60, 34, 20, [[1, 0, 0], [0, 0.866, -0.5], [0, 0.5, 0.866]]), h('32192', 27, 70, 34.03, 20.02, [[-1, 0, 0], [0, -0.5, 0.866], [0, 0.866, 0.5]]),
        h('2780', 0, -60, 34, 20, [[1, 0, 0], [0, 0.866, -0.5], [0, 0.5, 0.866]]), h('32192', 27, -70, 34.03, 20.02, [[-1, 0, 0], [0, -0.5, 0.866], [0, 0.866, 0.5]]));
      S(h('32062', 4, 70, 63, 12.19, [[0, 0, 1], [0.966, 0.259, 0], [-0.259, 0.966, 0]]), h('3749', 19, 70, 8.04, 5.01, [[0, -1, 0], [0.866, 0, -0.5], [0.5, 0, 0.866]]),
        h('32062', 4, -70, 63, 12.19, [[0, 1, 0], [-0.966, 0, 0.259], [0.259, 0, 0.966]]), h('3749', 19, -70, 8.04, 5.01, [[0, -1, 0], [0.866, 0, -0.5], [0.5, 0, 0.866]]));
      S(h('62462', 10, 70, -9.28, -4.99, [[0, 1, 0], [-0.866, 0, -0.5], [-0.5, 0, 0.866]]), h('3062b', antenna, 70, -26.6, -14.99, [[-1, 0, 0], [0, -0.866, -0.5], [0, -0.5, 0.866]]),
        h('62462', 10, -70, -9.28, -4.99, [[0, 1, 0], [-0.866, 0, -0.5], [-0.5, 0, 0.866]]), h('3062b', antenna, -70, -26.6, -14.99, [[1, 0, 0], [0, -0.866, 0.5], [0, -0.5, -0.866]]));
    }

    // 9. Variante : ajouts pré-vérifiés posés sur les tenons libres
    let style = null, sig = '';
    if (!opts.base && VARIANTS) {
      const stock = Object.assign({}, KIT);
      steps.flat().forEach((p) => { stock[p.f + '|' + p.c] -= 1; });
      style = pick(Object.keys(STYLES));
      // fourchette d'ajouts : variété, sans trop s'éloigner de la taille demandée (≈30 / ≈50 / 60 et +)
      const nb = steps.flat().length, cap = { petit: 40, moyen: 70, grand: 999 }[size];
      const [lo0, hi0] = { petit: [2, 9], moyen: [4, 14], grand: [6, 18] }[size];
      const hi = Math.max(lo0 + 3, Math.min(hi0, cap - nb)), lo = Math.min(lo0, hi - 3);
      const extra = Math.max(1, lo + Math.floor(rand() * (hi - lo + 1)) + boost);
      const key = (sidecar ? 'sidecar' : tractor ? 'tracteur' : 'bolide') + '|' + (opts.drive === 'elastique' ? 'elastique' : 'engrenages') + '|' + size + (tractor ? '' : '|' + rear) + '|' + hubPos;
      const r = addOns(key, rand, stock, extra, style);
      steps.push(...r.steps); sig = r.sig;
    }
    // Regroupement des étapes selon l'âge
    const maxPer = { '7-9': 4, '9-11': 6, '11+': 9 }[opts.age] || 4;
    const merged = [];
    for (const st of steps) {
      const last = merged[merged.length - 1];
      if (last && last.length + st.length <= maxPer && opts.age !== '7-9') last.push(...st); else merged.push([...st]);
    }
    // Vérification du kit
    const use = {};
    merged.flat().forEach((p) => { const k = p.f + '|' + p.c; use[k] = (use[k] || 0) + 1; });
    const over = Object.entries(use).filter(([k, q]) => q > (KIT[k] || 0)).map(([k, q]) => `${k} (${q}/${KIT[k] || 0})`);
    const name = opts.name || pick(sidecar ? NAMES_SIDECAR : tractor ? NAMES_TRACTEUR : NAMES);
    const nParts = merged.flat().length;
    const lines = [`0 ${name}`, `0 Name: ${name.replace(/[^A-Za-z0-9]+/g, '')}.ldr`, "0 Author: Claude pour EuraTech'Kids", '0 !LDRAW_ORG Unofficial_Model', ''];
    const fmt = (v) => String(Math.round(v * 1000) / 1000);
    for (const st of merged) {
      for (const p of st) lines.push(`1 ${p.c} ${fmt(p.x)} ${fmt(p.y)} ${fmt(p.z)} ${p.R.flat().map(fmt).join(' ')} ${p.f}.dat`);
      lines.push('0 STEP');
    }
    const ageTxt = { '7-9': '7-9 ans', '9-11': '9-11 ans', '11+': '11 ans et plus' }[opts.age] || '';
    return {
      ldr: lines.join('\n') + '\n', name, nParts, style, sig, hubPos, rear, nSteps: merged.length, kitOk: !over.length, over,
      desc: `${sidecar ? 'Moto side-car' : tractor ? 'Tracteur 4 roues' : rear === 'roues' ? 'Bolide 4 roues' : 'Véhicule roulant'}${style ? ' ' + STYLE_NAMES[style] : ''} ${opts.drive === 'elastique' ? 'à élastique' : 'à engrenages'} de ${nParts} pièces pour les ${ageTxt}, généré avec le kit WeDo 2.0.`,
    };
  }
  // Génère une variante ; opts.avoid = nombres de pièces déjà proposés, opts.avoidSig = combinaisons déjà vues
  function generate(opts) {
    let seed = (opts.seed || Date.now()) >>> 0, best = null;
    for (let tries = 0; tries < 60; tries++) {
      const boost = tries < 15 ? 0 : (tries % 2 ? 1 : -1) * Math.ceil((tries - 14) / 2);
      const r = build(opts, seed, boost);
      const dup = (opts.avoid || []).includes(r.nParts) || (opts.avoidSig || []).includes(r.sig);
      if (r.kitOk && !dup) return r;
      if (!best || (r.kitOk && !best.kitOk)) best = r;
      seed = (seed * 2654435761 + 12345) >>> 0;
    }
    return best;
  }
  return { generate, KIT, setVariants: (v) => { VARIANTS = v; } };
})();
if (typeof module !== 'undefined') module.exports = RobotGen;
