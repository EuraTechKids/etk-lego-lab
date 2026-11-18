#!/usr/bin/env python3
"""Détection des pièces qui se traversent (EuraTech'Kids lab).

1. Tri : boîtes orientées (dans le repère de chaque pièce) qui se chevauchent,
   en ignorant les paires reliées (axe dans trou, tenon dans creux, pneu sur jante...).
2. Vérification fine : voxelisation des deux pièces (cubes de VOX LDU) par lancer
   de rayons, et mesure du volume commun.
Usage : collide.py modele.ldr [--seuil 600]  (seuil en LDU³ ; 1 tenon³ = 8000)
"""
import sys, argparse, numpy as np
from pathlib import Path
import snapcheck as S
from scipy.ndimage import binary_erosion

VOX = 1.0
EROD = 1.0   # LDU retirés de chaque côté : tolère un serrage de 2 LDU (tenons, pneus)

def triangles(lib, name, depth=0, memo={}):
    """Triangles (n,3,3) d'une pièce dans son repère local."""
    key = (id(lib), name)
    if key in memo: return memo[key]
    txt = lib.part_text(name); out = []
    if txt and depth < 14:
        for line in txt.splitlines():
            t = line.split()
            if not t: continue
            if t[0] == '3' and len(t) >= 11:
                out.append(np.array(t[2:11], float).reshape(3, 3))
            elif t[0] == '4' and len(t) >= 14:
                v = np.array(t[2:14], float).reshape(4, 3); out += [v[[0, 1, 2]], v[[0, 2, 3]]]
        for r in S.refs(txt):
            sub = triangles(lib, r['f'], depth + 1)
            if len(sub): out += list(sub @ r['R'].T + r['pos'])
    arr = np.array(out) if out else np.zeros((0, 3, 3))
    memo[key] = arr
    return arr

def obb(lib, p):
    b = lib.bbox(p['part'])
    if b is None: return None
    lo, hi = np.array(b[0], float), np.array(b[1], float)
    c = (lo + hi) / 2; h = (hi - lo) / 2
    return p['R'] @ c + p['pos'], p['R'], h          # centre monde, axes (colonnes de R), demi-tailles locales

def obb_overlap(A, B, tol=1.0):
    ca, Ra, ha = A; cb, Rb, hb = B
    axes = [Ra[:, i] for i in range(3)] + [Rb[:, i] for i in range(3)]
    axes = [a / np.linalg.norm(a) for a in axes if np.linalg.norm(a) > 1e-9]
    d = cb - ca
    for ax in axes:
        ra = sum(abs((Ra[:, i] @ ax)) * ha[i] for i in range(3))
        rb = sum(abs((Rb[:, i] @ ax)) * hb[i] for i in range(3))
        if abs(d @ ax) > ra + rb - tol: return False
    return True

def _column_fill(T, lo, n, vox, axis):
    """Remplissage par parité le long d'un axe, colonne par colonne (vectorisé)."""
    a1, a2 = (axis + 1) % 3, (axis + 2) % 3
    grid = np.zeros(n, bool)
    ga = lo[a1] + vox * (np.arange(n[a1]) + .5); gb = lo[a2] + vox * (np.arange(n[a2]) + .5)
    gz = lo[axis] + vox * (np.arange(n[axis]) + .5)
    A, B, C = T[:, 0], T[:, 1], T[:, 2]
    tmin = T.min(1); tmax = T.max(1)
    for i, x in enumerate(ga):
        sel = (tmin[:, a1] <= x) & (tmax[:, a1] >= x)
        if not sel.any(): continue
        a, b, c = A[sel], B[sel], C[sel]
        P = np.stack([np.full(len(gb), x), gb], 1)[:, None, :]          # (ny,1,2)
        a2d, b2d, c2d = a[:, [a1, a2]], b[:, [a1, a2]], c[:, [a1, a2]]
        v0 = (c2d - a2d)[None]; v1 = (b2d - a2d)[None]; v2 = P - a2d[None]
        d00 = (v0*v0).sum(-1); d01 = (v0*v1).sum(-1); d11 = (v1*v1).sum(-1)
        d20 = (v2*v0).sum(-1); d21 = (v2*v1).sum(-1)
        den = d00*d11 - d01*d01; ok = np.abs(den) > 1e-9; den = np.where(ok, den, 1)
        u = (d11*d20 - d01*d21)/den; v = (d00*d21 - d01*d20)/den
        hit = ok & (u >= -1e-6) & (v >= -1e-6) & (u + v <= 1 + 1e-6)
        z = a[None, :, axis] + u*(c - a)[None, :, axis] + v*(b - a)[None, :, axis]
        for j in np.nonzero(hit.any(1))[0]:
            zs = np.unique(np.round(z[j][hit[j]], 3))
            cnt = (zs[None, :] > gz[:, None]).sum(1)                    # intersections au-dessus
            col = (cnt % 2) == 1
            idx = [0, 0, 0]; idx[a1] = i; idx[a2] = j; idx[axis] = slice(None)
            grid[tuple(idx)] = col
    return grid

