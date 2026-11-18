#!/usr/bin/env python3
"""Pré-calcul des variantes du générateur (EuraTech'Kids lab).

Pour chaque base (forme × transmission × taille), on cherche toutes les poses possibles
de petits ajouts (catalogue ci-dessous) sur les tenons libres du dessus :
  - au moins un creux de l'ajout sur un tenon libre de la base (pas d'îlot) ;
  - aucune collision avec la base (même méthode que collide.py) ;
  - conflits entre poses (mêmes tenons ou collision) ;
  - pose symétrique (miroir gauche/droite) pour des variantes équilibrées.
Résultat : studio3d/variants.json, lu par gen.js.
Usage : node exporte les bases dans /tmp/v (voir tools/bases.mjs), puis python3 variants.py
"""
import json, itertools, numpy as np
from pathlib import Path
import snapcheck as S, collide as C, anchors as A

def Ry(k):
    c, s = [(1, 0), (0, 1), (-1, 0), (0, -1)][k % 4]
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], float)
I = np.eye(3)
X2Z = Ry(1)          # longueur le long de z
SLX = np.array([[0, 0, -1], [0, 1, 0], [1, 0, 0]], float)   # pente 4286 : creux le long de +x

# Catalogue d'ajouts : (nom, [(pièce, couleurs possibles, x, y, z, R)]) ; dessous de l'ajout à y = 0
CAT = [
    ('bloc', [('3001', [191, 322], 0, -24, 0, I)]),
    ('bloc-feux', [('3001', [191, 322], 0, -24, 0, I), ('3062b', [46, 34, 36], -30, -48, -10, I), ('3062b', [46, 34, 36], 30, -48, -10, I)]),
    ('bloc-radar', [('3001', [191, 322], 0, -24, 0, I), ('2654', [0], 0, -32, 0, I)]),
    ('bloc-capot', [('3001', [191, 322], 0, -24, 0, I), ('4286', [191], -30, -48, -10, SLX), ('4286', [191], -30, -48, 10, SLX)]),
    ('tourelle', [('3010', [322], 0, -24, 0, I), ('3062b', [46, 34, 36], -30, -48, 0, I), ('3062b', [46, 34, 36], 30, -48, 0, I)]),
    ('coin', [('3010', [322], 0, -24, 0, I), ('85984', [191], -20, -24, 0, I), ('85984', [191], 20, -24, 0, I)]),
    ('mur', [('3010', [322], 0, -24, 0, I)]),
    ('technic', [('3701', [27], 0, -24, 0, I)]),
    ('technic-court', [('3700', [27], 0, -24, 0, I)]),
    ('aile', [('3710', [15], 0, -8, 0, I), ('85984', [191], -20, -8, 0, I), ('85984', [191], 20, -8, 0, I)]),
    ('pente', [('85984', [191], 0, 0, 0, I)]),
    ('feu', [('3062b', [46, 34, 36], 0, -24, 0, I)]),
    ('radar', [('2654', [0], 0, -8, 0, I)]),
    ('plaque', [('3710', [15], 0, -8, 0, I)]),
    ('longue-plaque', [('3666', [15], 0, -8, 0, I)]),
    ('petite-plaque', [('3023b', [15], 0, -8, 0, I)]),
    ('rampe', [('4286', [191], 0, -24, 0, I)]),
]
SEUIL = 300.0
SYM = {'feu': 1, 'radar': 1, 'bloc': 2, 'mur': 2, 'technic': 2, 'technic-court': 2, 'plaque': 2, 'longue-plaque': 2, 'petite-plaque': 2, 'bloc-radar': 2, 'tourelle': 2}
STACK = {'bloc', 'mur', 'technic', 'technic-court', 'plaque', 'longue-plaque', 'petite-plaque'}
TOP = {'bloc', 'bloc-feux', 'bloc-radar', 'tourelle', 'coin', 'mur', 'feu', 'radar', 'pente', 'rampe', 'petite-plaque', 'aile'}
M = np.diag([-1., 1., 1.])

def key3(v): return tuple(int(round(x)) for x in v)

def placed_parts(addon, R, t):
    return [dict(part=f + '.dat', R=R @ Rl, pos=R @ np.array([x, y, z], float) + t, cols=cols)
            for f, cols, x, y, z, Rl in addon[1]]

