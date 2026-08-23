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

  /* ---------- 1. Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
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

  /* ---------- 3. L'enseigne s'allume ---------- */
  var sign = document.querySelector('.t-sign');
  if (sign) {
    if (reduced) {
      sign.classList.add('lit');
    } else {
      window.setTimeout(function () { sign.classList.add('lit'); }, 520);
    }
  }

  /* ---------- 4. Filtre du catalogue + recherche ----------
     Un seul état, deux commandes : les boutons de catégorie ne portent que sur le
     catalogue, le champ de recherche porte aussi sur le dépôt. Tout passe par
     appliquer(), pour qu'aucune des deux ne défasse le travail de l'autre. */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.t-item'));
  var mats = Array.prototype.slice.call(document.querySelectorAll('.t-mat'));
  var empty = document.getElementById('catEmpty');
  var emptyMat = document.getElementById('depotEmpty');

  var categorie = 'tout';
  var terme = '';

  /* « Bâche » doit répondre à « bache » : on compare sans accents ni casse */
  function pliable(txt) {
    return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /* le texte d'une vignette ne change jamais : on ne le relit qu'une fois */
  function texteDe(el) {
    if (!el.dataset.recherche) {
      el.dataset.recherche = pliable(el.textContent.replace(/\s+/g, ' ').trim());
    }
    return el.dataset.recherche;
  }

  function appliquer() {
    var vus = 0;

    var visiblesCat = 0;
    items.forEach(function (item) {
      var okCat = categorie === 'tout' || item.dataset.cat === categorie;
      var okTerme = !terme || texteDe(item).indexOf(terme) !== -1;
      var montre = okCat && okTerme;
      item.hidden = !montre;
      if (montre) { visiblesCat++; }
    });
    if (empty) { empty.hidden = visiblesCat !== 0; }
    vus += visiblesCat;

    var visiblesMat = 0;
    mats.forEach(function (mat) {
      var montre = !terme || texteDe(mat).indexOf(terme) !== -1;
      mat.hidden = !montre;
      if (montre) { visiblesMat++; }
    });
    if (emptyMat) { emptyMat.hidden = visiblesMat !== 0; }
    vus += visiblesMat;

    return vus;
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      categorie = btn.dataset.cat;
      filters.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      appliquer();
    });
  });

  /* ---------- 4 bis. La barre de recherche ----------
     Elle n'existe que si le script tourne : sans JavaScript, une commande qui ne
     filtre rien serait un bouton mort. Le reste de la page, lui, est déjà complet. */
  (function recherche() {
    var barIn = document.querySelector('.bar-in');
    var cta = document.querySelector('.bar-cta');
    if (!barIn || (!items.length && !mats.length)) { return; }

    var form = document.createElement('form');
    form.className = 'search';
    form.setAttribute('role', 'search');
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var label = document.createElement('label');
    label.className = 'sr-only';
    label.setAttribute('for', 'q');
    label.textContent = 'Rechercher une pièce ou une matière';

    var champ = document.createElement('input');
    champ.type = 'search';
    champ.id = 'q';
    champ.className = 'search-in';
    champ.placeholder = 'Rechercher…';
    champ.autocomplete = 'off';

    var compte = document.createElement('p');
    compte.className = 'search-n';
    compte.setAttribute('aria-live', 'polite');

    form.appendChild(label);
    form.appendChild(champ);
    form.appendChild(compte);
    barIn.insertBefore(form, cta || null);

    var minuteur;
    champ.addEventListener('input', function () {
      window.clearTimeout(minuteur);
      minuteur = window.setTimeout(function () {
        terme = pliable(champ.value.trim());

        /* une recherche qui garderait une catégorie active ne trouverait rien :
           on rouvre le catalogue en grand dès qu'un terme est saisi */
        if (terme && categorie !== 'tout') {
          categorie = 'tout';
          filters.forEach(function (b) { b.classList.toggle('is-on', b.dataset.cat === 'tout'); });
        }

        var n = appliquer();
        form.classList.toggle('is-on', !!terme);
        if (!terme) { compte.textContent = ''; return; }
        compte.textContent = n === 0 ? 'aucun résultat'
                           : n === 1 ? '1 résultat'
                           : n + ' résultats';
      }, 140);
    });

    champ.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && champ.value) {
        e.preventDefault();
        champ.value = '';
        terme = '';
        appliquer();
        form.classList.remove('is-on');
        compte.textContent = '';
      }
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

  /* ---------- 7. Section courante dans la navigation ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (a) {
          a.classList.toggle('is-here', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 8. Année du pied de page ---------- */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
