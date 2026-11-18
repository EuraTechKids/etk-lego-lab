import sys, glob, io, contextlib
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent.parent))
import snapcheck as S, collide as C
bad = []
for f in sorted(glob.glob('/tmp/vt/*.ldr')):
    with contextlib.redirect_stdout(io.StringIO()):
        a = S.analyse(f, 'ressources/LDCadShadowLibrary', 'ressources/ldraw')
        h = C.check(f, 'ressources/LDCadShadowLibrary', 'ressources/ldraw', 700, verbose=False)
    il = a['ilots'] if isinstance(a['ilots'], int) else len(a['ilots'])
    if il or h: bad.append((f.split('/')[-1], il, [(x[0], x[1], x[2]) for x in h], a.get('ilots')))
print(len(glob.glob('/tmp/vt/*.ldr')), 'modèles,', len(bad), 'en échec')
for b in bad[:20]: print(b)
