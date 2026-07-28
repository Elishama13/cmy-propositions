/* ============================================================
   CMY IMPRIMERIE DESIGN — direction « ATELIER »
   Aucune dépendance. Tout le contenu existe sans JavaScript.
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TEL = '2250789736267';

  /* ---------- 1. Menu ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. Les cotes se tracent à la longueur réelle du trait ---------- */
  Array.prototype.slice.call(document.querySelectorAll('.dim path')).forEach(function (p) {
    var len = 260;
    if (typeof p.getTotalLength === 'function') {
      try { len = Math.ceil(p.getTotalLength()) || 260; } catch (err) { len = 260; }
    }
    p.style.setProperty('--len', len);
  });

  /* ---------- 3. Apparition des blocs ---------- */
  var blocks = Array.prototype.slice.call(
    document.querySelectorAll('.ph, .ats, .nom, .table-wrap, .gamme, .affaires, .dev, .cts, .elev')
  );

  if (reduced || !('IntersectionObserver' in window)) {
    blocks.forEach(function (b) { b.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    blocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- 4. Filtre de la nomenclature ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var pieces = Array.prototype.slice.call(document.querySelectorAll('.pc'));
  var empty = document.getElementById('nomEmpty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.cat;
      filters.forEach(function (b) { b.classList.toggle('is-on', b === btn); });

      var shown = 0;
      pieces.forEach(function (pc) {
        var match = cat === 'tout' || pc.dataset.cat === cat;
        pc.hidden = !match;
        if (match) { shown++; }
      });
      if (empty) { empty.hidden = shown !== 0; }
    });
  });

  /* ---------- 5. Horaires ---------- */
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
        text.textContent = 'Atelier ouvert — jusqu’à ' + hhmm(slot[1]);
      } else if (slot && mins < slot[0]) {
        text.textContent = 'Atelier fermé — ouvre à ' + hhmm(slot[0]);
      } else {
        text.textContent = 'Atelier fermé — ouvre ' + nextOpening(day);
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

  /* ---------- 6. Ouverture de dossier → WhatsApp ---------- */
  var form = document.getElementById('devisForm');
  var hint = document.getElementById('formHint');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (hint) {
          hint.textContent = 'Complétez le nom et la pièce avant d’envoyer.';
          hint.className = 'hint err';
        }
        return;
      }

      var get = function (id) {
        var el = document.getElementById(id);
        return el && el.value ? el.value.trim() : '';
      };

      var lines = ['Bonjour CMY Imprimerie Design,', '', 'Ouverture de dossier :'];
      lines.push('Nom : ' + get('f-nom'));
      if (get('f-societe')) { lines.push('Entreprise : ' + get('f-societe')); }
      lines.push('Pièce : ' + get('f-presta'));
      if (get('f-dim')) { lines.push('Cotes ou quantité : ' + get('f-dim')); }
      if (get('f-lieu')) { lines.push('Commune du chantier : ' + get('f-lieu')); }
      if (get('f-msg')) { lines.push('', 'Détails : ' + get('f-msg')); }
      lines.push('', 'Merci de me faire un devis.');

      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');

      if (hint) {
        hint.textContent = 'WhatsApp est ouvert : relisez, puis envoyez.';
        hint.className = 'hint ok';
      }
    });
  }

  /* ---------- 7. Planche courante ---------- */
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

  /* ---------- 8. Année ---------- */
  var y = String(new Date().getFullYear());
  var year = document.getElementById('year');
  if (year) { year.textContent = y; }
  Array.prototype.slice.call(document.querySelectorAll('.year-b')).forEach(function (el) {
    el.textContent = y;
  });
})();
