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

## Faux texte : la règle la plus importante de ce dépôt

Le client a transmis un plan de site (`request/`, non versionné — GitHub Pages servirait ces
documents internes) qui a fait passer le site de 8 à 19 sections. Beaucoup n'ont **aucun contenu
fourni**. La convention retenue, à tenir absolument :

- **Texte descriptif manquant → lorem ipsum.** Visiblement faux, donc inoffensif.
- **Donnée factuelle manquante → emplacement « à fournir », jamais une valeur inventée.**
  Adresse d'Angré, téléphones par direction, noms de l'organigramme, prix, effectif, année de
  création. Un faux numéro ne se repère pas comme du lorem ipsum et sonnerait chez un tiers.
- **Ne jamais « compléter » le lorem ipsum** par du texte plausible sur l'entreprise. Le remplacer
  uniquement par ce que le client a réellement écrit.
- Le `noindex` (`robots.txt` + balise du `<head>`) reste en place tant qu'il subsiste du faux
  texte. `grep -c 'Lorem ipsum' index.html` donne l'état d'avancement.

Repères utiles : `class="ph"` marque un emplacement photo, `data-todo="specs"` les matières dont
les caractéristiques manquent, `.prix-v` la valeur de prix à remplir.

## Structure

```
index.html              page unique, 19 sections ancrées : #haut #presentation #poles
                        #catalogue #imprimerie #decoupe #depot #decoration #import-export
                        #logistique #atelier #realisations #formation #organigramme
                        #perspective #detente #devis #localisation #contact
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
`--panel` / `--panel-2` (le composite), `--alu` (aluminium brossé), `--radius: 3px`
(tôle pliée, pas plastique — ne pas arrondir davantage).

## Les couleurs : celles du logo, et leur règle de contraste

Relevées sur `assets/img/logo-cmy.png` : `--magenta` #CF1B7E (accent de l'interface),
`--cyan` #289AD3 (pôle impression), `--jaune` #FDD305 (pôle dépôt). `--lumen` #FFC22E reste
distinct : c'est la *lumière* de l'enseigne qui s'allume, pas une couleur d'interface.

Ces trois encres n'ont pas la même densité, et c'est ce qui décide de leur emploi :

| Support | Ce qui porte le texte | Interdit |
| --- | --- | --- |
| composite clair | `--magenta` (5,1:1), `--cyan-ink` (4,6:1) | `--cyan` brut (3,1:1), tout jaune (1,5:1) |
| panneau sombre | `--lumen` (9,7:1) | `--magenta` (3,1:1) |
| aplat `.t-mag` | blanc (5,1:1) | noir |
| aplat `.t-cyan` | noir (5,5:1) | blanc |
| aplat `.t-lum` | noir (14,5:1) | blanc |

En clair : **sur fond clair, l'accent est le magenta ; sur fond sombre, c'est le jaune `--lumen`.**
`--cyan-ink` est la seule forme du cyan autorisée à porter du texte. Aucun texte jaune, nulle part.

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
| Devise « Pour vous nous avons des couleurs naturelles » | le bandeau de `#presentation`, le pied de page, la propriété `slogan` du JSON-LD et `og:description` — **libellé officiel, à ne pas reformuler ni reponctuer** |
| Numéro WhatsApp `2250789736267` | `index.html` (liens `wa.me` et `tel:`) **et** la constante `TEL` en tête de `main.js` |
| Horaires | la table `#hoursTable` **et** l'objet `HOURS` de `main.js` (minutes depuis minuit) — c'est lui qui calcule « ouvert / fermé » |
| Adresse, GPS, raison sociale | le corps de `index.html` **et** le bloc `<script type="application/ld+json">` du `<head>` |
| Catalogue | les `data-cat` des `<article class="t-item">`, les compteurs `<span>` des boutons `.filter` (**écrits en dur**, le script ne les recalcule pas, « Tout » compris) et le `<select>` du devis |
| Dépôt | 18 références MP-01 → MP-18 ; le compteur `18` de l'accueil et le `<optgroup>` Dépôt du devis suivent |
| Navigation | la barre du haut ne porte que 7 entrées ; **le pied de page les liste toutes les 18** — y ajouter toute section nouvelle |

Catégories valides : `enseignes`, `totems`, `facade`, `impression`, `signaletique`.

⚠️ `refreshStatus()` lit `getDay()` / `getHours()`, donc **l'heure locale du visiteur** : depuis
l'Europe, le statut « ouvert / fermé » est décalé d'une à deux heures. La Côte d'Ivoire étant à
UTC+0 toute l'année, la correction consiste à passer aux getters UTC (`getUTCDay`, `getUTCHours`,
`getUTCMinutes`). Non corrigé à ce jour.

## Recherche et filtres : un seul état

`main.js` §4 tient `categorie` et `terme` dans une unique fonction `appliquer()`. Ne pas ajouter un
second mécanisme de filtrage en parallèle : les deux commandes se déferaient l'une l'autre. La
comparaison passe par `pliable()` (minuscules + accents retirés). Le champ de recherche est
**créé par le script** et n'existe pas dans le HTML — sans JavaScript, ce serait une commande morte.

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
