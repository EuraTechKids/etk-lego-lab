#!/usr/bin/env python3
"""Points d'accroche libres d'un modèle ou d'un module (EuraTech'Kids lab).

Un point est « libre » s'il n'est associé à aucun partenaire compatible dans le modèle
et si aucune autre pièce n'occupe sa place. Types : tenon, creux (sous une brique),
trou (trou rond Technic), trou-axe (trou en croix), axe, cheville.
Usage : anchors.py modele.ldr [...] [--json sortie.json]
"""
import sys, json, argparse, numpy as np
from pathlib import Path
from collections import Counter
import snapcheck as S, collide as C

def kind(s):
    """Type d'accroche ; None = sans intérêt pour construire (tubes sous plaque, gorge de poulie...)."""
    secs = s.secs; sec = secs[0]
    rad = {round(x[1]) for x in secs if x[0] in ('R', 'S', 'L', 'L_')}
    if sec[0] == 'SPH': return 'rotule-' + s.gender
    if s.gender == 'M':
        if any(x[0] == 'A' for x in secs): return 'axe'
        if len(secs) == 1 and sec[0] == 'R' and abs(sec[1] - 6) < .6 and sec[2] <= 4.5: return 'tenon'
        if 6 in rad and (8 in rad or sum(x[2] for x in secs) >= 12) and max(rad) <= 8: return 'cheville'
        return None
    if any(x[0] == 'A' for x in secs): return 'trou-axe'
    if 8 in rad and 6 in rad: return 'trou'
    if 6 in rad and max(rad) <= 6: return 'creux'
    return None

def used_mask(placed, tol=1.2):
    used = [False] * len(placed)
    M = [k for k, (i, s) in enumerate(placed) if s.gender == 'M' and s.secs[0][0] != 'SPH']
    F = [k for k, (i, s) in enumerate(placed) if s.gender == 'F' and s.secs[0][0] != 'SPH']
    if M and F:
        FP = np.array([placed[k][1].p for k in F]); FA = np.array([placed[k][1].a for k in F])
        for km in M:
            i, m = placed[km]; lo, hi = m.interval()
            d = FP - m.p; al = d @ m.a
            perp = np.linalg.norm(d - np.outer(al, m.a), axis=1)
            for q in np.where((perp < tol) & (np.abs(FA @ m.a) > .98) & (np.abs(al) < 60))[0]:
                j, f = placed[F[q]]
                if j == i: continue
                flo, fhi = f.interval(); sg = 1. if FA[q] @ m.a > 0 else -1.
                a0, a1 = sorted((al[q] + sg * flo, al[q] + sg * fhi))
                if min(hi, a1) - max(lo, a0) >= .5 and S.compatible(m, f): used[km] = used[F[q]] = True
    sph = [k for k, (i, s) in enumerate(placed) if s.secs[0][0] == 'SPH']
    for a in sph:
        for b in sph:
            if placed[a][0] != placed[b][0] and placed[a][1].gender != placed[b][1].gender and np.linalg.norm(placed[a][1].p - placed[b][1].p) < 2:
                used[a] = used[b] = True
    return used

def free_anchors(path, shadow='ressources/LDCadShadowLibrary', ldraw='ressources/ldraw'):
    text = Path(path).read_text(errors='replace').lstrip('﻿')
    main, files = S.split_mpd(text)
    lib = S.Library(files, S.Shadow(shadow), ldraw)
    parts = S.flatten_model(main, files, lib)
    placed = [(i, s.moved(p['R'], p['pos'])) for i, p in enumerate(parts) for s in lib.snaps_inferred(p['part'])]
    used = used_mask(placed)
    grids = [C.local_grid(lib, p['part']) for p in parts]
    out, seen = [], set()
    for k, (i, s) in enumerate(placed):
        if used[k] or kind(s) is None: continue
        lo, hi = s.interval(); c = s.p + s.a * (lo + hi) / 2
        key = (kind(s), tuple(np.round(c, 0)), tuple(np.round(np.abs(s.a), 2)))
        if key in seen: continue            # doublons (sections multiples d'un même trou)
        seen.add(key)
        # bouché par une autre pièce ?
        blocked = False
        for j, g in enumerate(grids):
            if j == i or g is None: continue
            if np.linalg.norm(parts[j]['pos'] - c) > 200: continue
            if C.lookup(g, parts[j], c[None], plein=True)[0]: blocked = True; break
        if blocked: continue
        out.append(dict(type=kind(s), piece=parts[i]['part'], pos=[round(float(x), 1) for x in s.p],
                        dir=[round(float(x), 2) for x in s.a]))
    return dict(robot=Path(path).parent.name, modele=Path(path).stem, fichier=str(path), pieces=len(parts), libres=dict(Counter(a['type'] for a in out)), ancres=out)

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('model', nargs='+'); ap.add_argument('--json')
    a = ap.parse_args(); res = []
    for m in a.model:
        r = free_anchors(m); res.append(r)
        print(f"{r['robot']}/{r['modele']} : {r['pieces']} pièces, accroches libres {r['libres']}")
    if a.json: Path(a.json).write_text(json.dumps(res, ensure_ascii=False, indent=1))
