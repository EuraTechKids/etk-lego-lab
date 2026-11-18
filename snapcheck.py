#!/usr/bin/env python3
"""Vérificateur de connexions LEGO (EuraTech'Kids lab).

Lit un modèle LDraw (.ldr/.mpd ou model2.ldr d'un .io Studio), récupère la géométrie
des pièces (fichiers FILE embarqués) et les informations de connexion de la
bibliothèque LDCad (SNAP_CYL / SNAP_INCL / SNAP_CLEAR), puis :
  - liste les connexions (tenon/creux, cheville/trou, axe/trou),
  - repère les pièces qui ne tiennent à rien (îlots).
Usage : snapcheck.py modele.ldr --shadow chemin/LDCadShadowLibrary [--json]
"""
import sys, re, json, argparse, numpy as np
from pathlib import Path

def norm(s): return s.strip().replace('\\', '/').lower()

# ---------- lecture LDraw ----------
def split_mpd(text):
    files, cur, buf, main = {}, None, [], None
    for line in text.splitlines():
        m = re.match(r'\s*0\s+FILE\s+(.+?)\s*$', line, re.I)
        if m:
            if cur is not None: files[cur] = '\n'.join(buf)
            cur = norm(m.group(1)); buf = []
            if main is None: main = cur
            continue
        if cur is None and main is None: cur = main = '__main__'
        if cur is not None: buf.append(line)
    if cur is not None: files[cur] = '\n'.join(buf)
    return main, files

def refs(text):
    out, step = [], 0
    for line in text.splitlines():
        t = line.split()
        if not t: continue
        if t[0] == '0' and len(t) > 1 and t[1].upper() in ('STEP', 'ROTSTEP'): step += 1
        if t[0] == '1' and len(t) >= 15:
            v = list(map(float, t[2:14]))
            out.append(dict(c=t[1], pos=np.array(v[:3]), R=np.array(v[3:]).reshape(3, 3), f=norm(' '.join(t[14:])), step=step))
    return out

# ---------- bibliothèque de connexions ----------
class Shadow:
    def __init__(self, root):
        self.root = Path(root); self.cache = {}
    def text(self, name):
        name = norm(name)
        if name in self.cache: return self.cache[name]
        txt = None
        stem = name[:-4] if name.endswith('.dat') else name
        alts = [name, stem + 'b.dat', stem + 'a.dat', re.sub(r'[a-z]$', '', stem) + '.dat', re.sub(r'(pb?\d+)$', '', stem) + '.dat']
        for c in [f'{d}{n}' for n in alts for d in ('parts/', 'p/')]:
            p = self.root / c
            if p.exists(): txt = p.read_text(errors='replace'); break
        self.cache[name] = txt
        return txt

def parse_meta(line):
    m = re.match(r'\s*0\s+!LDCAD\s+(SNAP_\w+)\s*(.*)$', line)
    if not m: return None
    props = dict((k.lower(), v.strip()) for k, v in re.findall(r'\[(\w+)=([^\]]*)\]', m.group(2)))
    return m.group(1), props

def vec(s, n): return np.array(list(map(float, s.split()))[:n]) if s else None

def grid_offsets(g):
    if not g: return [np.zeros(3)]
    t = g.split(); i = 0; axes = []
    for _ in range(2):
        cen = False
        if t[i].upper() == 'C': cen = True; i += 1
        axes.append((cen, int(float(t[i])))); i += 1
    sx, sz = float(t[i]), float(t[i + 1])
    def vals(cen, n, s):
        return [(k - (n - 1) / 2) * s for k in range(n)] if cen else [k * s for k in range(n)]
    return [np.array([x, 0, z]) for x in vals(*axes[0], sx) for z in vals(*axes[1], sz)]

def parse_secs(s):
    t = s.split(); out = []
    for i in range(0, len(t) - 2, 3):
        shape = t[i].lstrip('_').upper()
        out.append((shape, float(t[i + 1]), float(t[i + 2])))
    return out

class Snap:
    __slots__ = ('p', 'a', 'gender', 'secs', 'center', 'src')
    def __init__(self, p, a, gender, secs, center, src):
        self.p, self.a, self.gender, self.secs, self.center, self.src = p, a, gender, secs, center, src
    def moved(self, R, t):
        a = R @ self.a; n = np.linalg.norm(a)
        return Snap(R @ self.p + t, a / n if n else a, self.gender, self.secs, self.center, self.src)
    def interval(self):
        L = sum(s[2] for s in self.secs)
        return (-L / 2, L / 2) if self.center else (0.0, L)

