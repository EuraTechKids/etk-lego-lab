#!/usr/bin/env python3
"""Assemble la page du Studio 3D (voir studio3d/BUILD.md).
Usage : python3 tools/build.py <modele_par_defaut.ldr> <sortie.html> [pack_parts.json]"""
import sys, re, json
from pathlib import Path
d = Path(__file__).resolve().parent.parent / 'studio3d'
strip = lambda s: re.sub(r'^\s*if \(typeof module !== .undefined.\).*$', '', s, flags=re.M)
gen = strip((d / 'gen.js').read_text())
gen = gen.replace('/*__VARIANTS__*/null', (d / 'variants.json').read_text().strip())
html = (d / 'app.html').read_text()
parts = Path(sys.argv[3]).read_text() if len(sys.argv) > 3 else 'null'
for k, v in [('__CORE__', strip((d / 'core.js').read_text())), ('__IOZIP__', strip((d / 'iozip.js').read_text())),
             ('__GEN__', gen), ('__APP__', strip((d / 'app.js').read_text())),
             ('__MODEL__', Path(sys.argv[1]).read_text()), ('__PARTS__', parts)]:
    html = html.replace(k, lambda m, v=v: v) if False else html.replace(k, v, 1)
Path(sys.argv[2]).write_text(html)
print(sys.argv[2], len(html) // 1024, 'Ko')