def bottom_creux(lib, parts):
    out = []
    for p in parts:
        cr = [s.moved(p['R'], p['pos']) for s in lib.snaps_inferred(p['part'])]
        cr = [w for w in cr if w.gender == 'F' and A.kind(w) == 'creux' and w.a[1] > .9]
        # tube central (section de rayon 4) d'une brique : pas un emplacement de tenon
        if len(cr) > 1: cr = [w for w in cr if not any(abs(x[1] - 4) < .5 for x in w.secs)] or cr
        out += [w.p for w in cr]
    if not out: return []
    ymax = max(q[1] for q in out)
    return [q for q in out if abs(q[1] - ymax) < .5]

def pair_vol(lib, a, b):
    ga, gb = C.local_grid(lib, a['part']), C.local_grid(lib, b['part'])
    if ga is None or gb is None: return 0
    def wbox(g, p):
        lo, vox, G = g[0], g[1], g[2]; hi = lo + vox * np.array(G.shape)
        c = np.array(list(itertools.product(*zip(lo, hi))))
        w = c @ p['R'].T + p['pos']; return w.min(0), w.max(0)
    a0, a1 = wbox(ga, a); b0, b1 = wbox(gb, b)
    lo, hi = np.maximum(a0, b0), np.minimum(a1, b1)
    if (hi - lo <= 1).any(): return 0
    vox = 1.0
    while np.prod((hi - lo) / vox) > 300000: vox *= 1.2
    g = [np.arange(lo[k] + vox / 2, hi[k], vox) for k in range(3)]
    W = np.stack(np.meshgrid(*g, indexing='ij'), -1).reshape(-1, 3)
    m = C.lookup(ga, a, W)
    if not m.any(): return 0
    m[m] = C.lookup(gb, b, W[m])
    return m.sum() * vox ** 3

def bbox_w(lib, p):
    b = lib.bbox(p['part']); c = np.array(list(itertools.product(*zip(b[0], b[1]))))
    w = c @ p['R'].T + p['pos']; return w.min(0), w.max(0)

def search(lib, free, obst, obb, ground, ext, addons):
    """Poses des ajouts `addons` (indices CAT) entièrement posées sur les tenons `free`,
    sans collision avec les pièces `obst` (boîtes `obb`)."""
    cands, seen = [], set()
    for ai in addons:
        addon = CAT[ai]
        for k in range(SYM.get(addon[0], 4)):
            R = Ry(k)
            loc = bottom_creux(lib, placed_parts(addon, R, np.zeros(3)))
            for s in free:
                for q in loc:
                    t = np.array(s, float) - q
                    sig = (ai, k, key3(t))
                    if sig in seen: continue
                    seen.add(sig)
                    parts = placed_parts(addon, R, t)
                    foot = {key3(c) for c in bottom_creux(lib, parts)}
                    if not foot or foot - free: continue
                    ok = True
                    for p in parts:
                        lo, hi = bbox_w(lib, p)
                        if hi[1] > ground - 4 or (lo[[0, 2]] < ext[0] - 20).any() or (hi[[0, 2]] > ext[1] + 20).any(): ok = False; break
                        for j, q2 in enumerate(obst):
                            blo, bhi = obb[j]
                            if (np.minimum(hi, bhi) - np.maximum(lo, blo) <= 1).any(): continue
                            if pair_vol(lib, p, q2) > SEUIL: ok = False; break
                        if not ok: break
                    if ok: cands.append(dict(a=ai, parts=parts, foot=foot, k=k, t=t))
    uniq, sigs = [], set()
    for c in cands:
        sg = tuple(sorted((p['part'], key3(p['pos']), tuple(np.round(p['R'], 2).flatten() + 0.)) for p in c['parts']))
        if sg in sigs: continue
        sigs.add(sg); uniq.append(c)
    return uniq

def top_studs(lib, parts):
    """Tenons du dessus d'un ajout qui ne sont pas recouverts par ses propres pièces."""
    st, cr = set(), set()
    for p in parts:
        for s in lib.snaps_inferred(p['part']):
            w = s.moved(p['R'], p['pos'])
            if A.kind(w) == 'tenon' and w.a[1] > .9: st.add(key3(w.p))
            if A.kind(w) == 'creux' and w.a[1] > .9: cr.add(key3(w.p))
    return st - cr

