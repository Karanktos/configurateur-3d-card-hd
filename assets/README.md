# Pack d'assets réalistes pour le Configurateur 3D (v1)

Textures PBR et HDRI issus de **Poly Haven (CC0)**, préparés avec Blender. Phase 1 : sols, murs, textures de meubles, HDRI.
Phase 2 (livrée) : 27 modèles 3D GLB de meubles dans `models/`, décrits dans `materials.json > models`.

## Contenu
```
materials.json        catalogue lu par la carte (voir "Conventions")
CREDITS.md            source Poly Haven de chaque image
hdri/white_studio_05_1k.hdr
textures/<cle>/color.jpg | normal.jpg | arm.jpg        (1k)
textures/<cle>/512/color.jpg | normal.jpg | arm.jpg    (variante mobile)
```
Clés : `floor-<mat>` (40 sols, tous les ids du champ "mat" sauf `uni`), `wall-<finition>` (crepi, brique, lambris, beton, pierre, faience ; `peinture` reste sans texture), `misc-<tex>` (bois, tissu, laine, lames, granite). 50 textures au total, environ 33 Mo en 1k et 8 Mo en 512.
`materials.json` contient aussi `floors`, `walls`, `misc` : la table id du moteur -> clé de texture (`null` = pas de texture, comportement actuel).

## Conventions (à respecter dans la carte)
* **color.jpg** : albedo sRGB **recentré** (moyenne ramenée à un gris neutre, 0.80) pour que le sélecteur de couleurs continue de fonctionner (`material.color` x map). `colorDefault` = la couleur à appliquer par défaut pour retrouver l'aspect réel Poly Haven ; `avg` = couleur moyenne d'origine. Si l'utilisateur n'a pas choisi de couleur, utiliser `colorDefault`.
* **normal.jpg** : normales **OpenGL (+Y)**, Non-Color. Désactiver la `bumpMap` quand la normalMap est présente (sinon relief doublé).
* **arm.jpg** : R = occlusion ambiante (aoMap), V = rugosité (roughnessMap, à multiplier par `roughness`), B = métal (0, ignorer). Non-Color. Une seule image, donc 3 unités de texture par matière (color, normal, arm) : compter 3 et non 4 ou 5 dans `budgetShadows()`.
* **size** `[w, h]` en mètres = surface couverte par UNE répétition ; `u = x_monde / size[0]`, `v = z_monde / size[1]`, RepeatWrapping, anisotropie 8. Les UV restent ancrés sur l'origine de la maison.
* **pose: true** (sols à dalles reconstitués : travertin, gres, beton_60/80, marbre*, tile1/2/4) : le calepinage (dalles + joints + quinconce) est déjà dans l'image. Il faut **désactiver** le quinconce/« pose » du moteur pour ces matières ; la rotation `sens` et l'échelle utilisateur restent applicables. `tile` donne la dalle en mètres, `layout` le motif (grid, half, opus).
* **pose: false** : texture photo continue (parquets, pierre, carrelages décoratifs, etc.) ; le moteur peut appliquer sa rotation/échelle, mais le quinconce n'a pas de sens.
* **res** : charger `dir` (1k) sur ordinateur, `dir512` sur petit écran (< 700 px). Chargement paresseux, une matière à la fois ; repli sur la texture procédurale actuelle si un fichier manque.
* **hdri** : `hdri.file` (RGBE, via RGBELoader) remplace `RoomEnvironment` pour `scene.environment` uniquement (pas de fond, la vue publiée est transparente). `intensity` = valeur de départ pour `environmentIntensity` (0.55 aujourd'hui). PMREM calculé une seule fois.

## Points à ajuster côté carte
1. Les albédos Poly Haven sont physiquement plausibles donc plus sombres que les couleurs vives du moteur. Si l'ensemble paraît terne, ajuster `roughness`, `normalScale` ou l'exposition plutôt que le pack.
2. Chaque matière a un `colorDefault` calculé ; les pastilles de couleur du moteur multiplient toujours l'albedo recentré.
3. Les textures sont mises à l'échelle réelle ; `size` de `misc-tissu` et `misc-laine` est petit (≈ 0.27 m), c'est normal (tissage fin).
4. Brancher les `misc-*` sur les clés de texture déjà utilisées par les meubles (`bois` -> misc-bois, etc.).

## Limites connues de cette version
* Aucun contrôle visuel n'a été possible côté Blender pendant la fabrication (pas de rendu d'écran) : les choix de textures reposent sur les étiquettes Poly Haven et des mesures (couleur moyenne, détection de joints). Quelques matières peuvent demander un remplacement ; la clé et la source (`source`) de chacune sont dans `materials.json` et `CREDITS.md`.
* Les sols à dalles reconstitués utilisent une pierre de base répétée en miroir et recadrée hors joints.


