// Exporte les 12 bases du générateur (sans ajouts) dans /tmp/v pour variants.py
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const G = require('../studio3d/gen.js'); const fs = require('fs');
fs.mkdirSync('/tmp/v', { recursive: true });
for (const form of ['bolide', 'tracteur']) for (const drive of ['engrenages', 'elastique']) for (const size of ['petit', 'moyen', 'grand']) {
  for (const rear of form === 'bolide' ? ['patin', 'roues'] : [null]) {
    const r = G.generate({ age: '9-11', size, drive, form, rear, seed: 7, base: true });
    fs.writeFileSync(`/tmp/v/base-${form}-${drive}-${size}${rear ? '-' + rear : ''}.ldr`, r.ldr);
  }
}
