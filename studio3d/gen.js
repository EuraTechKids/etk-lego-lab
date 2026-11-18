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
  const NAMES_TRACTEUR = ['Le Petit Tracteur', 'Tracto-Malin', 'Le Laboureur', 'Gros Ronron', 'Le Tracteur Orange', 'Fermier Turbo', 'Le Roule-Champs'];
  const NAMES = ['Le Petit Bolide', 'Turbo Tortue', 'La Fusée Orange', 'Le Rapido', 'Zigzag', 'Le Scarabée Turbo', 'Bip-Bip',
    'Le Roule-Malin', 'Flash Citron', 'Le Bolide Azur', 'Rouli-Roulant', 'Le Petit Explorateur'];

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  function generate(opts) {
    const rand = rng(opts.seed || Date.now());
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
    const deckZ = size === 'petit' && opts.form !== 'tracteur' ? [-20, 20] : [-60, -20, 20, 60];
    S(...deckZ.map((z) => P('3709b', 191, 0, -8, z)));
    const tractor = opts.form === 'tracteur';
    if (!tractor) {
      // 3. Patin arrière
      S(P('3023b', 15, -10, 56, 70), P('3023b', 15, -10, 56, 90), P('2654', 0, -10, 64, 80));
    } else {
      // 3. Avant du tracteur (capot) : plaques sur l'arrière du moteur, briques, essieu avant 8 LDU plus bas (petites roues r=38)
      S(P('3710', 15, -20, -8, 120, RYp), P('3710', 15, 20, -8, 120, RYp));
      S(P('3010', 322, -20, 0, 140, RYp), P('3010', 322, 20, 0, 140, RYp));
      S(P('3701', 27, -20, 24, 140, RYn), P('3701', 27, 20, 24, 140, RYn));
      S(P('44294', 71, 0, 34, 140));
      // petites roues (jante 55982 + pneu 92402), montage repris de TekNo
      S(P('55982', 15, 56, 34, 140, [[0, 0, -1], [1, 0, 0], [0, -1, 0]]), P('92402', 0, 56, 34, 140, RYn),
        P('55982', 15, -56, 34, 140, [[0, 0, 1], [1, 0, 0], [0, 1, 0]]), P('92402', 0, -56, 34, 140, RYp));
      // pont entre le plateau et le capot
      S(P('3666', 15, -20, -16, 80, RYp), P('3666', 15, 20, -16, 80, RYp));
    }
    // 4. Roues
    const wx = elastic ? 90 : 59.02, wz = elastic ? -120 : -60;
    S(P('55982', 15, wx, 26, wz, RYn), P('56891', 0, wx, 26, wz, [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]),
      P('55982', 15, -wx - 0.62, 26, wz, RYp), P('56891', 0, -wx - 0.62, 26, wz, [[0, 0, 1], [-1, 0, 0], [0, -1, 0]]));
    // 5. Réhausse + hub
    const riserZ = tractor ? [-60, -20] : deckZ;
    const riserCols = riserZ.length === 2 ? pick([[322, 322], [191, 191], [191, 322]])
      : pick([[322, 191, 191, 322], [191, 322, 322, 191], [191, 191, 191, 191], [322, 191, 322, 191]]);
    S(...riserZ.map((z, i) => P('3001', riserCols[i], 0, -32, z)));
    const H = -104;
    const hz = tractor ? -60 : 0; // centre du hub (cabine au-dessus des roues arrière pour le tracteur)
    const mul = (A, B) => A.map((row, i) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
    S(P('19071c01', 15, 0, H, hz, tractor ? R180 : I));
    // pièces dans le repère du hub (tourné de 180° pour le tracteur : les yeux regardent vers le capot)
    const h = (f, c, x, y, z, R = I) => tractor ? P(f, c, -x, H + y, hz - z, mul(R180, R)) : P(f, c, x, H + y, hz + z, R);
    // 6. Yeux (+ joues)
    if (size !== 'petit') S(h('4286', 191, 50, 0, -10, R180), h('4286', 191, -50, 0, -10, R180), h('87087', 15, 50, 0, -30), h('87087', 15, -50, 0, -30));
    else S(h('87087', 15, 50, 0, -30), h('87087', 15, -50, 0, -30));
    S(h('14769p01', 15, 60, 20, -48, [[-1, 0, 0], [0, 0, 1], [0, 1, 0]]), h('14769p01', 15, -60, 20, -48, [[0, 0, 1], [1, 0, 0], [0, 1, 0]]));
    // 7. Finitions
    if (size !== 'petit') {
      if (tractor) S(P('85984', 191, -20, 0, -90), P('85984', 191, 20, 0, -90), P('3062b', 36, -20, -40, 130), P('3062b', 36, 20, -40, 130));
      else S(P('85984', 191, -20, 0, -90), P('85984', 191, 20, 0, -90), P('3062b', 36, -20, -24, 90), P('3062b', 36, 20, -24, 90));
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
    const name = opts.name || pick(tractor ? NAMES_TRACTEUR : NAMES);
    const nParts = merged.flat().length;
    const lines = [`0 ${name}`, `0 Name: ${name.replace(/[^A-Za-z0-9]+/g, '')}.ldr`, "0 Author: Claude pour EuraTech'Kids", '0 !LDRAW_ORG Unofficial_Model', ''];
    const fmt = (v) => String(Math.round(v * 1000) / 1000);
    for (const st of merged) {
      for (const p of st) lines.push(`1 ${p.c} ${fmt(p.x)} ${fmt(p.y)} ${fmt(p.z)} ${p.R.flat().map(fmt).join(' ')} ${p.f}.dat`);
      lines.push('0 STEP');
    }
    const ageTxt = { '7-9': '7-9 ans', '9-11': '9-11 ans', '11+': '11 ans et plus' }[opts.age] || '';
    return {
      ldr: lines.join('\n') + '\n', name, nParts, nSteps: merged.length, kitOk: !over.length, over,
      desc: `${tractor ? 'Tracteur 4 roues' : 'Véhicule roulant'} ${opts.drive === 'elastique' ? 'à élastique' : 'à engrenages'} de ${nParts} pièces pour les ${ageTxt}, généré avec le kit WeDo 2.0.`,
    };
  }
  return { generate, KIT };
})();
if (typeof module !== 'undefined') module.exports = RobotGen;