class Library:
    def __init__(self, files, shadow, ldraw=None):
        self.files, self.shadow, self.memo, self.ldraw, self.lcache = files, shadow, {}, Path(ldraw) if ldraw else None, {}
    def part_text(self, name):
        if name in self.files: return self.files[name]
        b = re.sub(r'^(48|8)/', '', name)
        if b in self.files: return self.files[b]
        if not self.ldraw: return None
        if name in self.lcache: return self.lcache[name]
        stem = name[:-4] if name.endswith('.dat') else name
        alts = [name, stem + 'b.dat', stem + 'a.dat', re.sub(r'[a-z]$', '', stem) + '.dat', re.sub(r'c\d\d$', '', stem) + '.dat', re.sub(r'(pb?\d+)$', '', stem) + '.dat']
        txt = None
        for n in alts:
            for d in ('parts/', 'p/', ''):
                p = self.ldraw / (d + n)
                if p.exists(): txt = p.read_text(errors='replace'); break
            if txt: break
        self.lcache[name] = txt
        return txt
    def shadow_snaps(self, name, depth=0):
        """Snaps décrits dans le fichier d'ombre (avec SNAP_INCL), + drapeau SNAP_CLEAR."""
        txt = self.shadow.text(name)
        out, clear = [], False
        if not txt or depth > 6: return out, clear
        for line in txt.splitlines():
            pm = parse_meta(line)
            if not pm: continue
            kind, pr = pm
            if kind == 'SNAP_CLEAR' and not pr.get('id'): clear = True; out = []
            ori = vec(pr.get('ori'), 9); R = ori.reshape(3, 3) if ori is not None else np.eye(3)
            pos = vec(pr.get('pos'), 3); pos = pos if pos is not None else np.zeros(3)
            offs = grid_offsets(pr.get('grid'))
            if kind == 'SNAP_CYL':
                secs = parse_secs(pr.get('secs', 'R 6 4'))
                base = Snap(np.zeros(3), np.array([0., 1., 0.]), pr.get('gender', 'M').upper(), secs,
                            pr.get('center', 'false').lower() == 'true', name)
                for o in offs: out.append(base.moved(R, pos + R @ o))
            elif kind == 'SNAP_GEN' and pr.get('bounding', '').lower().startswith('sph'):
                rad = float(pr['bounding'].split()[1])
                base = Snap(np.zeros(3), np.array([0., 1., 0.]), pr.get('gender', 'M').upper(), [('SPH', rad, 0.0)], True, name)
                for o in offs: out.append(base.moved(R, pos + R @ o))
            elif kind == 'SNAP_INCL' and pr.get('ref'):
                sub, _ = self.shadow_snaps(norm(pr['ref']), depth + 1)
                for o in offs:
                    for s in sub: out.append(s.moved(R, pos + R @ o))
        return out, clear
    def bbox(self, name, depth=0, _m={}):
        key = (id(self), name)
        if key in _m: return _m[key]
        txt = self.part_text(name); pts = []
        if txt and depth < 12:
            for line in txt.splitlines():
                t = line.split()
                if t and t[0] in ('3', '4') and len(t) >= 11:
                    v = list(map(float, t[2:2 + 3 * int(t[0])])); pts += [v[k:k + 3] for k in range(0, len(v), 3)]
            for r in refs(txt):
                b = self.bbox(r['f'], depth + 1)
                if b is not None:
                    for cx in (b[0][0], b[1][0]):
                        for cy in (b[0][1], b[1][1]):
                            for cz in (b[0][2], b[1][2]): pts.append(list(r['R'] @ np.array([cx, cy, cz]) + r['pos']))
        res = (np.min(pts, 0), np.max(pts, 0)) if pts else None
        _m[key] = res; return res
    def snaps_inferred(self, name):
        out = list(self.snaps(name))
        # creux sous les tenons pour les pièces qui n'en décrivent pas (pièces d'un tenon de large, Studio...)
        verticalF = [s for s in out if s.gender == 'F' and abs(s.a[1]) > 0.98]
        studs = [s for s in out if s.gender == 'M' and abs(s.a[1]) > 0.98 and s.secs and s.secs[0][0] == 'R' and abs(s.secs[0][1] - 6) < 0.6 and s.p[1] <= 0.5]
        b = self.bbox(name)
        if studs and not verticalF and b is not None and b[1][1] > 3:
            for s in studs:
                out.append(Snap(np.array([s.p[0], b[1][1], s.p[2]]), s.a, 'F', [('R', 6.0, 4.0)], False, 'inféré'))
        return out
    def snaps(self, name, depth=0):
        if name in self.memo: return self.memo[name]
        own, clear = self.shadow_snaps(name)
        out = list(own)
        txt = self.part_text(name)
        if txt and not clear and depth < 12:
            for r in refs(txt):
                for s in self.snaps(r['f'], depth + 1): out.append(s.moved(r['R'], r['pos']))
        self.memo[name] = out
        return out

