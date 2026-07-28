# CMY Imprimerie Design — proposition 2 : « Deux vies »

Site statique en HTML / CSS / JavaScript, sans dépendance ni build.

```bash
cd docs && python3 -m http.server 8777   # puis http://localhost:8777/v2/
```

La proposition 1 (grille suisse Müller-Brockmann, encres CMY) reste dans `docs/`.
Les deux sont indépendantes : mêmes informations, même client, deux partis pris opposés.

## Le parti pris

Une enseigne existe **deux fois**. Le jour, elle tient par sa matière et son relief.
La nuit, elle ne tient plus que par sa lumière. C'est le seul produit du client dont la
valeur change complètement selon l'heure — et c'est ce que le site met en scène.

**L'interrupteur en haut de page bascule tout le site**, comme une façade au coucher du
soleil. En mode nuit les enseignes sont allumées, halos compris ; en mode jour elles
s'éteignent et ne montrent plus que leur matière. La démonstration est le produit.

| | Proposition 1 | Proposition 2 |
| --- | --- | --- |
| Registre | Atelier, système, imprimerie | Nuit, lumière, signalétique urbaine |
| Palette | Papier blanc, encres CMY | Fond nuit, températures de LED |
| Type | Archivo (grotesque suisse) + Space Mono | Big Shoulders Display (condensée de signalétique) + Instrument Sans + DM Mono |
| Structure | Grille modulaire 12 colonnes visible | Sections pleines, très grands titres |
| Geste signature | La grille qu'on affiche (touche `G`) | L'interrupteur jour / nuit |
| Ce que ça vend | La rigueur de fabrication | Le résultat, vu de la rue |

## Fichiers

```
docs/v2/
├── index.html              toute la page
├── assets/css/style.css    styles — les deux modes sont en haut du fichier
├── assets/js/main.js       comportements — aucune dépendance
└── assets/img/favicon.svg  un tube allumé
```

## Les deux modes

Tout passe par des variables CSS redéfinies sous `:root[data-mode="jour"]`. Deux jetons
font le gros du travail :

- `--lueur` — vaut `1` la nuit, `0` le jour. Tous les halos sont multipliés par lui,
  donc ils s'éteignent d'eux-mêmes en mode jour sans règle supplémentaire.
- `--eteint` — la face d'enseigne non alimentée, sombre la nuit et laiteuse le jour.

Les **températures de LED** (`--led-chaud`, `--led-froid`, `--led-rouge`, `--led-vert`,
`--led-bleu`) sont celles que le client vend au dépôt. Chaque pièce du catalogue porte la
sienne via `style="--led:…"` — c'est ce qui donne la variété de couleurs au survol sans
jamais sortir de la palette.

En mode jour ces teintes sont remplacées par des versions plus denses, sinon elles
tombent sous le seuil de contraste AA sur fond clair.

## Le mouvement

| Ce qui bouge | Ce que ça rejoue |
| --- | --- |
| Chargement | Le mot du titre s'allume avec deux ratés, comme un tube froid qui amorce, puis la rangée de caissons suit un par un |
| Interrupteur | Toute la page bascule : fond, encres, halos, faces d'enseigne |
| Curseur (nuit) | Une lueur suit le pointeur, comme une lampe promenée sur une façade |
| Survol d'une pièce | La face s'allume dans sa température de LED |
| Survol d'un chantier | Les éléments s'allument en séquence — l'enseigne d'abord, les vitrines ensuite |

Garde-fous : `prefers-reduced-motion` coupe l'amorçage, les révélations et la lampe ;
la lampe est également désactivée sur écran tactile. Sans JavaScript la page reste en mode
nuit, entièrement lisible, avec les seize pièces affichées.

**Aucune ombre portée d'élévation dans la feuille de style** — vérifié sur tous les
éléments du DOM. Les seules lueurs sont des `drop-shadow` de source lumineuse, et elles
disparaissent en mode jour.

## Modifier le contenu

| À changer | Où |
| --- | --- |
| Téléphone / WhatsApp | `index.html` (chercher `2250789736267`) **et** `WA` en haut de `main.js` |
| Adresse | `index.html`, section `#atelier`, et le bloc JSON-LD dans `<head>` |
| Horaires | table `#tableHoraires` **et** l'objet `H` dans `main.js` — les deux doivent rester d'accord |
| Couleurs des deux modes | blocs `:root` et `:root[data-mode="jour"]` en haut de `style.css` |

Pour ajouter une pièce : copier un `<article class="piece" data-cat="…" style="--led:…">`,
mettre à jour le compteur du filtre concerné et celui de « Tout », et ajouter l'entrée dans
le `<select>` du devis.

## À remplacer par de vraies photos

Comme dans la proposition 1, les visuels sont des **schémas**, pas des photos — aucune
image d'emprunt n'est présentée comme une réalisation de l'atelier. Remplacez le contenu
des `<div class="scene">` (catalogue) et des `<div class="ch-scene">` (chantiers) par des
`<img>` quand les photos de chantier sont disponibles.

Sur ce point la proposition 2 est plus exigeante que la première : le parti pris repose sur
le contraste jour / nuit, donc **il faudrait idéalement deux photos du même chantier**, une
de jour et une de nuit. C'est le meilleur argument commercial que l'atelier puisse produire,
et cela ne coûte qu'un passage supplémentaire après la pose.

## Origine des informations

Coordonnées, horaires, activités et liste des matières premières proviennent de la fiche
publique de l'entreprise sur AnnuaireCI. Les descriptions de prestations et les formats sont
des formulations de métier courantes : **à faire relire par l'atelier** avant mise en ligne.
Aucune date de création, aucun chiffre d'affaires, aucun nom de client n'a été inventé.
