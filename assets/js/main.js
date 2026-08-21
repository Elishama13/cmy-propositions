/* =============================================================================
   CMY IMPRIMERIE DESIGN — comportements de page
   Aucune dépendance. Tout est progressif : sans JS, la page reste lisible et
   le catalogue affiche l'intégralité des références.
   ============================================================================= */
(function () {
  'use strict';

  var WA_NUMBER = '2250789736267';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Marque la page comme scriptée : c'est cette classe qui autorise le CSS à
     masquer les éléments animés. Sans JS, rien n'est caché. */
  document.documentElement.classList.add('js');

  /* ------------------------------------------------ 1. CALQUE DE GRILLE */
  /* Le calque lit les mêmes variables CSS que le contenu : ses colonnes sont
     exactement les colonnes du contenu, à toutes les largeurs. */
  var cols = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--cols').trim() || '12', 10);

  document.querySelectorAll('.guides .cols').forEach(function (host) {
    for (var i = 1; i <= cols; i++) {
      var col = document.createElement('div');
      col.className = 'col';
      var n = document.createElement('span');
      n.textContent = i;
      col.appendChild(n);
      host.appendChild(col);
    }
  });

  var gridBtn = document.getElementById('gridToggle');

  function setGrid(on) {
    document.body.classList.toggle('grid-on', on);
    if (!gridBtn) return;
    gridBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var label = gridBtn.querySelector('.lbl');
    if (label) label.textContent = on ? 'Masquer la grille' : 'Voir la grille';
  }

  if (gridBtn) {
    gridBtn.addEventListener('click', function () {
      setGrid(!document.body.classList.contains('grid-on'));
    });
  }

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      setGrid(!document.body.classList.contains('grid-on'));
    }
  });

  /* ------------------------------------------- 2. ALIGNEMENT OPTIQUE */
  /* Un titre de 120 px dont la BOÎTE est sur la ligne de colonne paraît
     toujours décalé : l'encre du glyphe est en retrait de son approche
     gauche. On mesure ce retrait sur la police réellement chargée et on
     décale la boîte pour que l'ENCRE tombe sur la ligne. */
  (function opticalAlign() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var selector = '.masthead, .shead h2, .numeral';

    function align() {
      document.querySelectorAll(selector).forEach(function (el) {
        el.style.marginLeft = '0px';
        var cs = getComputedStyle(el);
        var ch = (el.textContent || '').trim().charAt(0);
        if (!ch) return;
        if (cs.textTransform === 'uppercase') ch = ch.toUpperCase();
        ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        ctx.textAlign = 'left';
        var abl = ctx.measureText(ch).actualBoundingBoxLeft;
        if (isFinite(abl)) el.style.marginLeft = abl.toFixed(2) + 'px';
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
    align();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(align, 120);
    });
  })();

  /* --------------------------------------------------- 3. MENU MOBILE */
  var burger = document.getElementById('burger');
  var topbar = document.getElementById('topbar');

  if (burger && topbar) {
    burger.addEventListener('click', function () {
      var open = topbar.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    topbar.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        topbar.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------- 4. FILTRES CATALOGUE */
  var filters = document.querySelectorAll('.filter');
  var items = document.querySelectorAll('#catalogue-liste .item');
  var emptyMsg = document.getElementById('catalogue-vide');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.cat;
      filters.forEach(function (b) { b.classList.toggle('is-on', b === btn); });

      var shown = 0;
      items.forEach(function (item) {
        var match = cat === 'tout' || item.dataset.cat === cat;
        item.classList.toggle('is-out', !match);
        if (match) shown++;
      });
      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  });

  /* ------------------------------------------- 5. DEVIS → WHATSAPP */
  /* Le formulaire ne poste rien : il compose un message et l'ouvre dans
     WhatsApp, où le client relit avant d'envoyer. Aucune donnée stockée. */
  var form = document.getElementById('devisForm');
  var hint = document.getElementById('formHint');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nom = form.nom.value.trim();
      var presta = form.presta.value;
      var manquants = [];

      form.nom.classList.remove('err');
      form.presta.classList.remove('err');

      if (!nom) { manquants.push('votre nom'); form.nom.classList.add('err'); }
      if (!presta) { manquants.push('la prestation'); form.presta.classList.add('err'); }

      if (manquants.length) {
        if (hint) {
          hint.textContent = 'Il manque ' + manquants.join(' et ') + '.';
          hint.classList.add('err');
        }
        (manquants[0] === 'votre nom' ? form.nom : form.presta).focus();
        return;
      }

      if (hint) {
        hint.textContent = 'WhatsApp s’ouvre avec le message préparé.';
        hint.classList.remove('err');
      }

      var lignes = ['Bonjour CMY, je souhaite un devis.', ''];
      lignes.push('Nom : ' + nom);
      if (form.societe.value.trim()) lignes.push('Entreprise : ' + form.societe.value.trim());
      lignes.push('Prestation : ' + presta);
      if (form.dim.value.trim()) lignes.push('Dimensions / quantité : ' + form.dim.value.trim());
      if (form.lieu.value.trim()) lignes.push('Commune : ' + form.lieu.value.trim());
      if (form.msg.value.trim()) { lignes.push('', 'Détails :', form.msg.value.trim()); }

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lignes.join('\n'));
      window.open(url, '_blank', 'noopener');
    });

    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('err'); });
    });
  }

  /* ------------------------------------------- 6. HORAIRES D'OUVERTURE */
  /* La Côte d'Ivoire est à UTC+0 toute l'année : on raisonne en UTC pour que
     le statut soit juste quel que soit le fuseau du visiteur. */
  var HORAIRES = {
    1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17],
    6: [9, 13], 0: null
  };

  (function statut() {
    var now = new Date();
    var jour = now.getUTCDay();
    var heure = now.getUTCHours() + now.getUTCMinutes() / 60;
    var plage = HORAIRES[jour];
    var ouvert = !!plage && heure >= plage[0] && heure < plage[1];

    var dot = document.querySelector('.status-dot');
    var texte = document.getElementById('statusText');

    if (dot) dot.classList.add(ouvert ? 'open' : 'closed');

    if (texte) {
      if (ouvert) {
        texte.textContent = 'Atelier ouvert — ferme à ' + plage[1] + ':00';
      } else {
        var j = jour, i = 0, suivant = null;
        while (i < 7) { j = (j + 1) % 7; i++; if (HORAIRES[j]) { suivant = j; break; } }
        var noms = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        if (plage && heure < plage[0]) {
          texte.textContent = 'Ouvre aujourd’hui à ' + plage[0] + ':00';
        } else if (suivant !== null) {
          texte.textContent = 'Fermé — ouvre ' + noms[suivant] + ' à ' + HORAIRES[suivant][0] + ':00';
        } else {
          texte.textContent = 'Fermé';
        }
      }
    }

    var ligne = document.querySelector('#hoursTable tr[data-day="' + jour + '"]');
    if (ligne) ligne.classList.add('is-today');
  })();

  /* --------------------------------- 7. PROGRESSION + NAVIGATION ACTIVE */
  var bar = document.querySelector('.densitobar');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  var ticking = false;

  function onScroll() {
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--read', h > 0 ? (window.scrollY / h).toFixed(4) : 0);
    }

    var courante = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 120) courante = i;
    }
    navLinks.forEach(function (a, i) { a.classList.toggle('is-here', i === courante); });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------ 8. MISE SOUS PRESSE */
  /* Séquence d'ouverture : le filet se tire, les lignes du titre montent,
     puis les trois encres se déposent dans l'ordre du passage en quadri —
     cyan, magenta, jaune. On attend la police : une ligne qui monte pendant
     que le glyphe change de fonte saute à l'arrivée. */
  (function ouverture() {
    var hero = document.querySelector('.spread-hero');
    var titre = document.querySelector('.spread-hero .lines');
    var encres = document.getElementById('inkstack');

    function lancer() {
      if (hero) hero.classList.add('is-in');
      if (titre) titre.classList.add('is-in');
      if (encres) encres.parentElement.classList.add('is-in');
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { requestAnimationFrame(lancer); });
      setTimeout(lancer, 1200);   // filet de sécurité si la police ne répond pas
    } else {
      lancer();
    }
  })();

  /* Les titres de section montent quand la section entre dans le champ. */
  if ('IntersectionObserver' in window) {
    var titres = document.querySelectorAll('main .lines:not(.masthead), .foot .lines');
    var ioTitres = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        ioTitres.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.1 });
    titres.forEach(function (t) { ioTitres.observe(t); });
  } else {
    document.querySelectorAll('.lines').forEach(function (t) { t.classList.add('is-in'); });
  }

  /* --------------------------------------- 9. RÉVÉLATION AU DÉFILEMENT */
  if (!reduced && 'IntersectionObserver' in window) {
    var cibles = document.querySelectorAll('.trade, .item, .step, .work, .mat tbody tr, .ccol, .aside');
    cibles.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    cibles.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------ 10. DIVERS */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
