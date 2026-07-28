# CMY Imprimerie Design — site vitrine

Site statique en HTML / CSS / JavaScript, sans dépendance ni build. Pour le voir :
ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
cd docs && python3 -m http.server 8777   # puis http://localhost:8777
```

## Fichiers

```
docs/
├── index.html              toute la page (une seule page, ancres de section)
├── assets/css/style.css    styles — la grille et la palette sont en haut du fichier
├── assets/js/main.js       comportements — aucune dépendance
└── assets/img/favicon.svg  icône d'onglet : les trois encres en surimpression
```

## Le parti pris

Le nom de l'entreprise est une palette : **CMY = Cyan, Magenta, Yellow**, les trois encres de
la quadrichromie. Toute l'identité en découle — les aplats, la surimpression du bandeau
d'accueil (`mix-blend-mode: multiply`, exactement ce qui se passe sur une presse : cyan + magenta
donne du bleu, magenta + jaune du rouge, les trois du noir), les repères de calage employés comme
puces, la barre de contrôle densitométrique en pied de page et en jauge de lecture.

La mise en page suit un **système de grille Müller-Brockmann** : 12 colonnes, ligne de base de
8 px, interligne de 24 px. Toutes les valeurs vivent dans `:root` et servent à la fois au contenu
et au calque de vérification.

**Appuyez sur `G`** (ou cliquez « Voir la grille » en bas à gauche) pour afficher la grille sur
laquelle la page est construite. Adhérence mesurée à 0 px à 1440, 1180 et 900 px de large.

Règles de fabrication tenues partout : aucune ombre portée, aucune bordure de couleur, aucune
carte encadrée — uniquement des aplats et des filets d'un pixel.

## Le mouvement

Toutes les animations parlent la même langue — **l'encre qui se dépose, puis le repérage** —
et sont regroupées dans la section `19 bis` de `style.css`.

| Ce qui bouge | Ce que ça rejoue |
| --- | --- |
| Ouverture du bandeau | La règle se tire, les lignes du titre montent hors du massicot, puis les trois encres se déposent **dans l'ordre du passage sous presse : cyan, magenta, jaune** |
| Titres de section | Même montée, déclenchée quand la section entre dans le champ |
| Survol d'un métier | L'encre de couleur couvre tout le filet, les mots-clés s'encrent l'un après l'autre |
| Survol d'une référence | Le filet supérieur passe à l'encre magenta, la référence avance |
| Survol d'un chantier | **Défaut de repérage** : les aplats se décalent d'un cheveu, comme une feuille mal calée, puis se recalent |
| Survol de la marque | Les trois disques perdent le repérage, puis reviennent |
| Boutons | L'aplat d'encre monte par le bas |

Trois garde-fous tenus :

1. **La grille ne bouge pas.** Les lignes de titre sont masquées par un `clip-path` à valeurs
   négatives, pas par `overflow` + marges négatives : la boîte du titre garde exactement sa
   hauteur d'interligne. Adhérence toujours mesurée à 0 px.
2. **Sans JavaScript, rien n'est caché.** Les états de départ ne s'appliquent que sous
   `html.js`, classe posée par le script lui-même.
3. **`prefers-reduced-motion` est respecté** : les états de départ sont neutralisés, aucun
   contenu ne reste masqué en attente d'une animation qui ne viendra pas.

Pour calmer l'ensemble, réduisez les durées dans la section `19 bis`. Pour le supprimer
entièrement, retirez cette section : la page reste complète et alignée.

## Modifier le contenu courant

| À changer | Où |
| --- | --- |
| Téléphone / WhatsApp | `index.html` (chercher `2250789736267`) **et** `WA_NUMBER` en haut de `main.js` |
| Adresse | `index.html`, section `#contact`, balise `<address>`, et le bloc JSON-LD dans `<head>` |
| Horaires | tableau `#hoursTable` dans `index.html` **et** l'objet `HORAIRES` dans `main.js` (les deux doivent rester d'accord — c'est lui qui calcule « ouvert / fermé ») |
| Lien Facebook | `index.html`, chercher `facebook.com` |
| Couleurs, marges, colonnes | bloc `:root` en haut de `style.css` |

## Ajouter une référence au catalogue

Copiez un bloc `<article class="item" data-cat="…">` dans `#catalogue-liste`. Les catégories
disponibles sont `enseignes`, `totems`, `facade`, `impression`, `signaletique`. Pensez à :

1. mettre à jour le compteur du filtre correspondant (`<span class="filter-n">`) et celui de « Tout » ;
2. ajouter la référence dans le `<select>` du formulaire de devis, sous le bon `<optgroup>`.

## Le formulaire de devis

Il n'envoie rien à un serveur et ne stocke rien : il compose un message et l'ouvre dans WhatsApp,
où le client relit avant d'envoyer. C'est volontaire — pas d'hébergement à gérer, pas de données
personnelles conservées, et le canal que la clientèle utilise déjà. Aucune configuration requise.

## À remplacer par de vraies photos

Les visuels du catalogue et de la section « Chantiers » sont des **schémas géométriques**, pas des
photos : ils décrivent le type de pièce sans faire passer une image d'emprunt pour une réalisation
de l'atelier. Dès que les photos de chantier sont disponibles, remplacez :

- dans `#catalogue-liste`, le contenu de chaque `<div class="plate">` par un `<img>` ;
- dans `#chantiers`, chaque `<div class="work-plate">` par un `<img>`.

Gardez des hauteurs multiples de 24 px (168, 264, 336…) pour que le haut **et** le bas de l'image
retombent sur la grille.

## Mise en ligne

Le dossier s'appelle `docs/`, ce qui permet de le publier tel quel avec GitHub Pages
(*Settings → Pages → Source : branche `main`, dossier `/docs`*). Il fonctionne aussi sur n'importe
quel hébergement statique — Netlify, Vercel, ou un simple FTP.

Deux polices sont chargées depuis Google Fonts (Archivo, Space Mono). Sans connexion, la page
retombe proprement sur les grotesques du système.

## Origine des informations

Coordonnées, horaires, activités et liste des matières premières proviennent de la fiche publique
de l'entreprise sur AnnuaireCI. Les descriptions de prestations, les formats et les épaisseurs
sont des formulations de métier courantes : **faites-les relire par l'atelier** avant la mise en
ligne, en particulier les épaisseurs, les grammages et les tensions d'alimentation, qui varient
selon l'arrivage.

Aucune date de création, aucun chiffre d'affaires, aucun nom de client n'a été inventé.
