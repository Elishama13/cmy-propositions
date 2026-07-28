# CMY Imprimerie Design — trois directions à comparer

Trois sites complets, indépendants, en HTML / CSS / JavaScript sans dépendance ni build.
Chacun contient **le même contenu réel** — seul le parti pris change.

```bash
cd docs && python3 -m http.server 8777
# puis http://localhost:8777/propositions/
```

La page `propositions/index.html` présente les cinq versions côte à côte, avec un aperçu de chacune.

## Ce qu'il y a dans le dossier

```
docs/
├── index.html            proposition 1 — grille suisse / encres CMY   (non modifiée)
├── v2/                   proposition 2 — « Deux vies »                (non modifiée)
└── propositions/
    ├── index.html        page de comparaison des cinq versions
    ├── calepinage/       direction 1
    ├── atelier/          direction 2
    ├── nuit/             direction 3
    └── assets/apercus/   captures utilisées par la page de comparaison
```

Chaque direction est autonome : `index.html`, `assets/css/style.css`, `assets/js/main.js`,
`assets/img/favicon.svg`. Rien n'est partagé entre elles, on peut en supprimer deux sans casser la troisième.

## Les trois partis pris

Chacun est tiré d'un objet réel du métier, pas d'un habillage graphique.

### 1. Calepinage — `calepinage/`

Un bardage de façade en alucobond est un **calepinage** : des panneaux de tailles différentes,
séparés par un joint creux de 10 mm qui laisse voir l'ossature sombre. La page est construite ainsi —
le fond sombre *est* le joint, chaque bloc *est* un panneau, la gouttière de la grille *est* le joint creux.

- **Palette** : composite gris, aluminium brossé, et une seule couleur vive — le jaune d'une LED blanc chaud.
- **Typographie** : Bricolage Grotesque (titres) · Instrument Sans (texte).
- **Signature** : l'enseigne « CMY » du bandeau s'allume lettre après lettre, dans l'ordre du câblage.
- **Rayon d'angle volontairement faible (3 px)** : c'est de la tôle pliée, pas du plastique.

### 2. Atelier — `atelier/`

La page est un **plan d'exécution**. Le vocabulaire du métier fournit la nomenclature du site :
planches numérotées, *nomenclature* des pièces, *bordereau* du dépôt, *gamme de fabrication*,
*cartouche* en pied de page. Les cotes portent de vraies dimensions, les hachures marquent la matière
coupée, les repères numérotés renvoient à la nomenclature.

- **Palette** : tirage de plan gris-bleu, trait noir, rouge minium **réservé** aux cotes et aux repères.
- **Typographie** : Saira Condensed (titres) · IBM Plex Sans (texte) · IBM Plex Mono (cotes et données).
- **Signature** : l'élévation cotée du caisson, dont les lignes de cote se tracent au chargement
  (longueur de trait mesurée par `getTotalLength()`, pas une valeur devinée).
- La numérotation des planches va de 00 à 07 ; la planche 06 est portée par le bouton rouge du bandeau.

### 3. Nuit — `nuit/`

Le premier métier de CMY, c'est la lumière : la page se voit **de nuit**, à l'heure où une enseigne
travaille. Les trois lettres du bandeau sont fabriquées comme à l'atelier — profil tracé (`THREE.Shape`),
extrudé (`ExtrudeGeometry`), face diffusante émissive, puis mise sous tension lettre après lettre.

- **Palette** : nuit, plus les **deux températures de LED vendues au dépôt** — blanc chaud et blanc froid.
- **Typographie** : Syne (titres) · Manrope (texte).
- **Signature** : l'interrupteur jour / nuit. Le visiteur éteint l'enseigne et voit exactement ce que
  ses clients voient à 8 h et à 20 h — la démonstration *est* l'argument de vente.

**Dépendance réseau** : c'est la seule des trois qui en a une. Three.js 0.169 est chargé depuis
jsDelivr via une carte d'imports (`importmap`), nécessaire parce que les modules d'effets importent
`three` par son nom. Sans réseau, sans WebGL ou sur un appareil qui ne le supporte pas, la scène
bascule sur l'enseigne à plat déjà présente dans le HTML : rien ne casse, aucun message d'erreur.
Le bloom est désactivé sous 700 px de large.

## Règles tenues dans les trois

- **Aucune ombre portée.** Les blocs se distinguent par la valeur de leur fond. La seule lueur est
  celle du bouton principal de la direction *Nuit* — parce que c'en est le sujet.
- **Aucun encadré de couleur.** Pas de carte à bordure teintée : uniquement des aplats, et des filets
  neutres d'un pixel là où le sujet les justifie (tableau, cartouche).
- **Des formes**, tirées de l'objet fabriqué : faisceau d'un caisson, rouleau de vinyle, empilement de
  panneaux, entretoise, module LED, hachure de coupe.
- Contenu complet **sans JavaScript** — le script n'ajoute que des comportements.
- `prefers-reduced-motion` respecté partout : états de départ neutralisés, animations coupées.
- Navigation au clavier, focus visible, lien d'évitement, `aria-*` sur les contrôles.
- Zéro débordement horizontal, vérifié à 390, 768 et 1280 px. Le tableau du bordereau défile
  dans son propre cadre.

## Le formulaire de devis

Il n'envoie rien à un serveur : il **compose le message et l'ouvre dans WhatsApp**, où le visiteur
relit avant d'envoyer. Aucune donnée n'est stockée, aucun back-end à héberger, et l'entreprise reçoit
la demande là où elle répond déjà. Le numéro utilisé est `+225 07 89 73 62 67`.

## Données de l'entreprise

Reprises telles quelles de la fiche AnnuaireCI : raison sociale, adresse (Koumassi, à 50 m de la
pharmacie du Soleil), téléphone, horaires (lundi–vendredi 08:00–17:00, samedi 09:00–13:00, dimanche
fermé), page Facebook, coordonnées GPS. Le statut « ouvert / fermé » se calcule dans le navigateur à
partir de ces horaires.

**À faire confirmer par l'entreprise avant mise en ligne** — ces éléments sont plausibles pour le
métier mais ne figurent pas sur la fiche source :

- les références du catalogue (`ENS-01`, `TOT-02`…), qui sont une nomenclature proposée, pas la leur ;
- les spécifications techniques (épaisseurs, grammages, IP, formats de panneaux) ;
- le délai « maquette à J+1 » et le déroulé en quatre étapes ;
- l'absence d'adresse e-mail : aucune n'est publiée, tous les contacts passent par téléphone ou WhatsApp.

Aucun chiffre d'affaires, nom de client ou photo de réalisation n'a été inventé. Les visuels sont des
schémas des produits, dessinés en SVG.
