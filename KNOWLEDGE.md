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
