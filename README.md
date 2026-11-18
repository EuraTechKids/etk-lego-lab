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

## Limites connues
- Pas encore de détection des collisions réelles (pièces qui se traversent).
- Les liaisons « contact » sont une approximation à surveiller.
- Pas de fiche de connexion LDCad pour : pneus 56891 / 92402, engrenage 32270 (gérés par règles de secours).

## Prochaines étapes
1. Détection des collisions (maillages).
2. Passer les 13 robots de Mathieu au vérificateur, puis les découper en modules avec points d'accroche.
3. Générateur v2 : assemblage de modules par points d'accroche, vérification automatique.
