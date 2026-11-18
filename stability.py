#!/usr/bin/env python3
"""Stabilité statique d'un modèle (EuraTech'Kids lab).

Centre de gravité (masses estimées) et polygone d'appui (points du modèle qui touchent le sol).
Marge = distance du centre de gravité au bord le plus proche du polygone (positive = stable).
Usage : stability.py modele.ldr [...]   (alerte si marge < 15 LDU, soit moins d'un tenon)
"""
import sys, numpy as np
from pathlib import Path
import snapcheck as S, collide as C

# masses connues (grammes) ; les autres pièces : au volume, sur la base d'une brique 2×4 = 2,3 g
MASS = {'19071c01.dat': 100.0,   # hub WeDo 2.0 avec 2 piles AA
        '21980.dat': 35.0, '56891.dat': 12.0, '92402.dat': 5.0}
MARGE_MIN = 15.0

def hull(pts):
    pts = sorted(set(map(tuple, np.round(pts, 1))))
    if len(pts) < 3: return pts
    cr = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def half(P):
        h = []
        for p in P:
            while len(h) >= 2 and cr(h[-2], h[-1], p) <= 0: h.pop()
            h.append(p)
        return h
    lo, hi = half(pts), half(pts[::-1])
    return lo[:-1] + hi[:-1]

def margin(h, p):
    """Distance signée de p au bord du polygone convexe h (sens trigonométrique), > 0 si dedans."""
    if len(h) < 3: return -1e9
    d = []
    for a, b in zip(h, h[1:] + h[:1]):
        e = np.subtract(b, a); n = np.array([-e[1], e[0]]) / np.linalg.norm(e)
        d.append(np.dot(np.subtract(p, a), n))
    return min(d)

def analyse(path, shadow='ressources/LDCadShadowLibrary', ldraw='ressources/ldraw'):
    text = Path(path).read_text(errors='replace').lstrip('﻿')
    main, files = S.split_mpd(text)
    lib = S.Library(files, S.Shadow(shadow), ldraw)
    parts = S.flatten_model(main, files, lib)
    ref = C.local_grid(lib, '3001.dat')[3]
    M, G, low = 0.0, np.zeros(3), []
    tris = [C.world_tris(lib, p) for p in parts]
    ground = max(t.reshape(-1, 3)[:, 1].max() for t in tris if len(t))
    for p, t in zip(parts, tris):
        if not len(t): continue
        g = C.local_grid(lib, p['part'])
        m = MASS.get(p['part'], 2.3 * (g[3] / ref) if g else 1.0)
        v = t.reshape(-1, 3)
        M += m; G += m * v.mean(0)
        low += [q for q in v if q[1] > ground - 10]
    G /= M
    # position de repos : face de l'enveloppe convexe tournée vers le bas (inclinaison ≤ 20°)
    from scipy.spatial import ConvexHull
    V = np.unique(np.round(np.concatenate([x.reshape(-1, 3) for x in tris if len(x)]), 0), axis=0)
    hl = ConvexHull(V)
    faces = {}
    for eq, simp in zip(hl.equations, hl.simplices):
        n, d = eq[:3], eq[3]
        if n[1] < np.cos(np.radians(20)): continue          # normale sortante vers le bas (y vers le bas)
        k = tuple(np.round(n, 2)) + (round(d, 0),)
        faces.setdefault(k, (n, set()))[1].update(simp)
    best = (-1e9, 0.0, 0)
    for n, idx in faces.values():
        P = V[list(idx)]
        u = np.cross(n, [1, 0, 0]); u /= np.linalg.norm(u); w = np.cross(n, u)
        pts = [(q @ u, q @ w) for q in P]
        h = hull(pts)
        mg = margin(h, (G @ u, G @ w)) if len(h) >= 3 else -1e9
        tilt = np.degrees(np.arccos(min(1, n[1])))
        if (mg, -tilt) > (best[0], -best[1]): best = (mg, tilt, len(h))
    mg, tilt, nh = best
    return dict(modele=Path(path).stem, masse=round(M), cdg=[round(float(x), 1) for x in G],
                inclinaison=round(float(tilt), 1), appuis=nh, marge=round(float(mg), 1), stable=mg >= MARGE_MIN)

if __name__ == '__main__':
    for f in sys.argv[1:]:
        r = analyse(f)
        print(f"{Path(f).name} : {r['masse']} g, centre de gravité x={r['cdg'][0]} z={r['cdg'][2]}, "
              f"posé incliné de {r['inclinaison']}°, marge {r['marge']} LDU {'OK' if r['stable'] else '⚠ risque de basculer'}")
