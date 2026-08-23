# CMY Imprimerie Design — site vitrine

Site statique en HTML / CSS / JavaScript, **sans dépendance ni build**. Direction retenue par le
client : **Calepinage**. Pour le voir :

```bash
python3 -m http.server 8777   # puis http://localhost:8777
```

En ligne : <https://elishama13.github.io/cmy-propositions/> (GitHub Pages, branche `main`, racine).

Les quatre autres propositions présentées au client ne sont plus dans la branche. Elles restent
consultables dans l'historique :

```bash
git checkout propositions-v1     # les cinq versions côte à côte
git checkout main                # revenir au site
```

## État : maquette d'arborescence, pas encore un site publiable

Le client a transmis un plan de site (`request/SITE INTERNET.pdf`, non versionné) qui élargit
beaucoup le périmètre. **Les dix-neuf sections demandées existent**, mais celles dont il n'a pas
fourni le contenu portent du **lorem ipsum**. Deux règles ont été tenues :

- un **texte** manquant est du lorem ipsum — visiblement faux, donc sans danger ;
- une **donnée** manquante (adresse d'Angré, téléphones par direction, noms de l'organigramme,
  prix, effectif, année de création) reste un emplacement marqué « à fournir ». Un faux numéro
  ou une fausse adresse ne se repère pas comme du lorem ipsum et sonnerait chez quelqu'un.

Conséquence : **le site reste en `noindex`** jusqu'au remplacement complet du faux texte.

## Fichiers

```
index.html              toute la page (une seule page, ancres de section)
assets/css/style.css    styles — la palette et les jetons sont en haut du fichier
assets/js/main.js       comportements — aucune dépendance
assets/img/             le logo de l'entreprise, ses recadrages et l'icône d'onglet
```

## Le parti pris

Un bardage de façade en alucobond est un **calepinage** : des panneaux de tailles différentes,
séparés par un joint creux de 10 mm qui laisse voir l'ossature sombre. La page est construite
ainsi — le fond sombre *est* le joint, chaque bloc *est* un panneau, la gouttière de la grille
*est* le joint creux (`--joint-w: 10px`).

- **Palette** : composite gris et aluminium brossé, plus les **trois encres du logo** — magenta
  `#CF1B7E`, cyan `#289AD3`, jaune `#FDD305`. Le magenta est l'accent de l'interface ; le cyan
  identifie l'impression, le jaune le dépôt. Le jaune `--lumen` reste réservé à la lumière.
- **Typographie** : Bricolage Grotesque (titres) · Instrument Sans (texte), chargées depuis Google
  Fonts, avec repli sur les grotesques du système.
- **Signature** : l'enseigne « CMY » du bandeau s'allume lettre après lettre, dans l'ordre du
  câblage.
- **Rayon d'angle volontairement faible (3 px)** : c'est de la tôle pliée, pas du plastique.

## Règles de fabrication

- **Aucune ombre portée.** Les blocs se distinguent par la valeur de leur fond ; les filets sont
  neutres et d'un pixel.
- **Aucun encadré de couleur.** Pas de carte à bordure teintée : uniquement des aplats.
- **Des formes tirées de l'objet fabriqué** : faisceau d'un caisson, rouleau de vinyle, empilement
  de panneaux, entretoise, module LED.
- Contenu complet **sans JavaScript** — le script n'ajoute que des comportements.
- `prefers-reduced-motion` respecté : états de départ neutralisés, animations coupées.
- Navigation au clavier, focus visible, lien d'évitement, `aria-*` sur les contrôles.
- Zéro débordement horizontal, vérifié à 390, 768 et 1280 px.

## Modifier le contenu

| À changer | Où |
| --- | --- |
| Téléphone / WhatsApp | `index.html` (chercher `2250789736267`) **et** `TEL` en haut de `main.js` |
| Adresse | `index.html`, section `#contact`, et le bloc JSON-LD dans `<head>` |
| Horaires | table `#hoursTable` dans `index.html` **et** l'objet `HOURS` dans `main.js` (les deux doivent rester d'accord — c'est lui qui calcule « ouvert / fermé ») |
| Lien Facebook | `index.html`, chercher `facebook.com` |
| Couleurs, joint, rayons, polices | bloc `:root` en haut de `style.css` |
| Prix d'une pièce | le `<span class="prix-v">` de la vignette : remplacer « Sur devis » par le tarif |
| Faux texte restant | chercher `Lorem ipsum` dans `index.html` |
| Image de partage (Facebook, WhatsApp) | `assets/img/og-image.jpg` — les balises `og:image` pointent vers l'URL GitHub Pages, à changer si le domaine change |

