# Connaissances de conception (kit WeDo 2.0 45300) — tirées des robots de Mathieu

Unités LDraw (LDU) : 1 tenon = 20, hauteur brique = 24, plaque = 8. Y vers le bas.

## Pièces clés
- **Moteur 21980** : x ±30, y -4..56 (tenons dessus à y 0), z -20..100. Face avant z=-20 : sortie d'axe (0,26), trous de cheville (±20,26).
- **Hub 19071c01** = boîtier à piles 19079 (6×8, dessous y 20..72) + hub 4 de large dessus ; colonnes de tenons libres à x ±50 (yeux 87087 + 14769).
- **Roue avec gros pneu** 55982 + 56891 : rayon 46. **Petite roue** 55982 + 92402 : rayon 38, centre à 26 LDU de la face de la brique Technic qui porte l'axe (TekNo).
- **Brique Technic** : trou à 10 LDU sous le dessus, entre les tenons.

## Mécanismes
- Engrenages coniques 12 dbl (32270) + 20 (32198), axes perpendiculaires : ≈30 entre centre du 12 et axe du 20, ≈17,35 entre centre du 20 et axe du 12.
- Engrenages parallèles : 12+20 ou 8+24 → entraxe 2 tenons (40).
- Vis sans fin 4716 + roue 24 dents 3648 : entraxe 40 (Monkey, toupiSpinner).
- Poulie élastique = 2 × 4185 dos à dos (écart ≈ 9) contre la face d'une brique Technic ; axes parallèles ; l'élastique n'est pas modélisé.

## Habitudes de conception
- Châssis : 2 briques Technic 1×8 (3702) en longerons + plaques Technic.
- Hub debout ou sur le côté (tête / dos). Yeux : 14769 sur 87087 ou 60474.
- Sous-ensembles Studio = modules (bras, jambes, yeux, groupe moteur).
- Capteur 20844 à l'avant pour la détection.

## Robots de référence (galerie)
MinerRobot, TekNo, walkbot generator, FightBot, Chrismastree, follow BlackLine, MadRobot, Monkey, moto1, SantaFarm, santaskiing, toupiSpinner, VernyWedo (+ Le Petit Bolide, généré).

## Statistiques de la galerie (13 robots, 1 224 pièces, 1 675 connexions)
Connexions : tenons 58 %, chevilles 10 %, axes 16 % (dont 7 % axes libres), rotules < 1 %, liaisons « contact » 12 % (surtout chaîne SantaFarm, pneus).
Pièces les plus utilisées : cheville 2780 (×50), plaque 1×2 3023 (×37), pente incurvée 42022 (×34), pente 45° 3040 (×34), axe 2 32062 (×29), plaque 1×4 3710 (×29), brique Technic 1×2 3700 (×29), poulie 4185 (×28).

## Bibliothèque de modules (modules/index.json — 42 modules)
- **articulation/antenne** : FightBot/submodel group 2 (7 p), MadRobot/submodel group 3 (7 p), Monkey/jambes1 (7 p), VernyWedo/submodel group 3 (9 p), moto1/submodel group 3 (5 p)
- **bras** : Monkey/arm1 (7 p), Monkey/arm2 (7 p)
- **engrenage** : Chrismastree/submodel group 1 (9 p), MadRobot/submodel group 1 (6 p), RobotLogoEuratechKids/submodel group 1 (4 p), RobotLogoEuratechKids/submodel group 3 (3 p), VernyWedo/submodel group 1 (3 p), follow_BlackLine/submodel group 1 (7 p), moto1/submodel group 2 (7 p), santaskiing/submodel group 1 (2 p)
- **jambe** : Monkey/jambes1 (7 p)
- **motorisation** : Chrismastree/submodel group 1 (9 p), MadRobot/submodel group 1 (6 p), RobotLogoEuratechKids/submodel group 3 (3 p), VernyWedo/submodel group 1 (3 p), follow_BlackLine/submodel group 3 (4 p), moto1/submodel group 2 (7 p)
- **poulie** : FightBot/submodel group 1 (26 p)
- **roue** : RobotLogoEuratechKids/submodel group 2 (2 p)
- **structure/déco** : Chrismastree/submodel group 11 (21 p), Chrismastree/submodel group 2 (10 p), Chrismastree/submodel group 3 (7 p), Chrismastree/submodel group 5 (5 p), Chrismastree/submodel group 6 (8 p), Chrismastree/submodel group 7 (2 p), Chrismastree/submodel group 8 (2 p), Chrismastree/submodel group 9 (2 p), Chrismastree/submodel group 10 (2 p), Monkey/1 (4 p), Monkey/2 (4 p), SantaFarm/submodel group 1 (6 p), SantaFarm/submodel group 3 (2 p), SantaFarm/submodel group 2 (5 p), VernyWedo/submodel group 2 (3 p), VernyWedo/submodel group 4 (7 p), VernyWedo/submodel group 5 (7 p), follow_BlackLine/submodel group 4 (2 p), moto1/submodel group 1 (4 p), walkbotgenerator/submodel group 1 (5 p), walkbotgenerator/submodel group 2 (5 p)
- **yeux/visage** : MadRobot/submodel group 2 (5 p), Monkey/eyes (4 p), santaskiing/submodel group 2 (30 p)

