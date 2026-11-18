import sys, numpy as np, re
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent.parent))
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import snapcheck as S, collide as C
cfg=open('ressources/ldraw/LDConfig.ldr').read()
COL={int(m.group(1)):m.group(2) for m in re.finditer(r'CODE\s+(\d+)\s+VALUE\s+(#[0-9A-Fa-f]{6})',cfg)}
files=sys.argv[2:]; fig=plt.figure(figsize=(16,4.6*((len(files)+3)//4)))
lib=S.Library({},S.Shadow('ressources/LDCadShadowLibrary'),'ressources/ldraw')
for n,f in enumerate(files):
    t=open(f).read(); m,fs=S.split_mpd(t); refs=S.refs(t)
    ax=fig.add_subplot((len(files)+3)//4,4,n+1,projection='3d'); polys=[];cols=[]
    for r in refs:
        T=C.triangles(lib,r['f'])
        if not len(T): continue
        W=T@r['R'].T+r['pos']; V=W[:,:,[0,2,1]]*[1,1,-1]; polys+=list(V)
        base=np.array(matplotlib.colors.to_rgb(COL.get(int(r['c']),'#888888')))
        nrm=np.cross(V[:,1]-V[:,0],V[:,2]-V[:,0]); nrm/=np.linalg.norm(nrm,axis=1,keepdims=True)+1e-9
        sh=0.45+0.55*np.abs(nrm@np.array([0.4,-0.5,0.77]))
        cols+=list(np.clip(base[None]*sh[:,None],0,1))
    pc=Poly3DCollection(polys,facecolors=cols,edgecolors='none',linewidths=0); pc.set_alpha(1); ax.add_collection3d(pc)
    P=np.concatenate(polys).reshape(-1,3); c=(P.max(0)+P.min(0))/2; r=(P.max(0)-P.min(0)).max()/2
    ax.set_xlim(c[0]-r,c[0]+r); ax.set_ylim(c[1]-r,c[1]+r); ax.set_zlim(c[2]-r,c[2]+r); ax.view_init(22,float(__import__('os').environ.get('AZIM','-130'))); ax.axis('off')
    ax.set_title(open(f).readline()[2:].strip()+f" · {len(refs)} p.",fontsize=10)
plt.tight_layout(); plt.savefig(sys.argv[1],dpi=80)
