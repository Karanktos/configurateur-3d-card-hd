# Style « sobre » : écarts avec plan-3d-live-card et paramètres repris

Le style `sobre` (YAML `style: sobre`, ou bouton **Sobre** de la barre de la vue maison) reproduit le rendu de la carte plan-3d-live-card.
Le style `standard` reste le défaut et n'est pas modifié (comparaison pixel à pixel avant/après : écart moyen 0,2 / 255).

## Écarts relevés entre les deux moteurs

| | plan-3d-live-card (three r147) | configurateur (three r170) |
|---|---|---|
| Tone mapping | ACESFilmic, exposition 0,66 (jour) → 1,0 (nuit) | Neutral, exposition ~0,9 à 1,05 |
| Gestion des couleurs | « legacy » : les teintes hexadécimales sont utilisées telles quelles dans les calculs (donc plus claires), lumières ×π | colorimétrie linéaire, lumières physiques |
| Hémisphère | jour 0,28 (ciel `#eef3ff`, sol `#8a7d6a`), nuit 0,10 (`#5a6f9a` / `#141824`) | jusqu'à 0,95, teintes plus claires |
| Ambiance | AmbientLight 0,04 (jour) / 0,05 (nuit) | aucune |
| Soleil | 0,95, `#fff0da`, lune 0,09 `#8fa6d6` | 2,4, lune 0,22 |
| Environnement | RoomEnvironment, intensité 0,16 / 0,05 | 0,07 à 0,55 (+ HDRI du pack) |
| Ombres | PCFSoft 4096, bias −3e-4, normalBias 0,02 | PCF 4096, rayon 3, bias −4e-4, normalBias 0,03 |
| Occlusion | SSAO demi-résolution, force 0,75, + bandes peintes au pied des murs | GTAO pleine résolution, force 0,85 + mêmes bandes |
| Bloom | aucun : halos = sprites additifs 0,9 m (×1,3 jour, ×1,15 soir) | bloom (seuil 0,95) + sprites 0,6–1,2 m |
| Lampes | puissance ×1,8 le jour, ×1,05 le soir | ×1 le jour, ×1,35 le soir |
| Murs | `#f3f0ea` mats (rugosité 0,95), extérieur `#eee3cf`, chapeau `#3e3b37` | finitions du plan, dessus `#d9d4cb` |
| Terrain | flancs de terre `#5d5444`, dessus gravier texturé | dalle texturée |
| Textures | procédurales + bump léger (0,01–0,05) | pack PBR (normal ×1) |
| pixelRatio | min(devicePixelRatio, 2, 2600/largeur) | min(devicePixelRatio, 2) |
| Fond | transparent | transparent |

## Paramètres repris en style sobre (`js/style.js`)

- ACES, exposition 0,80 (jour) / 1,0 (nuit) ; contraste de sortie 1,12 (fort).
- Lumières : soleil 0,95·π, lune 0,09·π, hémisphère 0,28·π / 0,10·π, ambiance 0,04·π / 0,09·π, environnement 0,16·π / 0,05·π ; teintes d'hémisphère et d'ambiance interprétées comme dans le moteur d'origine (sans conversion sRGB).
- Luminaires ×1,8 le jour, ×4 le soir ; halos ×1,67 (jour) / ×1,48 (soir) de leur taille de base ; bloom plus large (force 0,45, rayon 0,35, seuil 0,85) ; occlusion 0,75.
- Ambiance de soirée : en mode Auto, dès qu'une lumière est allumée le ciel passe en fondu (1,5 s) au crépuscule (soleil à −3°) ; désactivée en Jour / Soir forcés.
- Palette désaturée de 28 % (sols, murs, terrain) ; dessus des murs gris mat `#6a6a69` (éclairé : ~`#8d8a83`) ; terrain uni `#6a694f` sans texture (la couleur du plan est conservée si elle est définie).
- Murs mats (rugosité ≥ 0,95), sols ≥ 0,6.
- Textures du pack : relief (normalScale) ×0,3, albédo ramené à 55 % de son contraste (mélange avec sa version très floue), anisotropie maximale du GPU ; mur de pierre extérieur adouci de la même façon.
- `wallCap` (YAML, défaut `false`) : `true` pose un chapeau sombre `#3e3b37` sur les murs, dans les deux styles.

## Ce qui n'est pas repris

Les couleurs des meubles et des modèles 3D ne sont pas désaturées (seulement sols, murs, terrain). Les textures de meubles du pack sont atténuées comme les sols.
