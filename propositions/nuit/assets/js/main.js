/* ============================================================
   CMY IMPRIMERIE DESIGN — direction « NUIT »
   Comportements de la page, y compris l'interrupteur de l'enseigne
   du héros. Aucune dépendance : la page fonctionne hors ligne.
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
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. Apparition ---------- */
  var blocks = Array.prototype.slice.call(
    document.querySelectorAll('.sh, .tri, .cat, .mats, .steps, .works, .dev, .cts, .filters')
  );

  if (reduced || !('IntersectionObserver' in window)) {
    blocks.forEach(function (b) { b.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    blocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- 3. Filtre du catalogue ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.it'));
  var empty = document.getElementById('catEmpty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.cat;
      filters.forEach(function (b) { b.classList.toggle('is-on', b === btn); });

      var shown = 0;
      items.forEach(function (item) {
        var match = cat === 'tout' || item.dataset.cat === cat;
        item.hidden = !match;
        if (match) { shown++; }
      });
      if (empty) { empty.hidden = shown !== 0; }
    });
  });

  /* ---------- 4. Horaires ---------- */
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

  /* ---------- 5. Devis → WhatsApp ---------- */
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

      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');

      if (hint) {
        hint.textContent = 'WhatsApp est ouvert : relisez, puis envoyez.';
        hint.className = 'hint ok';
      }
    });
  }

  /* ---------- 6. Section courante ---------- */
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

  /* ---------- 7. Interrupteur de l'enseigne ----------
     L'enseigne du héros s'allume et s'éteint comme au dépôt, avant la
     pose : c'est le test de mise sous tension. L'allumage se fait à
     l'entrée dans le champ, puis le bouton reprend la main. */
  var stage = document.getElementById('stage');
  var switchBtn = document.getElementById('lightSwitch');
  var switchLabel = document.getElementById('switchLabel');
  var ctrlNote = document.getElementById('ctrlNote');

  if (stage && switchBtn) {
    var lit = true;

    var poser = function (next) {
      lit = next;
      stage.classList.toggle('off', !lit);
      switchBtn.setAttribute('aria-pressed', String(lit));
      if (switchLabel) {
        switchLabel.textContent = lit ? 'Enseigne allumée' : 'Enseigne éteinte';
      }
      if (ctrlNote) {
        ctrlNote.textContent = lit
          ? 'Coupez le courant pour voir ce que vos clients voient le jour.'
          : 'Rallumez : c\u2019est ce que voient vos clients après 18 h.';
      }
    };

    switchBtn.addEventListener('click', function () { poser(!lit); });

    /* mise sous tension progressive, sauf si l'on préfère le mouvement réduit */
    if (!reduced && 'IntersectionObserver' in window) {
      stage.classList.add('off');
      var mise = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) { return; }
        window.setTimeout(function () { stage.classList.remove('off'); }, 420);
        mise.disconnect();
      }, { threshold: 0.35 });
      mise.observe(stage);
    }
  }

  /* ---------- 8. Année ---------- */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