## Ajouter une référence au catalogue

Copiez un bloc `<article class="t-item" data-cat="…">` dans le catalogue. Les catégories
disponibles sont `enseignes`, `totems`, `facade`, `impression`, `signaletique`. Pensez à :

1. mettre à jour le compteur du filtre correspondant (`<button class="filter"><span>`) **et** celui
   de « Tout » — ils sont écrits en dur, le script ne les recalcule pas ;
2. ajouter la référence dans le `<select>` du formulaire de devis, sous le bon `<optgroup>`.

## Contraste : la règle à ne pas enfreindre

Les trois encres n'ont pas la même densité. Vérifié au ratio WCAG AA :

| Usage | Ce qui passe | Ce qui ne passe pas |
| --- | --- | --- |
| Texte sur composite clair | magenta — 5,1:1 | cyan (3,1:1), jaune (1,5:1) |
| Texte sur panneau sombre | `--lumen` — 9,7:1 | magenta (3,1:1) |
| Texte sur aplat magenta | blanc — 5,1:1 | noir (3,4:1) |
| Texte sur aplat cyan | noir — 5,5:1 | blanc (3,1:1) |
| Texte sur aplat jaune | noir — 14,5:1 | blanc |

D'où `--cyan-ink` (#1C7CB0, 4,6:1) : la seule forme du cyan autorisée à porter du texte sur fond
clair. **Aucun texte jaune nulle part.**

## La barre de recherche

Elle filtre en même temps les pièces du catalogue et les matières du dépôt, sans accents ni casse
(« bache » trouve « Bâche »), annonce le nombre de résultats en `aria-live`, et se vide avec `Échap`.

Elle est **créée par le script**, jamais présente dans le HTML : sans JavaScript, un champ qui ne
filtrerait rien serait une commande morte. Le reste de la page, lui, est complet sans script.
Recherche et filtres par catégorie passent par la même fonction `appliquer()` dans `main.js` §4 —
saisir un terme rouvre le catalogue en grand, sinon la catégorie active masquerait les résultats.

## Le formulaire de devis

Il n'envoie rien à un serveur et ne stocke rien : il compose un message et l'ouvre dans WhatsApp,
où le client relit avant d'envoyer. C'est volontaire — pas d'hébergement à gérer, pas de données
personnelles conservées, et le canal que la clientèle utilise déjà. Aucune configuration requise.

## À remplacer par de vraies photos

Les visuels du catalogue et de la section « Chantiers » sont des **schémas SVG**, pas des photos :
ils décrivent le type de pièce sans faire passer une image d'emprunt pour une réalisation de
l'atelier. Dès que les photos de chantier sont disponibles, remplacez le contenu des blocs de
visuel par un `<img>`.

## Avant la mise en ligne publique

Le site est en **`noindex`** : `robots.txt` porte `Disallow: /` et le `<head>` une balise
`robots noindex, nofollow`. C'est délibéré tant que le contenu n'a pas été relu par l'atelier.
Retirez les deux ensemble le jour de l'ouverture au public.

Coordonnées, horaires, activités et matières premières proviennent de la fiche publique de
l'entreprise sur AnnuaireCI. **À faire confirmer par l'entreprise** — ces éléments sont plausibles
pour le métier mais ne figurent pas sur la fiche source :

- les références du catalogue (`ENS-01`, `TOT-02`…), qui sont une nomenclature proposée ;
- les spécifications techniques (épaisseurs, grammages, IP, formats de panneaux) ;
- le délai « maquette à J+1 » et le déroulé des étapes ;
- l'absence d'adresse e-mail : aucune n'est publiée, tous les contacts passent par téléphone ou
  WhatsApp.

### Ce que le client doit encore fournir

Grille tarifaire · adresse, GPS et horaires du site d'Angré · noms et postes de l'organigramme ·
téléphones par direction · effectif et année de création · contenu réel d'Import-Export, Décoration
et Perspectives · caractéristiques des matières MP-07 à MP-18 · ce que recouvre « Section découpe »
(le plan de site y recopie la liste de l'imprimerie) · ce que désigne « Palette » dans Produits et
prix · les photos : devanture, équipe, machines, écran géant, site d'Angré, magasin, sorties.

Aucune date de création, aucun chiffre d'affaires, aucun nom de client, aucune photo de réalisation
n'a été inventé.
