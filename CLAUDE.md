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
documents internes), puis un document de corrections (`docs/SITE ORGANISATION.pdf`, non versionné
lui non plus) qui a fait passer la page unique à un site multipage. Beaucoup de panneaux n'ont
**aucun contenu fourni**. La convention retenue, à tenir absolument :

- **Texte descriptif manquant → lorem ipsum.** Visiblement faux, donc inoffensif.
- **Donnée factuelle manquante → emplacement « à fournir », jamais une valeur inventée.**
  Adresse d'Angré, téléphones par direction, noms de l'organigramme, prix, effectif, année de
  création. Un faux numéro ne se repère pas comme du lorem ipsum et sonnerait chez un tiers.
- **Ne jamais « compléter » le lorem ipsum** par du texte plausible sur l'entreprise. Le remplacer
  uniquement par ce que le client a réellement écrit.
- Le `noindex` (`robots.txt` + balise du `<head>` de **chaque** page) reste en place tant qu'il
  subsiste du faux texte. `grep -rlc 'Lorem ipsum' --include='*.html' .` donne l'état d'avancement.

Repères utiles : `class="ph"` marque un emplacement photo, `data-todo="specs"` les articles dont
les caractéristiques manquent, `.prix-v` la valeur de prix à remplir, `class="vide"` une cellule
« à fournir » dans le tableau de spécifications d'une fiche.

La page Présentation est le **texte du client** (page 3 du PDF), repris tel quel. Les descriptifs
de l'Imprimerie en sont extraits. Ne pas les réécrire.

## Structure

Une page par entrée du menu, plus le devis et une fiche par article. Pas de gabarit partagé (pas
de build) : l'en-tête, la barre de navigation et le pied sont **recopiés dans chaque fichier**.
Toute modification de la barre ou du pied se fait dans les 27 fichiers — `grep -l` avant, `grep -c`
après.

```
index.html              accueil : photo de l'imprimerie + devise, devanture, puis quatre
                        panneaux Écoute / Conseils / Accompagnement / Contacts
presentation.html       texte du client : domaines d'expertise, mission, pourquoi CMY
produits.html           « Produits et prix » : matières premières, puis machines EN DERNIER
produits/<slug>.html    18 fiches détaillées MP-01 → MP-18 (chemins en ../)
imprimerie.html         le parc machines (photos à fournir)
realisations.html       chantiers, schémas en attendant les photos
logistique.html         véhicules, groupes électrogènes, photo d'ensemble du personnel
formations.html         formations et détente
contact.html            contact ET localisation (fusionnés à la demande du client)
devis.html              le formulaire WhatsApp ; accepte ?article=MP-03 pour présélectionner
assets/css/style.css    jetons dans :root en haut du fichier
assets/js/main.js       IIFE, sept blocs numérotés en commentaire
assets/img/             logo, favicons, image de partage, atelier.jpg et devanture.jpg
robots.txt              Disallow: / — voir « Indexation » plus bas
```

Retirés à la demande du client (récupérables dans l'historique git, commit `6e4e11a`) : le dépôt
en tant que section (ses 18 références sont devenues les Produits), le catalogue « Ce que nous
fabriquons », les pôles, l'organigramme, le bloc historique/effectif/Madone de l'accueil.
Sans entrée dans le nouveau menu, donc non reconduits : import-export, perspectives, décoration,
découpe (son texte est passé dans Imprimerie), les étapes d'atelier.

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
  réalisations de l'atelier. Ils seront remplacés par de vraies photos de chantier. Seules
  exceptions : `atelier.jpg` et `devanture.jpg`, **fournies par le client** pour l'accueil.

## Données à garder cohérentes

| Donnée | Emplacements |
| --- | --- |
| Devise « Pour vous, nous avons des couleurs naturelles » | le `<h1>` de l'accueil, le pied de **chaque** page, la propriété `slogan` du JSON-LD et `og:description` — **libellé officiel, à ne pas reformuler ni reponctuer** (pas de point final) |
| Numéro WhatsApp `2250789736267` | tous les `.html` (liens `wa.me` et `tel:`, y compris le message prérempli des fiches) **et** la constante `TEL` en tête de `main.js` |
| Horaires | la table `#hoursTable` de `contact.html`, la ligne d'horaires de `devis.html` **et** l'objet `HOURS` de `main.js` (minutes depuis minuit) — c'est lui qui calcule « ouvert / fermé » |
| Adresse, GPS, raison sociale | `contact.html` **et** le bloc `<script type="application/ld+json">` du `<head>` de `index.html` |
| Articles | 18 références MP-01 → MP-18 : la vignette de `produits.html`, la fiche `produits/<slug>.html`, les liens précédent / suivant des fiches voisines, l'`<optgroup>` du devis, les compteurs `<span>` des familles (**écrits en dur**), **et** le tableau `ARTICLES` de `main.js` qui alimente la recherche |
| Navigation | la barre du haut porte Accueil + les 7 entrées du menu client (Présentation, Produits, Imprimerie, Réalisations, Logistique, Formations & détente, Contact) + le bouton Devis ; le pied liste en plus Devis. La page courante porte `class="is-here" aria-current="page"`, écrit en dur. Huit entrées et la recherche ne tiennent sur une ligne qu'au-delà de ~1240 px : le burger prend le relais sous 1260 px (`style.css` §19) — revérifier ce seuil si une entrée s'ajoute |

Familles d'articles : `matieres` et `machines` — les seules que le client ait nommées. Les vraies
familles sont « à fournir » : les ajouter dans `FAMILLES` de `main.js` et dans `produits.html`.

⚠️ `refreshStatus()` lit `getDay()` / `getHours()`, donc **l'heure locale du visiteur** : depuis
l'Europe, le statut « ouvert / fermé » est décalé d'une à deux heures. La Côte d'Ivoire étant à
UTC+0 toute l'année, la correction consiste à passer aux getters UTC (`getUTCDay`, `getUTCHours`,
`getUTCMinutes`). Non corrigé à ce jour.

## La recherche d'articles

Revue à la demande du client (« faciliter la visualisation et la trouvaille des articles ») :
l'ancien champ masquait des vignettes plus bas dans la page, sans qu'on voie le résultat. Le champ
est maintenant dans la barre de **toutes** les pages et propose les articles au fil de la frappe,
dans un panneau déroulant (combobox ARIA : flèches, Entrée, Échap) ; chaque proposition mène à la
fiche. Il cherche dans le tableau `ARTICLES` de `main.js` §4 — pas dans le DOM, puisque l'article
n'est pas sur la page courante. Tous les mots saisis doivent se retrouver ; la comparaison passe
par `pliable()` (minuscules + accents retirés). Les liens sont construits depuis `RACINE`, déduite
de l'adresse du script, pour fonctionner aussi depuis `produits/`.

Le champ est **créé par le script** et n'existe pas dans le HTML — sans JavaScript, ce serait une
commande morte ; la page Produits liste de toute façon tout.

## Le formulaire de devis

Aucun back-end, aucun stockage : validation HTML native, puis composition d'un message texte ouvert
dans `https://wa.me/…`, où le client relit avant d'envoyer. C'est un choix — ne pas y ajouter de
POST, d'API ou de persistance sans demande explicite.

## Indexation

Le site est en `noindex` **à deux endroits** : `robots.txt` (`Disallow: /`) et une balise
`<meta name="robots" content="noindex, nofollow">` dans le `<head>` de chaque page. C'est délibéré tant que le
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