## Vérifications obligatoires d'un modèle généré
1. `snapcheck.py` : 0 îlot.
2. `collide.py` : 0 collision (seuil 700 LDU³).
3. `anchors.py` : pour assembler deux modules, relier un point **libre** de chacun (tenon↔creux, axe↔trou/trou-axe, cheville↔trou), directions opposées et alignées.

## Erreurs repérées dans la galerie
- Chrismastree : axes 87083 et 4519 sur la même ligne, chevauchement de 24 LDU (à corriger dans Studio).

## Variantes (ce qui marche)
- Dans le kit WeDo, il reste peu de grosses briques une fois la base construite (2 à 4 briques 2×4, 2 briques 1×4, 2 à 4 briques Technic). Le volume ajouté est donc limité : la variété vient surtout de la disposition et du 2e étage.
- Le bolide accepte l'essieu arrière du tracteur (3710 + 3010 + 3701 + axe 44294 + petites roues). Les feux 3062b passent alors en z 150 sur les plaques.
- Le tube central sous une brique (section de rayon 4) n'est pas un emplacement de tenon.

## Place du hub (validée sur 46 bases, 0 îlot, 0 collision)
- Le hub (6×8 tenons, x ±60, z ±80) repose sur 2 ou 4 briques 3001 (réhausses) posées sur le plateau ; sa position z doit être un multiple de 20.
- Tracteur : arrière z -60 (réhausses -60/-20), centre z -20 (-40/0), avant z 20 (20/60). Cabine avancée : pas de pont 3666, le capot reste tenu par le moteur.
- Bolide moyen/grand : avant z -40 (-60/-20), centre 0 (plateau entier), arrière z 40 (20/60). Le petit bolide garde le hub au centre (plateau trop court).

## Retours de Mathieu (18/11/2026)
- Préfère le bolide 4 roues au bolide à patin : tiré 3 fois sur 4.
- Variantes appréciées : bolides 4 roues (styles course et futuriste), tracteurs à cabine arrière avec ajouts de chantier.
- Aime que la place du hub change d'une variante à l'autre.

## Moto side-car (18/11/2026)
- Châssis du tracteur moins la petite roue avant droite. Moto à gauche : grande roue arrière motrice (x -59,6) alignée avec la petite roue avant (x -56). Side-car à droite : grande roue x +59, hub décalé de x +40 (nacelle au-dessus de la roue).
- Hub décalé de +40 : ses creux restent sur la grille des réhausses (multiple de 20). La colonne de tenons x -30 des réhausses reste libre pour la selle (3701).
- Guidon : 3701 sur le pont gauche (z 80) + axe 32062. Phare 3062b à z 150 sur la plaque du capot (remplace l'échappement gauche, les 6 briques rondes du kit sont prises en version grande).
- Stabilité : 3 appuis, centre de gravité vers x +19. Marge 18 à 36 LDU, mieux avec le hub à l'arrière.
- Limite : un plateau commun de 4 tenons de large, l'allure reste celle d'un petit véhicule asymétrique. À améliorer avec les retours de Mathieu.

## Stabilité (stability.py)
- Masses : hub avec piles 100 g, moteur 35 g, grand pneu 12 g, petit pneu 5 g ; le reste au volume (brique 2×4 = 2,3 g).
- Position de repos : face de l'enveloppe convexe tournée vers le bas, inclinée de 20° au plus (MinerRobot repose incliné de 8° sur son patin, comme en vrai).
- Marge minimale : 15 LDU. 12 robots de la galerie sur 13 sont stables ; la toupie ne l'est pas, ce qui est normal.
