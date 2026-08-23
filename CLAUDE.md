# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Nature du dépôt

Site vitrine statique pour **CMY Imprimerie Design** (Koumassi, Abidjan) : enseignes lumineuses,
habillage de façade en alucobond, impression grand format, négoce de matières premières.

**Aucun build, aucune dépendance, aucun package manager** — HTML, CSS et JavaScript ES5 en IIFE.
Il n'y a ni tests, ni linter, ni CI : la vérification est visuelle, dans le navigateur.

```bash
python3 -m http.server 8777      # depuis la racine, puis http://localhost:8777
```

Publié par GitHub Pages depuis la **racine de `main`** : <https://elishama13.github.io/cmy-propositions/>.
Un `git push` sur `main` met le site en ligne — il n'y a pas d'étape de déploiement séparée, et pas
d'environnement de préproduction. En tenir compte avant de pousser.

## Historique : cinq propositions, une retenue

Le dépôt a d'abord contenu cinq directions de design complètes et indépendantes. Le client a retenu
**Calepinage**, qui occupe désormais la racine ; les quatre autres ont été retirées de `main`.

Elles restent accessibles sous le tag **`propositions-v1`** (`git show propositions-v1`,
`git checkout propositions-v1`) — utile si l'on cherche une idée déjà écrite ailleurs, ou si le
client demande à revoir une direction. Ne pas les réintroduire dans `main` sans demande explicite.

Le nom du dépôt (`cmy-propositions`) et l'URL Pages sont ceux de cette période. Les URL absolues
des balises `og:image`, `twitter:image` et du JSON-LD pointent vers ce domaine : **les mettre à
jour ensemble** si un vrai nom de domaine est branché.

## Structure

```
index.html              page unique, sections ancrées : #haut #poles #catalogue #depot
                        #atelier #chantiers #devis #contact
assets/css/style.css    jetons dans :root en haut du fichier
assets/js/main.js       IIFE, huit blocs numérotés en commentaire
assets/img/             logo, recadrage compact, favicons, image de partage
robots.txt              Disallow: / — voir « Indexation » plus bas
```

## Le parti pris : le calepinage

Un bardage en alucobond est un *calepinage* : des panneaux de tailles différentes séparés par un
joint creux de 10 mm qui laisse voir l'ossature sombre. Toute la mise en page en découle — le fond
sombre **est** le joint, chaque bloc **est** un panneau, la gouttière de la grille **est** le joint
creux (`--joint-w: 10px`). Ce n'est pas une métaphore décorative : c'est la règle qui tranche les
arbitrages de mise en page.

Jetons dans `:root` (`assets/css/style.css`) : `--joint` / `--joint-2` (l'ossature),
`--panel` / `--panel-2` (le composite), `--alu` (aluminium brossé), `--lumen` / `--lumen-deep`
(la LED blanc chaud — **la seule couleur vive de la page**, à ne pas multiplier), `--radius: 3px`
(tôle pliée, pas plastique — ne pas arrondir davantage).

## Règles de fabrication

Ce sont des contraintes assumées, pas des oublis. Les tenir dans tout ajout :

- **Aucune ombre portée, aucun encadré de couleur, aucune carte à bordure teintée.** Les blocs se
  distinguent par la valeur de leur fond ; les seuls filets sont neutres et d'un pixel.
- **Aucune dépendance réseau hors Google Fonts** (Bricolage Grotesque + Instrument Sans). Pas de
  CDN, pas de framework, pas de librairie — la page doit rester lisible hors ligne, repli sur les
  grotesques du système.
- **Le contenu est complet sans JavaScript.** La classe `html.js` est posée par le script lui-même
  et conditionne les états de départ animés. Ne jamais masquer du contenu en CSS nu en attendant
  qu'un script le révèle.
- **`prefers-reduced-motion` est respecté** : `main.js` lit la media query dans `reduced` et pose
  directement les états finaux. Tout nouvel effet doit passer par ce garde-fou.
- Accessibilité : navigation clavier, focus visible, lien d'évitement, `aria-*` sur les contrôles.
  Zéro débordement horizontal (vérifié à 390, 768 et 1280 px).
- Les visuels sont des **schémas SVG**, jamais des photos d'emprunt présentées comme des
  réalisations de l'atelier. Ils seront remplacés par de vraies photos de chantier.

## Données à garder cohérentes

| Donnée | Emplacements |
| --- | --- |
| Numéro WhatsApp `2250789736267` | `index.html` (liens `wa.me` et `tel:`) **et** la constante `TEL` en tête de `main.js` |
| Horaires | la table `#hoursTable` **et** l'objet `HOURS` de `main.js` (minutes depuis minuit) — c'est lui qui calcule « ouvert / fermé » |
| Adresse, GPS, raison sociale | le corps de `index.html` **et** le bloc `<script type="application/ld+json">` du `<head>` |
| Catalogue | les `data-cat` des `<article class="t-item">`, les compteurs `<span>` des boutons `.filter` (**écrits en dur**, le script ne les recalcule pas, « Tout » compris) et le `<select>` du devis |

Catégories valides : `enseignes`, `totems`, `facade`, `impression`, `signaletique`.

⚠️ `refreshStatus()` lit `getDay()` / `getHours()`, donc **l'heure locale du visiteur** : depuis
l'Europe, le statut « ouvert / fermé » est décalé d'une à deux heures. La Côte d'Ivoire étant à
UTC+0 toute l'année, la correction consiste à passer aux getters UTC (`getUTCDay`, `getUTCHours`,
`getUTCMinutes`). Non corrigé à ce jour.

## Le formulaire de devis

Aucun back-end, aucun stockage : validation HTML native, puis composition d'un message texte ouvert
dans `https://wa.me/…`, où le client relit avant d'envoyer. C'est un choix — ne pas y ajouter de
POST, d'API ou de persistance sans demande explicite.

## Indexation

Le site est en `noindex` **à deux endroits** : `robots.txt` (`Disallow: /`) et une balise
`<meta name="robots" content="noindex, nofollow">` dans le `<head>`. C'est délibéré tant que le
contenu n'a pas été relu par l'atelier. Les retirer **ensemble**, et seulement sur demande.

## Contenu : ce qui est sourcé et ce qui ne l'est pas

Coordonnées, horaires, activités et matières premières viennent de la fiche publique AnnuaireCI.
Sont des **propositions non confirmées**, à faire valider par l'atelier : les références du
catalogue (`ENS-01`, `TOT-02`…), les spécifications techniques (épaisseurs, grammages, indices IP,
formats de panneaux), le délai « maquette à J+1 ». Aucune date de création, aucun chiffre
d'affaires, aucun nom de client n'a été inventé — tenir cette règle pour tout nouveau contenu.

## Langue

Tout le projet est en français, y compris les identifiants, les classes CSS et les commentaires
(`.t-item`, `#devisForm`, `--lumen`, `--joint`). Écrire le nouveau code dans la même langue et le
même registre : les commentaires expliquent le *métier* de l'enseigniste, pas la syntaxe.
