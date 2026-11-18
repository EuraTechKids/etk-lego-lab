# EuraTech'Kids LEGO Lab

Outils pour apprendre à concevoir des robots LEGO (kit WeDo 2.0 45300) et vérifier leurs assemblages.

## Ressources (à cloner, non versionnées ici)
- Bibliothèque LDraw complète (formes 3D) : `git clone --depth 1 https://github.com/pybricks/ldraw.git`
- Bibliothèque de connexions LDCad (tenons, creux, trous, axes, rotules) : `git clone --depth 1 https://github.com/RolandMelkert/LDCadShadowLibrary.git`

## snapcheck.py — vérificateur de connexions
```
python3 snapcheck.py modele.ldr --shadow LDCadShadowLibrary --ldraw ldraw
```
Accepte un .ldr / .mpd, ou le `model2.ldr` extrait d'un `.io` de Studio (noms BrickLink gérés).

Ce qu'il fait :
- lit les points de connexion de chaque pièce (fiches LDCad + héritage des formes de base) ;
- apparie mâle/femelle : tenon↔creux, cheville↔trou, axe↔trou d'axe, rotules ;
- complète les manques : creux déduits sous les tenons, pneus sur jante, engrenages sur axe, et en dernier recours « contact » (pièces emboîtées) ;
- regroupe les pièces liées et signale les îlots (pièces qui ne tiennent à rien).

## Résultats de validation (18/11/2026)
| Modèle | Pièces | Connexions | Îlots |
|---|---|---|---|
| MinerRobot (Mathieu) | 103 | 149 | 0 |
| Le Petit Bolide | 40 | 53 | 0 |
| Le Petit Tracteur (engrenages) | 53 | 78 | 0 |
| Le Petit Tracteur (élastique) | 60 | 86 | 0 |
| Contre-test (2 pièces déplacées) | 60 | 80 | 2 détectés ✓ |

## Galerie de Mathieu (iocheck.py, 18/11/2026)
`python3 iocheck.py *.io --out modeles --json tests/resultats-galerie.json`
| Robot | Pièces | Connexions | Îlots | dont « contact » |
|---|---|---|---|---|
| walkbotgenerator_Copy | 95 | 128 | 0 | 6 |
| moto1 | 69 | 88 | 0 | 12 |
| RobotLogoEuratechKids_Copy | 104 | 151 | 0 | 9 |
| MinerRobot_Copy | 103 | 149 | 0 | 11 |
| Chrismastree | 69 | 92 | 0 | 16 |
| follow_BlackLine | 49 | 55 | 0 | 7 |
| VernyWedo | 132 | 173 | 0 | 10 |
| Monkey | 77 | 105 | 0 | 23 |
| MadRobot | 82 | 114 | 0 | 13 |
| SantaFarm | 155 | 203 | 0 | 82 |
| santaskiing | 106 | 154 | 0 | 18 |
| FightBot | 113 | 156 | 0 | 0 |
| toupiSpinner | 70 | 107 | 0 | 0 |

## collide.py — pièces qui se traversent
`python3 collide.py modele.ldr [--seuil 700]`
- Chaque type de pièce est voxelisé une fois (cubes de 1 LDU, remplissage par parité sur 3 axes, vote 2/3) puis érodé de 1 LDU : on tolère un serrage de 2 LDU (tenon dans un creux, pneu sur jante).
- Paires testées : boîtes orientées qui se chevauchent, sauf les liaisons axe/cheville (l'axe entre dans la pièce, c'est normal).
- Alerte si le volume commun dépasse 700 LDU³ (≈ 1/9 d'une plaque 1×2).
- Résultats (tests/resultats-collisions.txt), environ 20 s pour les 20 modèles :
  - 12 robots sur 13 : 0 collision. Les modèles générés (Bolide, tracteurs) : 0.
  - **Chrismastree** : les axes 87083 et 4519 sont sur la même ligne et se chevauchent de 24 LDU. C'est une vraie erreur du fichier Studio, impossible à monter tel quel.
  - Contre-test `tests/modeles/test-collision.ldr` (brique 3700 en double, décalée de 10 LDU) : détecté, 1 476 LDU³.

## anchors.py — points d'accroche libres
`python3 anchors.py modele.ldr [...] --json sortie.json`
- Types : tenon, creux (dessous d'une brique ou plaque), trou (trou Technic rond), trou-axe, axe, cheville, rotule.
- Un point est libre s'il n'a aucun partenaire compatible et si aucune autre pièce n'occupe sa place.
- Les tubes sous les plaques et les gorges de poulie sont ignorés.
- `modules/ancres.json` liste les accroches libres (position, direction, pièce) des 42 modules. C'est la base du générateur v2.

## Variantes du générateur (variants.py + studio3d/gen.js)
Chaque variante garde le mécanisme (moteur, transmission, roues) mais change la carrosserie :
- **arrière du bolide** : patin, ou essieu à 2 petites roues (bolide 4 roues) ;
- **style** tiré au hasard (costaud, futuriste, chantier, course, fantaisie), qui oriente le choix des ajouts ;
- **ajouts** (17 types : blocs, tourelles, feux, radars, ailes, pentes, briques Technic…) posés par paires symétriques sur les tenons libres ;
- **2e étage** : un ajout peut en porter un autre, dans la hauteur libre mesurée au-dessus ;
- jamais deux fois le même nombre de pièces ni la même combinaison pour un même réglage (historique dans le Studio).

Chaîne : `node tools/bases.mjs` (bases sans ajouts) → `python3 variants.py` (poses pré-vérifiées : appui complet sur des tenons libres, aucune collision avec la base, symétrique ; hauteur libre au-dessus) → `studio3d/variants.json` (136 Ko), intégré par `python3 tools/build.py modele.ldr sortie.html`.
Contrôle : `node tools/variantes-test.mjs 10 && python3 tools/verifie-variantes.py` → 120 variantes, 0 îlot, 0 collision (18/11/2026). Aperçu : `python3 tools/apercu.py sortie.png modele.ldr…`.

## Limites connues
- Les liaisons « contact » sont une approximation à surveiller.
- Pas de fiche de connexion LDCad pour : pneus 56891 / 92402, engrenage 32270 (gérés par règles de secours).
- Collisions : la sortie du moteur 21980 est pleine dans le modèle 3D. Un axe qui y entre sans être reconnu comme relié donne un faux volume (≈ 600 LDU³, sous le seuil).

## Prochaines étapes
1. Générateur v2 : assemblage de modules par points d'accroche libres, avec vérification automatique (snapcheck + collide).
2. Boucle de retour : Mathieu note les modèles générés, et les règles sont ajustées dans KNOWLEDGE.md.
