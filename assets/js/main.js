/* ============================================================
   CMY IMPRIMERIE DESIGN — direction « CALEPINAGE »
   Aucune dépendance. Tout le contenu existe sans JavaScript :
   le script n'ajoute que des comportements.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEL = '2250789736267';

  /* la racine du site, déduite de l'adresse de ce script (assets/js/main.js) :
     les fiches produits vivent un dossier plus bas que les autres pages */
  var script = document.currentScript || document.querySelector('script[src$="main.js"]');
  var RACINE = new URL('../../', script.src).href;

  /* ---------- 1. Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
  }

  /* ---------- 2. Pose des panneaux au défilement ---------- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  tiles.forEach(function (t, i) { t.style.setProperty('--i', i % 8); });

  if (reduced || !('IntersectionObserver' in window)) {
    tiles.forEach(function (t) { t.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    tiles.forEach(function (t) { io.observe(t); });
  }

  /* ---------- 3. L'enseigne de la devanture s'allume ---------- */
  var sign = document.querySelector('.t-sign');
  if (sign) {
    if (reduced) {
      sign.classList.add('lit');
    } else {
      window.setTimeout(function () { sign.classList.add('lit'); }, 520);
    }
  }

  /* ---------- 4. La recherche d'articles ----------
     Demande du client : trouver un article sans parcourir la page. Le champ est
     présent sur toutes les pages et propose les articles au fil de la frappe ;
     chaque proposition mène à la fiche. L'index ci-dessous double les fiches de
     produits/ : un article ajouté là-bas doit l'être ici aussi.
     [référence, nom, famille, fichier, mots qui le décrivent] */
  var ARTICLES = [
    ['MP-01', 'Forex', 'matieres', 'forex', 'PVC expansé panneau plaque signalétique gabarit lettrage'],
    ['MP-02', 'Alucobond', 'matieres', 'alucobond', 'composite aluminium alu panneau bardage façade caisson totem devanture'],
    ['MP-03', 'Plexiglas', 'matieres', 'plexiglas', 'plexy PMMA plaque transparent opale teinté face de caisson lettres boîtiers présentoir'],
    ['MP-04', 'Entretoises', 'matieres', 'entretoises', 'fixations déportées inox alu plaque lettres relief'],
    ['MP-05', 'Transformateurs', 'matieres', 'transformateurs', 'alimentation 12 V IP67 LED coffret enseigne'],
    ['MP-06', 'Modules LED', 'matieres', 'modules-led', 'rubans injectés éclairage lumière caisson lettres boîtiers rétro-éclairage'],
    ['MP-07', 'Nappe', 'matieres', 'nappe', ''],
    ['MP-08', 'Encre', 'matieres', 'encre', 'impression'],
    ['MP-09', 'Cutter', 'matieres', 'cutter', 'découpe'],
    ['MP-10', 'Ruban LED', 'matieres', 'ruban-led', 'éclairage lumière'],
    ['MP-11', 'Tête d’impression', 'matieres', 'tete-impression', 'imprimante'],
    ['MP-12', 'Vinyle', 'matieres', 'vinyle', 'adhésif autocollant'],
    ['MP-13', 'Bâche', 'matieres', 'bache', 'impression grand format'],
    ['MP-14', 'Roll-up kakémono', 'matieres', 'roll-up', 'stand'],
    ['MP-15', 'Croix de pharmacie', 'matieres', 'croix-pharmacie', 'enseigne lumineuse'],
    ['MP-16', 'Dos bleu', 'matieres', 'dos-bleu', 'affiche papier'],
    ['MP-17', 'Machine CNC', 'machines', 'machine-cnc', 'découpe fraiseuse'],
    ['MP-18', 'Machine plotter', 'machines', 'machine-plotter', 'découpe vinyle traceur']
  ];
  var FAMILLES = { matieres: 'Matières premières', machines: 'Machines' };
  var MAX_PROPOSITIONS = 8;

  /* « Bâche » doit répondre à « bache » : on compare sans accents ni casse */
  function pliable(txt) {
    return txt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  var fiches = ARTICLES.map(function (a) {
    return {
      ref: a[0], nom: a[1], famille: FAMILLES[a[2]],
      url: RACINE + 'produits/' + a[3] + '.html',
      nomPlie: pliable(a[1]),
      texte: pliable([a[0], a[1], FAMILLES[a[2]], a[4]].join(' '))
    };
  });

  /* tous les mots saisis doivent se retrouver ; un nom qui commence par le terme
     passe devant un article qui ne le cite que dans sa description */
  function chercher(terme) {
    var mots = terme.split(/\s+/).filter(Boolean);
    return fiches
      .filter(function (f) {
        return mots.every(function (m) { return f.texte.indexOf(m) !== -1; });
      })
      .map(function (f, i) {
        var rang = f.nomPlie.indexOf(terme) === 0 ? 0 : f.nomPlie.indexOf(mots[0]) !== -1 ? 1 : 2;
        return { f: f, rang: rang, i: i };
      })
      .sort(function (a, b) { return a.rang - b.rang || a.i - b.i; })
      .map(function (x) { return x.f; });
  }

  /* Le champ n'existe que si le script tourne : sans JavaScript, une commande qui
     ne cherche rien serait un bouton mort. La page Produits liste déjà tout. */
  (function recherche() {
    var barIn = document.querySelector('.bar-in');
    var cta = document.querySelector('.bar-cta');
    if (!barIn) { return; }

    var form = document.createElement('form');
    form.className = 'search';
    form.setAttribute('role', 'search');

    var label = document.createElement('label');
    label.className = 'sr-only';
    label.setAttribute('for', 'q');
    label.textContent = 'Rechercher un article';

    var champ = document.createElement('input');
    champ.type = 'search';
    champ.id = 'q';
    champ.className = 'search-in';
    champ.placeholder = 'Rechercher un article…';
    champ.autocomplete = 'off';
    champ.setAttribute('role', 'combobox');
    champ.setAttribute('aria-autocomplete', 'list');
    champ.setAttribute('aria-expanded', 'false');
    champ.setAttribute('aria-controls', 'q-liste');

    var panneau = document.createElement('div');
    panneau.className = 'search-res';
    panneau.hidden = true;

    var compte = document.createElement('p');
    compte.className = 'search-n';
    compte.setAttribute('aria-live', 'polite');

    var liste = document.createElement('ul');
    liste.id = 'q-liste';
    liste.setAttribute('role', 'listbox');
    liste.setAttribute('aria-label', 'Articles trouvés');

    var tout = document.createElement('a');
    tout.className = 'search-tout';
    tout.href = RACINE + 'produits.html';
    tout.textContent = 'Voir tous les produits';

    panneau.appendChild(compte);
    panneau.appendChild(liste);
    panneau.appendChild(tout);
    form.appendChild(label);
    form.appendChild(champ);
    form.appendChild(panneau);
    barIn.insertBefore(form, cta || null);

    var trouves = [];
    var actif = -1;

    function fermer() {
      panneau.hidden = true;
      champ.setAttribute('aria-expanded', 'false');
      champ.removeAttribute('aria-activedescendant');
      actif = -1;
    }

    function surligner(i) {
      var options = liste.querySelectorAll('[role="option"]');
      actif = i;
      Array.prototype.forEach.call(options, function (o, k) {
        o.classList.toggle('is-on', k === i);
        o.setAttribute('aria-selected', String(k === i));
      });
      if (i >= 0 && options[i]) {
        champ.setAttribute('aria-activedescendant', options[i].id);
        options[i].scrollIntoView({ block: 'nearest' });
      } else {
        champ.removeAttribute('aria-activedescendant');
      }
    }

    function afficher() {
      var terme = pliable(champ.value.trim());
      liste.innerHTML = '';
      if (!terme) { fermer(); compte.textContent = ''; return; }

      trouves = chercher(terme);
      compte.textContent = trouves.length === 0 ? 'Aucun article trouvé'
                         : trouves.length === 1 ? '1 article'
                         : trouves.length + ' articles';

      trouves.slice(0, MAX_PROPOSITIONS).forEach(function (f, k) {
        var li = document.createElement('li');
        li.id = 'q-opt-' + k;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        var a = document.createElement('a');
        a.href = f.url;
        a.tabIndex = -1;
        var ref = document.createElement('span');
        ref.className = 'ref';
        ref.textContent = f.ref;
        var nom = document.createElement('span');
        nom.className = 'search-nom';
        nom.textContent = f.nom;
        var fam = document.createElement('span');
        fam.className = 'search-fam';
        fam.textContent = f.famille;
        a.appendChild(ref);
        a.appendChild(nom);
        a.appendChild(fam);
        li.appendChild(a);
        liste.appendChild(li);
      });

      panneau.hidden = false;
      champ.setAttribute('aria-expanded', 'true');
      surligner(-1);
    }

    var minuteur;
    champ.addEventListener('input', function () {
      window.clearTimeout(minuteur);
      minuteur = window.setTimeout(afficher, 90);
    });
    champ.addEventListener('focus', function () { if (champ.value.trim()) { afficher(); } });

    champ.addEventListener('keydown', function (e) {
      var n = Math.min(trouves.length, MAX_PROPOSITIONS);
      if (e.key === 'ArrowDown' && !panneau.hidden && n) {
        e.preventDefault();
        surligner((actif + 1) % n);
      } else if (e.key === 'ArrowUp' && !panneau.hidden && n) {
        e.preventDefault();
        surligner(actif <= 0 ? n - 1 : actif - 1);
      } else if (e.key === 'Escape') {
        if (!panneau.hidden) { e.preventDefault(); fermer(); }
        else if (champ.value) { e.preventDefault(); champ.value = ''; }
      }
    });

    /* Entrée ouvre l'article surligné, sinon le premier trouvé */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var choix = trouves[actif >= 0 ? actif : 0];
      if (choix) { window.location.href = choix.url; }
    });

    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) { fermer(); }
    });
  })();

  /* ---------- 5. Horaires : ouvert ou fermé, maintenant ---------- */
  var HOURS = {
    1: [480, 1020], 2: [480, 1020], 3: [480, 1020], 4: [480, 1020], 5: [480, 1020],
    6: [540, 780], 0: null
  };
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function hhmm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function nextOpening(day) {
    for (var step = 1; step <= 7; step++) {
      var d = (day + step) % 7;
      if (HOURS[d]) {
        return (step === 1 ? 'demain' : DAYS[d]) + ' à ' + hhmm(HOURS[d][0]);
      }
    }
    return '';
  }

  function refreshStatus() {
    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var slot = HOURS[day];
    var open = !!slot && mins >= slot[0] && mins < slot[1];

    var dot = document.getElementById('statusDot');
    var text = document.getElementById('statusText');
    if (dot && text) {
      dot.classList.toggle('open', open);
      dot.classList.toggle('closed', !open);
      if (open) {
        text.textContent = 'Ouvert — jusqu’à ' + hhmm(slot[1]);
      } else if (slot && mins < slot[0]) {
        text.textContent = 'Fermé — ouvre à ' + hhmm(slot[0]);
      } else {
        text.textContent = 'Fermé — ouvre ' + nextOpening(day);
      }
    }

    var table = document.getElementById('hoursTable');
    if (table) {
      Array.prototype.slice.call(table.querySelectorAll('tr')).forEach(function (tr) {
        tr.classList.toggle('today', Number(tr.dataset.day) === day);
      });
    }
  }
  refreshStatus();
  window.setInterval(refreshStatus, 60000);

  /* ---------- 6. Devis : le formulaire prépare le message WhatsApp ---------- */
  var form = document.getElementById('devisForm');
  var hint = document.getElementById('formHint');

  if (form) {
    /* venu d'une fiche (devis.html?article=MP-03) : l'article est déjà choisi */
    var demande = /[?&]article=([A-Z]{2}-\d{2})/.exec(window.location.search);
    var presta = document.getElementById('f-presta');
    if (demande && presta) {
      Array.prototype.forEach.call(presta.options, function (o) {
        if (o.text.indexOf('(' + demande[1] + ')') !== -1) { o.selected = true; }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (hint) {
          hint.textContent = 'Complétez le nom et la prestation avant d’envoyer.';
          hint.className = 'hint err';
        }
        return;
      }

      var get = function (id) {
        var el = document.getElementById(id);
        return el && el.value ? el.value.trim() : '';
      };

      var lines = ['Bonjour CMY Imprimerie Design,', ''];
      lines.push('Nom : ' + get('f-nom'));
      if (get('f-societe')) { lines.push('Entreprise : ' + get('f-societe')); }
      lines.push('Prestation : ' + get('f-presta'));
      if (get('f-dim')) { lines.push('Dimensions ou quantité : ' + get('f-dim')); }
      if (get('f-lieu')) { lines.push('Commune du chantier : ' + get('f-lieu')); }
      if (get('f-msg')) { lines.push('', 'Détails : ' + get('f-msg')); }
      lines.push('', 'Merci de me faire un devis.');

      var url = 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');

      if (hint) {
        hint.textContent = 'WhatsApp est ouvert : relisez, puis envoyez.';
        hint.className = 'hint ok';
      }
    });
  }

  /* ---------- 7. Année du pied de page ---------- */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
