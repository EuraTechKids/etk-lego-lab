#!/usr/bin/env python3
"""Extrait le modèle d'un ou plusieurs .io Studio (chiffrés ou non) et passe chacun au vérificateur.
Usage : iocheck.py fichier1.io [...] [--out dossier] [--json resultats.json]"""
import sys, zipfile, json, argparse, re
from pathlib import Path
import snapcheck

def extract(io_path, out_dir):
    z = zipfile.ZipFile(io_path)
    name = next((n for n in ('model2.ldr', 'modelv2.ldr', 'model.ldr') if n in z.namelist()), None)
    if not name: raise ValueError('pas de modèle dans le .io')
    data = None
    for pwd in (None, b'soho0909'):
        try: data = z.read(name, pwd=pwd); break
        except RuntimeError: continue
    if data is None: raise ValueError('fichier protégé illisible')
    stem = re.sub(r'^[0-9a-f]{8}-', '', Path(io_path).stem)
    dst = Path(out_dir) / f'{stem}.ldr'
    dst.write_bytes(data)
    return dst

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('io', nargs='+'); ap.add_argument('--out', default='modeles')
    ap.add_argument('--json'); a = ap.parse_args()
    Path(a.out).mkdir(exist_ok=True); res = []
    for f in a.io:
        try:
            p = extract(f, a.out)
            r = snapcheck.analyse(p, 'ressources/LDCadShadowLibrary', 'ressources/ldraw'); res.append(r)
            print(f"{r['model']:<28} {r['pieces']:>4} pièces {r['connexions']:>4} connexions  îlots {len(r['ilots']):>2}  {r['types']}")
            for c in r['ilots']: print('      îlot :', ', '.join(c[:8]) + (' …' if len(c) > 8 else ''))
        except Exception as e: print(f, 'ERREUR', e)
    if a.json: Path(a.json).write_text(json.dumps(res, ensure_ascii=False, indent=1))
