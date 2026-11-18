// ===== Moteur LDraw (sans DOM) : lecture .ldr/.mpd, étapes, inventaire, aplatissement des pièces =====
const LDCore = (function () {
  const norm = (s) => s.trim().replace(/\\/g, '/').toLowerCase();

  // Découpe un fichier .ldr ou .mpd en sous-fichiers
  function splitModel(text) {
    const files = new Map();
    const lines = text.split(/\r?\n/);
    let cur = null, buf = [], main = null;
    const flush = () => { if (cur !== null) files.set(cur, buf.join('\n')); };
    for (const line of lines) {
      const m = line.match(/^\s*0\s+FILE\s+(.+?)\s*$/i);
      if (m) { flush(); cur = norm(m[1]); buf = []; if (main === null) main = cur; continue; }
      if (/^\s*0\s+NOFILE\b/i.test(line)) { flush(); cur = null; buf = []; continue; }
      if (cur === null && main === null) { cur = '__main__'; main = cur; }
      if (cur !== null) buf.push(line);
    }
    flush();
    return { main, files };
  }

  // Studio (fichiers model2 d'un .io) écrit les couleurs avec les numéros BrickLink : -1 = couleur héritée, -2 = contour
  const BL2LD = { '-1': '16', '-2': '24', 1: 15, 2: 19, 3: 14, 4: 25, 5: 4, 6: 2, 7: 1, 8: 6, 9: 7, 10: 8, 11: 0, 12: 47, 13: 40, 14: 33,
    15: 43, 16: 42, 17: 36, 18: 38, 19: 46, 20: 34, 21: 334, 22: 383, 23: 13, 24: 22, 34: 27, 36: 10, 42: 73, 47: 5, 59: 320, 63: 272,
    69: 28, 80: 288, 85: 72, 86: 71, 88: 70, 110: 191, 156: 322, 157: 30, 39: 3, 103: 226, 105: 212, 120: 158, 158: 74, 160: 78 };
  const blColor = (c) => (BL2LD[c] !== undefined ? String(BL2LD[c]) : c);

  // Analyse un fichier LDraw
  function parse(text) {
    const out = { title: '', refs: [], tris: [], lines: [], nSteps: 0 };
    const bl = /^\s*0\s+IsSubModel\s+(True|False)\b/im.test(text);
    const col = bl ? blColor : (c) => c;
    let step = 0, first = true;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      const t = line.split(/\s+/);
      const type = t[0];
      if (type === '0') {
        if (first && t.length > 1 && !/^(!|FILE|STEP|Name:|Author:|BFC)/i.test(t[1])) out.title = line.slice(1).trim();
        if (/^(STEP|ROTSTEP)$/i.test(t[1] || '')) step++;
        first = false;
        continue;
      }
      first = false;
      if (type === '1' && t.length >= 15) {
        const n = t.slice(2, 14).map(Number);
        out.refs.push({ c: col(t[1]), m: n, f: norm(t.slice(14).join(' ')), step });
      } else if (type === '3' && t.length >= 11) {
        out.tris.push({ c: col(t[1]), v: t.slice(2, 11).map(Number) });
      } else if (type === '4' && t.length >= 14) {
        const v = t.slice(2, 14).map(Number);
        out.tris.push({ c: col(t[1]), v: [v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8]] });
        out.tris.push({ c: col(t[1]), v: [v[0], v[1], v[2], v[6], v[7], v[8], v[9], v[10], v[11]] });
      } else if (type === '2' && t.length >= 8) {
        out.lines.push({ c: col(t[1]), v: t.slice(2, 8).map(Number) });
      }
    }
    // dernière étape non fermée
    const last = out.refs.length ? out.refs[out.refs.length - 1].step : -1;
    out.nSteps = Math.max(step, last + 1);
    return out;
  }

  // m = [x y z a b c d e f g h i]
  function compose(P, C) {
    const [px, py, pz, a, b, c, d, e, f, g, h, i] = P;
    const [cx, cy, cz, A, B, Cc, D, E, F, G, H, I] = C;
    return [
      a * cx + b * cy + c * cz + px, d * cx + e * cy + f * cz + py, g * cx + h * cy + i * cz + pz,
      a * A + b * D + c * G, a * B + b * E + c * H, a * Cc + b * F + c * I,
      d * A + e * D + f * G, d * B + e * E + f * H, d * Cc + e * F + f * I,
      g * A + h * D + i * G, g * B + h * E + i * H, g * Cc + h * F + i * I,
    ];
  }
  const IDENT = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];

  function resolveColor(child, parent) {
    if (child === '16') return parent;
    if (child === '24') return parent === '16' ? '24' : 'e:' + parent;
    return child;
  }

  // Liste des pièces posées (sous-modèles MPD dépliés), avec l'étape du modèle principal
  function placements(model) {
    const parsed = new Map();
    const get = (n) => { if (!parsed.has(n)) parsed.set(n, parse(model.files.get(n))); return parsed.get(n); };
    const main = get(model.main);
    const out = [];
    const walk = (p, M, col, step, depth) => {
      for (const r of p.refs) {
        const m = compose(M, r.m), c = resolveColor(r.c, col);
        if (model.files.has(r.f) && depth < 20) walk(get(r.f), m, c, step, depth + 1);
        else out.push({ part: r.f, color: c, m, step });
      }
    };
    for (const r of main.refs) {
      if (model.files.has(r.f)) walk(get(r.f), r.m, r.c, r.step, 1);
      else out.push({ part: r.f, color: r.c, m: r.m, step: r.step });
    }
    return { list: out, nSteps: main.nSteps, title: main.title };
  }

  // Aplatit une pièce (et ses primitives) en triangles/lignes par couleur, en coordonnées locales
  function flatten(name, parsed, memo, missing) {
    if (memo.has(name)) return memo.get(name);
    const out = { tri: new Map(), lin: new Map() };
    memo.set(name, out);
    const p = parsed.get(name);
    if (!p) { missing.add(name); return out; }
    const push = (map, c, v) => { let a = map.get(c); if (!a) map.set(c, a = []); for (const x of v) a.push(x); };
    for (const t of p.tris) push(out.tri, t.c, t.v);
    for (const l of p.lines) push(out.lin, l.c, l.v);
    for (const r of p.refs) {
      const sub = flatten(r.f, parsed, memo, missing);
      const [x, y, z, a, b, c, d, e, f, g, h, i] = r.m;
      for (const [key, map] of [['tri', sub.tri], ['lin', sub.lin]]) {
        for (const [cc, arr] of map) {
          const nc = resolveColor(cc, r.c);
          let dst = out[key].get(nc); if (!dst) out[key].set(nc, dst = []);
          for (let k = 0; k < arr.length; k += 3) {
            const X = arr[k], Y = arr[k + 1], Z = arr[k + 2];
            dst.push(a * X + b * Y + c * Z + x, d * X + e * Y + f * Z + y, g * X + h * Y + i * Z + z);
          }
        }
      }
    }
    return out;
  }

  // Charge récursivement toutes les sous-pièces nécessaires via read(name) -> Promise<string|null>
  async function gather(names, read, parsed, onProgress) {
    const queue = [...new Set(names)], seen = new Set(queue);
    let done = 0;
    while (queue.length) {
      const batch = queue.splice(0, 32);
      const texts = await Promise.all(batch.map((n) => read(n)));
      batch.forEach((n, k) => {
        done++;
        if (texts[k] == null) return;
        const p = parse(texts[k]);
        parsed.set(n, p);
        for (const r of p.refs) if (!seen.has(r.f)) { seen.add(r.f); queue.push(r.f); }
      });
      if (onProgress) onProgress(done, seen.size);
    }
  }

  // Candidats de chemin dans une bibliothèque LDraw
  function candidates(ref) {
    return ['parts/' + ref, 'p/' + ref, ref, 'unofficial/parts/' + ref, 'unofficial/p/' + ref,
      'customparts/parts/' + ref, 'customparts/p/' + ref, 'models/' + ref];
  }

  function libraryIndex(paths) {
    const idx = new Map();
    for (const full of paths) {
      const p = norm(full);
      if (!p.endsWith('.dat') && !p.endsWith('.ldr')) continue;
      const segs = p.split('/');
      for (let s = 0; s < segs.length; s++) {
        const k = segs.slice(s).join('/');
        const prev = idx.get(k);
        if (!prev || norm(prev).length > p.length) idx.set(k, full);
      }
    }
    return idx;
  }

  function lookup(idx, ref) {
    for (const c of candidates(ref)) if (idx.has(c)) return idx.get(c);
    return null;
  }

  function parseLDConfig(text) {
    const res = {};
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/!COLOUR\s+(\S+)\s+CODE\s+(\d+)\s+VALUE\s+#([0-9A-Fa-f]{6})\s+EDGE\s+#?([0-9A-Fa-f]{6}|\d+)(.*)$/);
      if (!m) continue;
      const a = (m[5].match(/ALPHA\s+(\d+)/) || [])[1];
      res[m[2]] = [m[1].replace(/_/g, ' '), '#' + m[3], a ? Number(a) : 255, /^[0-9A-Fa-f]{6}$/.test(m[4]) ? '#' + m[4] : null];
    }
    return res;
  }

  return { norm, splitModel, parse, placements, flatten, gather, libraryIndex, lookup, compose, IDENT, parseLDConfig, resolveColor };
})();
if (typeof module !== 'undefined') module.exports = LDCore;
