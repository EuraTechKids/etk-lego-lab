// ===== Lecture des fichiers .io de Studio (zip, chiffré ou non) =====
const IoZip = (function () {
  const PASSWORD = 'soho0909'; // mot de passe utilisé par BrickLink Studio pour ses fichiers .io
  const CRC = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; }
  const crc = (c, b) => (CRC[(c ^ b) & 0xff] ^ (c >>> 8)) >>> 0;

  function decrypt(data) {
    let k0 = 0x12345678, k1 = 0x23456789, k2 = 0x34567890;
    const upd = (c) => { k0 = crc(k0, c); k1 = (Math.imul((k1 + (k0 & 0xff)) >>> 0, 134775813) + 1) >>> 0; k2 = crc(k2, k1 >>> 24); };
    for (const ch of PASSWORD) upd(ch.charCodeAt(0));
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) { const t = (k2 | 2) & 0xffff; const c = data[i] ^ ((Math.imul(t, t ^ 1) >>> 8) & 0xff); out[i] = c; upd(c); }
    return out.subarray(12);
  }
  async function inflate(data) {
    if (typeof DecompressionStream === 'undefined') throw new Error('navigateur trop ancien pour décompresser');
    const s = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  async function open(buf) {
    const u = new Uint8Array(buf), dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
    let e = -1;
    for (let i = u.length - 22; i >= Math.max(0, u.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error("ce fichier n'est pas un .io valide");
    const count = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
    const entries = {};
    const dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      const name = dec.decode(u.subarray(p + 46, p + 46 + nl));
      entries[name] = { flags, method, csize, lo };
      p += 46 + nl + xl + cl;
    }
    return {
      names: Object.keys(entries),
      has: (n) => !!entries[n],
      async text(n) {
        const en = entries[n]; if (!en) return null;
        const start = en.lo + 30 + dv.getUint16(en.lo + 26, true) + dv.getUint16(en.lo + 28, true);
        let data = u.subarray(start, start + en.csize);
        if (en.method === 99) throw new Error('fichier .io chiffré en AES : non pris en charge');
        if (en.flags & 1) data = decrypt(data);
        if (en.method === 8) data = await inflate(data); else if (en.method !== 0) throw new Error('compression inconnue (' + en.method + ')');
        return new TextDecoder().decode(data);
      },
    };
  }
  return { open };
})();
if (typeof module !== 'undefined') module.exports = IoZip;