_GRIDS = {}
def local_grid(lib, name):
    """Volume plein (érodé de EROD) d'une pièce dans son repère, mis en cache."""
    if name in _GRIDS: return _GRIDS[name]
    T = triangles(lib, name); res = None
    if len(T):
        lo = T.reshape(-1, 3).min(0) - VOX; hi = T.reshape(-1, 3).max(0) + VOX
        vox = VOX
        while np.prod((hi - lo) / vox) > 3000000: vox *= 1.2
        n = tuple(int(np.ceil((hi[k] - lo[k]) / vox)) for k in range(3))
        votes = sum(_column_fill(T, lo, n, vox, ax).astype(int) for ax in (0, 1, 2))
        full = votes >= 2
        it = max(1, int(round(EROD / vox)))
        res = (lo, vox, binary_erosion(full, iterations=it), full.sum() * vox ** 3, full)
    _GRIDS[name] = res
    return res

def lookup(g, p, W, plein=False):
    lo, vox, G = g[0], g[1], (g[4] if plein else g[2])
    L = np.linalg.solve(p['R'], (W - p['pos']).T).T
    ij = np.floor((L - lo) / vox).astype(int)
    ok = np.all((ij >= 0) & (ij < np.array(G.shape)), 1)
    out = np.zeros(len(W), bool)
    out[ok] = G[ij[ok, 0], ij[ok, 1], ij[ok, 2]]
    return out

def world_tris(lib, p):
    t = triangles(lib, p['part'])
    return t @ p['R'].T + p['pos'] if len(t) else t

def check(path, shadow, ldraw, seuil=700.0, verbose=True):
    text = Path(path).read_text(errors='replace').lstrip('﻿')
    main, files = S.split_mpd(text)
    lib = S.Library(files, S.Shadow(shadow), ldraw)
    parts = S.flatten_model(main, files, lib)
    axe = {(min(i, j), max(i, j)) for i, j, k in S.analyse_links(parts, lib) if k in ('axe', 'axe-libre', 'axe-centre', 'cheville')}
    boxes = [obb(lib, p) for p in parts]
    cand = [(i, j) for i in range(len(parts)) for j in range(i + 1, len(parts))
            if boxes[i] is not None and boxes[j] is not None and obb_overlap(boxes[i], boxes[j], tol=2 * EROD) and (i, j) not in axe]
    hits = []
    for i, j in cand:
        ga, gb = local_grid(lib, parts[i]['part']), local_grid(lib, parts[j]['part'])
        if ga is None or gb is None: continue
        def wbox(g, p):
            lo, vox, G = g[0], g[1], g[2]; hi = lo + vox * np.array(G.shape)
            c = np.array([[x, y, z] for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])])
            w = c @ p['R'].T + p['pos']; return w.min(0), w.max(0)
        a0, a1 = wbox(ga, parts[i]); b0, b1 = wbox(gb, parts[j])
        lo, hi = np.maximum(a0, b0), np.minimum(a1, b1)
        if (hi - lo <= VOX).any(): continue
        vox = VOX
        while np.prod((hi - lo) / vox) > 400000: vox *= 1.2
        g = [np.arange(lo[k] + vox / 2, hi[k], vox) for k in range(3)]
        W = np.stack(np.meshgrid(*g, indexing='ij'), -1).reshape(-1, 3)
        m = lookup(ga, parts[i], W)
        if not m.any(): continue
        m[m] = lookup(gb, parts[j], W[m])
        vol = m.sum() * vox ** 3
        if vol > seuil: hits.append((parts[i]['part'], parts[j]['part'], round(float(vol)), i, j))
    if verbose:
        print(f"{Path(path).name} : {len(parts)} pièces, {len(cand)} paires suspectes, {len(hits)} collisions")
        for a, b, v, i, j in hits: print(f"   {a} (#{i}) × {b} (#{j}) : {v} LDU³")
    return hits

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('model', nargs='+'); ap.add_argument('--seuil', type=float, default=700)
    ap.add_argument('--shadow', default='ressources/LDCadShadowLibrary'); ap.add_argument('--ldraw', default='ressources/ldraw')
    a = ap.parse_args()
    for m in a.model: check(m, a.shadow, a.ldraw, a.seuil)
