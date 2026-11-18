// Génère N variantes par base (avec historique comme dans le Studio) dans /tmp/vt
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const G = require('../studio3d/gen.js'); const fs = require('fs');
const N = +process.argv[2] || 6; fs.rmSync('/tmp/vt', { recursive: true, force: true }); fs.mkdirSync('/tmp/vt');
for (const form of ['bolide', 'tracteur', 'sidecar']) for (const drive of ['engrenages', 'elastique']) for (const size of ['petit', 'moyen', 'grand']) {
  const avoid = [], avoidSig = [], info = [];
  for (let i = 0; i < N; i++) {
    const r = G.generate({ age: '9-11', size, drive, form, seed: 1000 + i * 7919, avoid, avoidSig });
    avoid.push(r.nParts); avoidSig.push(r.sig); info.push(`${r.nParts}${r.kitOk ? '' : '!'}(${r.style})`);
    fs.writeFileSync(`/tmp/vt/${form}-${drive}-${size}-${i}.ldr`, r.ldr);
  }
  console.log(form, drive, size, info.join(' '));
}