## Modèles 3D (GLB) — 27 ids du catalogue
`baignoire`, `barbecue`, `canape2`, `canape3`, `canape_angle`, `chaise`, `chaise_bar`, `chauffeeau`, `chevet`, `fauteuil`, `ilot`, `lampe_poser`, `lavelinge`, `lit140`, `lit160`, `lit180`, `lit90`, `meubletv`, `plante`, `salon_jardin`, `seche`, `table`, `tablebasse`, `tabouret`, `tapis`, `tv`, `voiture1`

Ils remplacent la version procédurale **uniquement** pour ces ids ; tout le reste du catalogue (cuisine K, portes, fenêtres, etc.) reste procédural. Repli procédural obligatoire si un GLB est absent ou invalide.

### Conventions
* Unités : mètres. Origine : **centre de l'emprise, au sol** (z = 0). **Face avant = +Z glTF** (= -Y dans Blender). Compatible avec le repère du moteur (rot 0 = face avant vers le sud).
* Dimensions du GLB = **dimensions par défaut du catalogue** (`dims` = largeur, profondeur, hauteur). À mettre à l'échelle (p.w/dims[0], p.h/dims[2], p.d/dims[1]) ; non uniforme possible, mais préférer les ids `lock` à ±10 %.
* **Aucune lumière, caméra ni texture embarquée.** Matériaux nommés (liste dans `models.<id>.materials`). Cloner les matériaux par instance (découpe « murs coupés » écrit des clippingPlanes).
* `COLOR_0` = **occlusion ambiante cuite** (niveau de gris, multiplicative). `GLTFLoader` active `material.vertexColors` tout seul ; ne pas le désactiver, c'est ce qui donne les ombres de contact sous et entre les meubles. Ne pas passer ces GLB dans `mergeStatic` (il supprime les couleurs de sommets).
* UV en mètres (projection par boîte). Facultatif : `texMap` relie un nom de matériau à une texture du pack (`misc-bois`, `misc-tissu`, `floor-marbre`…) ; appliquer `map`/`normalMap`/`aoMap` avec `repeat = 1 / size`. Sinon, garder la couleur unie du matériau.
* **Couleurs c1..c3** : `slots` relie c1/c2/c3 à des noms de matériaux (couleur utilisateur × couleur du matériau). Mon découpage est une proposition : **recaler avec la colonne « couleurs » de docs/IMPORT-IA.md** (ex. si c2 = pieds pour un canapé, échanger).
* **Finition** (`fin`) : pour les lits, le matériau `cadre` suit mat/bois/brillant.

### Animations (valeur 0 → 1 par instance, comme `js/anim.js`)
Les pivots sont **l'origine du nœud** : le mouvement se fait donc simplement en appliquant la transformation sur le nœud nommé. Les angles sont en radians autour de l'axe Y de three.js ; **le signe est choisi pour ouvrir vers l'avant (+Z)** : si le sens est inversé chez toi, inverser le signe globalement.
* `rot` : `meubletv` (porte_1, porte_2 charnière à gauche, angle négatif ; porte_3 charnière à droite, angle positif), `lavelinge` et `seche` (hublot `porte`).
* `slide` (`by` = déplacement en mètres, +Z = vers l'avant) : tiroirs `tiroir_1..3` de `ilot`, `tiroir_1` de `chevet`.
* `scale` : nœud `couette` des lits, `axis: z` de 1 vers 0,45, **pivot à la tête du lit** (la couette se replie vers l'oreiller).
* `glow` (matériau émissif, `color`/`intensity` pour le niveau 1) : `tv` (matériau `ecran`), `lampe_poser` (`abatjour`), `chauffeeau` (`led`). Emissif à 0 par défaut dans le GLB.
* `light` : `lampe_poser` expose un nœud vide `ampoule` ; y accrocher la PointLight du moteur (la lampe de la carte, jamais dans le GLB).

### Limites
* Modélisation procédurale dans Blender, sans contrôle visuel direct (captures d'écran noires) : formes vérifiées par mesures et vues ASCII, mais le rendu final reste à juger dans HA. Les défauts de forme ou de proportion sont corrigeables modèle par modèle.
* `canape_angle` et `salon_jardin` : méridienne côté +x uniquement. Pour la variante inverse, appliquer une échelle x = -1 sur le groupe.
* Le `plante` est un feuillage stylisé de 38 feuilles ; remplaçable par un modèle Poly Haven plus riche plus tard.


### Historique des modèles
* **v2 (models_version 2)** : correction d'un défaut de génération qui ne laissait qu'**un seul coussin** par rangée. Désormais `canape2` (2 assises + 2 dossiers), `canape3` (3 + 3), `canape_angle` et `salon_jardin` (rangée complète + méridienne), lits `lit140/160/180` (2 oreillers symétriques), `fauteuil` (un coussin décoratif centré). **Tout contournement dans le code qui ajoutait ces coussins manquants doit être retiré**, sinon ils seront en double.