# ---------- appariement ----------
def compatible(m, f):
    for sm in m.secs:
        for sf in f.secs:
            if sm[0] == 'A' and sf[0] == 'A' and abs(sm[1] - sf[1]) <= 1.5: return 'axe'
            if sm[0] == 'A' and sf[0] == 'R' and abs(sm[1] - sf[1]) <= 1.5: return 'axe-libre'
            if sm[0] == 'R' and sf[0] in ('R', 'S') and abs(sm[1] - sf[1]) <= 1.5: return 'tenon' if sm[1] == 6 and sm[2] <= 4.5 else 'cheville'
    return None

def connections(placed, tol=1.2):
    """placed: liste (index_piece, Snap monde). Renvoie liste (i, j, type)."""
    males = [(i, s) for i, s in placed if s.gender == 'M']
    fems = [(j, s) for j, s in placed if s.gender == 'F']
    found = {}
    # rotules : sphère mâle / femelle au même centre
    sph = [(i, s) for i, s in placed if s.secs and s.secs[0][0] == 'SPH']
    for a in range(len(sph)):
        for b in range(a + 1, len(sph)):
            (i, s), (j, u) = sph[a], sph[b]
            if i != j and s.gender != u.gender and np.linalg.norm(s.p - u.p) < 2: found[(min(i, j), max(i, j), 'rotule')] = 1
    males = [(i, s) for i, s in males if s.secs[0][0] != 'SPH']; fems = [(j, s) for j, s in fems if s.secs[0][0] != 'SPH']
    if not males or not fems: return list(found)
    FP = np.array([s.p for _, s in fems]); FA = np.array([s.a for _, s in fems])
    for i, m in males:
        lo, hi = m.interval()
        d = FP - m.p
        along = d @ m.a
        perp = np.linalg.norm(d - np.outer(along, m.a), axis=1)
        par = np.abs(FA @ m.a)
        for k in np.where((perp < tol) & (par > 0.98) & (np.abs(along) < 60))[0]:
            j, f = fems[k]
            if j == i: continue
            flo, fhi = f.interval()
            sgn = 1.0 if FA[k] @ m.a > 0 else -1.0
            a0, a1 = sorted((along[k] + sgn * flo, along[k] + sgn * fhi))
            if min(hi, a1) - max(lo, a0) < 0.5: continue
            typ = compatible(m, f)
            if typ: found[(min(i, j), max(i, j), typ)] = 1
    return list(found)

def flatten_model(main, files, lib):
    """Pièces posées (sous-modèles Studio dépliés)."""
    out = []
    def is_model(n): return n in files and re.search(r'^\s*0\s+IsSubModel\s+True', files[n], re.M | re.I) is not None or n == main
    def walk(n, R, t, depth):
        for r in refs(files[n]):
            R2, t2 = R @ r['R'], R @ r['pos'] + t
            if r['f'] in files and is_model(r['f']) and depth < 10: walk(r['f'], R2, t2, depth + 1)
            else: out.append(dict(part=r['f'], R=R2, pos=t2, step=r['step'] if depth == 0 else None))
    walk(main, np.eye(3), np.zeros(3), 0)
    return out