def clearance(lib, base, bboxes, parts, hmax=72):
    """Hauteur libre (LDU, par pas de 8) au-dessus des tenons d'une pose, sur son emprise."""
    bb = [bbox_w(lib, p) for p in parts]
    lo = np.min([b[0] for b in bb], 0); hi = np.max([b[1] for b in bb], 0)
    top = lo[1]                               # dessus des tenons (y vers le bas)
    xs = np.arange(lo[0] + 2, hi[0] - 1, 4); zs = np.arange(lo[2] + 2, hi[2] - 1, 4)
    h = 0
    while h < hmax:
        ys = np.arange(top - h - 8 + 1, top - h, 2)
        W = np.stack(np.meshgrid(xs, ys, zs, indexing='ij'), -1).reshape(-1, 3)
        rlo, rhi = W.min(0), W.max(0)
        for j, q in enumerate(base):
            blo, bhi = bboxes[j]
            if (np.minimum(rhi, bhi) - np.maximum(rlo, blo) <= 0).any(): continue
            g = C.local_grid(lib, q['part'])
            if g is not None and C.lookup(g, q, W, plein=True).any(): return h
        h += 8
    return h

def solve_base(path):
    text = Path(path).read_text()
    main, files = S.split_mpd(text)
    lib = S.Library(files, S.Shadow('ressources/LDCadShadowLibrary'), 'ressources/ldraw')
    base = S.flatten_model(main, files, lib)
    fr = A.free_anchors(path)
    free = {key3(a['pos']) for a in fr['ancres'] if a['type'] == 'tenon' and a['dir'][1] > .9}
    bboxes = [bbox_w(lib, p) for p in base]
    ground = max(b[1][1] for b in bboxes)
    ext = (np.min([b[0] for b in bboxes], 0)[[0, 2]], np.max([b[1] for b in bboxes], 0)[[0, 2]])
    cands = search(lib, free, base, bboxes, ground, ext, range(len(CAT)))
    # hauteur libre au-dessus de chaque pose (pour un 2e étage posé par gen.js)
    for c in cands: c['h'] = clearance(lib, base, bboxes, c['parts'])
    # miroir gauche/droite ; on ne garde que les poses qui ont leur symétrique
    def geo(c, mir=False):
        T = M if mir else I
        return tuple(sorted((p['part'], key3(T @ p['pos']), tuple(np.round(T @ p['R'] @ T, 2).flatten() + 0.)) for p in c['parts']))
    gidx = {(c.get('par', -1), geo(c)): i for i, c in enumerate(cands)}
    mirror = {}
    for i, c in enumerate(cands):          # les supports (1er étage) précèdent leurs 2e étages
        mp = mirror.get(c['par'], -1) if 'par' in c else -1
        mirror[i] = -1 if ('par' in c and mp < 0) else gidx.get((mp, geo(c, True)), -1)
    ok = {i for i in range(len(cands)) if mirror[i] >= 0}
    changed = True
    while changed:
        changed = False
        for i in list(ok):
            if 'par' in cands[i] and cands[i]['par'] not in ok: ok.discard(i); changed = True
    out = []
    keep = sorted(ok)
    ren = {o: n for n, o in enumerate(keep)}
    for i in keep:
        c = cands[i]
        out.append([c['a'], c['k'], *key3(c['t']), ren[mirror[i]], c['h']])
    return out

def catalog(lib):
    """Catalogue exporté pour gen.js : pièces locales + boîte englobante de chaque pièce."""
    res = []
    for name, parts in CAT:
        pp = placed_parts((name, parts), I, np.zeros(3))
        top = sorted(top_studs(lib, pp)); foot = sorted(key3(q) for q in bottom_creux(lib, pp))
        height = -min(bbox_w(lib, p)[0][1] for p in pp)
        res.append([name, [[f, cols, x, y, z, [round(float(v), 3) for v in Rl.flatten()],
                             [round(float(v), 1) for v in np.concatenate(lib.bbox(f + '.dat'))]] for f, cols, x, y, z, Rl in parts],
                    [list(q) for q in foot], [list(q) for q in top] if name in STACK else [], round(float(height), 1), name in TOP])
    return res

if __name__ == '__main__':
    from collections import Counter
    lib = S.Library({}, S.Shadow('ressources/LDCadShadowLibrary'), 'ressources/ldraw')
    res = {'cat': catalog(lib), 'bases': {}}
    for f in sorted(Path('/tmp/v').glob('base-*.ldr')):
        k = f.stem[5:].replace('-', '|')
        res['bases'][k] = solve_base(str(f))
        print(k, len(res['bases'][k]), 'poses, hauteur libre moy.', round(float(np.mean([x[6] for x in res['bases'][k]])), 1), dict(Counter(CAT[x[0]][0] for x in res['bases'][k])))
    Path('studio3d/variants.json').write_text(json.dumps(res, separators=(',', ':')))
    print('taille', Path('studio3d/variants.json').stat().st_size // 1024, 'Ko')