def analyse_links(parts, lib, nosnap=None):
    """Connexions (i, j, type) entre pièces posées."""
    nosnap = [] if nosnap is None else nosnap
    placed = []
    for i, p in enumerate(parts):
        ss = lib.snaps_inferred(p['part'])
        if not ss: nosnap.append(p['part'])
        for s in ss: placed.append((i, s.moved(p['R'], p['pos'])))
    con = connections(placed)
    # pièces sans info : pneu sur jante, engrenage sur axe (même centre / centre sur l'axe)
    origins = [p['pos'] for p in parts]
    axles = [(i, s) for i, s in placed if any(x[0] == 'A' for x in s.secs)]
    for k, p in enumerate(parts):
        if lib.snaps_inferred(p['part']): continue
        o = origins[k]; best = None
        for i, s in axles:
            if i == k: continue
            d = o - s.p; al = d @ s.a; lo, hi = s.interval()
            if np.linalg.norm(d - al * s.a) < 1.5 and lo - 3 <= al <= hi + 3: best = (i, 'axe-centre'); break
        if best is None:
            for i, q in enumerate(origins):
                if i != k and np.linalg.norm(q - o) < 3: best = (i, 'centre'); break
        if best: con.append((min(k, best[0]), max(k, best[0]), best[1]))
    # dernier recours : pièces emboîtées physiquement (boîtes englobantes qui se chevauchent nettement)
    boxes = []
    for p in parts:
        b = lib.bbox(p['part'])
        if b is None: boxes.append(None); continue
        cs = np.array([[x, y, z] for x in (b[0][0], b[1][0]) for y in (b[0][1], b[1][1]) for z in (b[0][2], b[1][2])])
        w = cs @ p['R'].T + p['pos']; boxes.append((w.min(0), w.max(0)))
    def comps_of(edges):
        par = list(range(len(parts)))
        def find(x):
            while par[x] != x: par[x] = par[par[x]]; x = par[x]
            return x
        for i, j, _ in edges: par[find(i)] = find(j)
        return find
    find0 = comps_of(con)
    roots = [find0(i) for i in range(len(parts))]
    from collections import Counter
    main_root = Counter(roots).most_common(1)[0][0]
    for k in range(len(parts)):
        if roots[k] == main_root or boxes[k] is None: continue
        for i in range(len(parts)):
            if roots[i] == roots[k] or boxes[i] is None: continue
            ov = np.minimum(boxes[k][1], boxes[i][1]) - np.maximum(boxes[k][0], boxes[i][0])
            if (ov > 1.5).all(): con.append((min(i, k), max(i, k), 'contact')); break
    return con

def analyse(path, shadow_root, ldraw_root=None):
    text = Path(path).read_text(errors='replace').lstrip('﻿')
    main, files = split_mpd(text)
    lib = Library(files, Shadow(shadow_root), ldraw_root)
    parts = flatten_model(main, files, lib)
    nosnap = []
    con = analyse_links(parts, lib, nosnap)
    # composantes connexes
    par = list(range(len(parts)))
    def find(x):
        while par[x] != x: par[x] = par[par[x]]; x = par[x]
        return x
    for i, j, _ in con: par[find(i)] = find(j)
    comps = {}
    for i in range(len(parts)): comps.setdefault(find(i), []).append(i)
    big = max(comps.values(), key=len)
    isl = [c for c in comps.values() if c is not big]
    types = {}
    for _, _, t in con: types[t] = types.get(t, 0) + 1
    return dict(model=Path(path).name, pieces=len(parts), connexions=len(con), types=types,
                sans_info=sorted(set(nosnap)), bloc_principal=len(big),
                ilots=[[parts[k]['part'] for k in c] for c in isl])

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('model'); ap.add_argument('--shadow', required=True); ap.add_argument('--ldraw'); ap.add_argument('--json', action='store_true')
    a = ap.parse_args(); res = analyse(a.model, a.shadow, a.ldraw)
    if a.json: print(json.dumps(res, ensure_ascii=False, indent=1))
    else:
        print(f"{res['model']} : {res['pieces']} pièces, {res['connexions']} connexions {res['types']}")
        print(f"  bloc principal : {res['bloc_principal']} pièces ; îlots : {len(res['ilots'])}")
        for c in res['ilots']: print('   -', ', '.join(c))
        if res['sans_info']: print('  pièces sans info de connexion :', ', '.join(res['sans_info']))
