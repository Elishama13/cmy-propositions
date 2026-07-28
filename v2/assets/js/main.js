/* =============================================================================
   CMY IMPRIMERIE DESIGN — proposition 2
   Aucune dépendance. Tout est progressif : sans JS, la page reste en mode nuit,
   entièrement lisible, et le catalogue affiche toutes les pièces.
   ============================================================================= */
(function () {
  'use strict';

  var WA = '2250789736267';
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var racine = document.documentElement;

  /* ─────────────────────────────────── 1. L'INTERRUPTEUR (le geste) */
  /* Une enseigne a deux vies : le jour le relief, la nuit la lumière.
     Tout le site bascule d'un état à l'autre. */
  var inter = document.getElementById('switch');
  var etat = document.getElementById('switchEtat');

  function poserMode(mode) {
    racine.setAttribute('data-mode', mode);
    var nuit = mode === 'nuit';
    if (etat) etat.textContent = nuit ? 'Nuit' : 'Jour';
    if (inter) inter.setAttribute('aria-checked', nuit ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', nuit ? '#06080d' : '#e6e7ea');
  }

  if (inter) {
    inter.addEventListener('click', function () {
      poserMode(racine.getAttribute('data-mode') === 'nuit' ? 'jour' : 'nuit');
    });
  }

  /* ─────────────────────────────────── 2. LA MISE SOUS TENSION */
  /* Le mot du titre s'allume avec l'amorçage hésitant d'un tube, puis la
     rangée de caissons suit. On attend la police : allumer un mot dont le
     dessin change encore, c'est le voir sauter. */
  var neon = document.getElementById('neon');
  var facade = document.querySelector('.facade');

  function allumer() {
    if (neon) neon.classList.add('allume');
    if (facade) facade.classList.add('on');
  }

  function amorcer() {
    if (!neon || reduit) { allumer(); return; }
    // deux ratés, puis ça tient — comme un tube froid
    var temps = [90, 160, 240, 330, 520];
    temps.forEach(function (t, i) {
      setTimeout(function () {
        neon.classList.toggle('allume', i % 2 === 1 || i === temps.length - 1);
      }, t);
    });
    setTimeout(function () { if (facade) facade.classList.add('on'); }, 560);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(amorcer, 220); });
    setTimeout(allumer, 2000);           // filet de sécurité si la police ne répond pas
  } else {
    amorcer();
  }

  /* ─────────────────────────────────── 3. LA LAMPE QUI SUIT LE CURSEUR */
  var lampe = document.querySelector('.lampe');
  var finPointeur = window.matchMedia('(pointer: fine)').matches;

  if (lampe && finPointeur && !reduit) {
    var x = 0, y = 0, enAttente = false;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(function () {
        lampe.style.setProperty('--mx', x + 'px');
        lampe.style.setProperty('--my', y + 'px');
        lampe.classList.add('on');
        enAttente = false;
      });
    }, { passive: true });
  }

  /* ─────────────────────────────────── 4. MENU MOBILE */
  var burger = document.getElementById('burger');
  var barre = document.getElementById('barre');

  if (burger && barre) {
    burger.addEventListener('click', function () {
      var ouvert = barre.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    barre.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        barre.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─────────────────────────────────── 5. TRI DES PIÈCES */
  var tris = document.querySelectorAll('.tri');
  var pieces = document.querySelectorAll('#listePieces .piece');
  var vide = document.getElementById('videPieces');

  tris.forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var cat = bouton.dataset.cat;
      tris.forEach(function (b) { b.classList.toggle('actif', b === bouton); });

      var visibles = 0;
      pieces.forEach(function (p) {
        var garde = cat === 'tout' || p.dataset.cat === cat;
        p.classList.toggle('masquee', !garde);
        if (garde) visibles++;
      });
      if (vide) vide.hidden = visibles !== 0;
    });
  });

  /* ─────────────────────────────────── 6. DEVIS → WHATSAPP */
  /* Rien n'est posté ni stocké : on compose le message et on l'ouvre dans
     WhatsApp, où le client relit avant d'envoyer. */
  var form = document.getElementById('formDevis');
  var note = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nom = form.nom.value.trim();
      var objet = form.objet.value;
      var manque = [];

      form.nom.classList.remove('faux');
      form.objet.classList.remove('faux');

      if (!nom) { manque.push('votre nom'); form.nom.classList.add('faux'); }
      if (!objet) { manque.push('ce que vous voulez'); form.objet.classList.add('faux'); }

      if (manque.length) {
        if (note) {
          note.textContent = 'Il manque ' + manque.join(' et ') + '.';
          note.classList.add('faux');
        }
        (manque[0] === 'votre nom' ? form.nom : form.objet).focus();
        return;
      }

      if (note) {
        note.textContent = 'WhatsApp s’ouvre avec le message préparé.';
        note.classList.remove('faux');
      }

      var l = ['Bonjour CMY, je souhaite un devis.', ''];
      l.push('Nom : ' + nom);
      if (form.societe.value.trim()) l.push('Entreprise : ' + form.societe.value.trim());
      l.push('Demande : ' + objet);
      if (form.dim.value.trim()) l.push('Dimensions / quantité : ' + form.dim.value.trim());
      if (form.lieu.value.trim()) l.push('Commune : ' + form.lieu.value.trim());
      if (form.msg.value.trim()) { l.push('', 'Détails :', form.msg.value.trim()); }

      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')),
                  '_blank', 'noopener');
    });

    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('faux'); });
    });
  }

  /* ─────────────────────────────────── 7. HORAIRES */
  /* La Côte d'Ivoire est à UTC+0 toute l'année : on raisonne en UTC pour que
     le statut soit juste quel que soit le fuseau du visiteur. */
  var H = { 1:[8,17], 2:[8,17], 3:[8,17], 4:[8,17], 5:[8,17], 6:[9,13], 0:null };

  (function statut() {
    var d = new Date();
    var jour = d.getUTCDay();
    var heure = d.getUTCHours() + d.getUTCMinutes() / 60;
    var plage = H[jour];
    var ouvert = !!plage && heure >= plage[0] && heure < plage[1];

    var pastille = document.getElementById('pastille');
    var texte = document.getElementById('etatAtelier');

    if (pastille) {
      pastille.style.cssText =
        'width:8px;height:8px;border-radius:50%;flex:0 0 auto;background:' +
        (ouvert ? 'var(--led-vert)' : 'var(--txt-2)');
    }

    if (texte) {
      if (ouvert) {
        texte.textContent = 'Atelier ouvert jusqu’à ' + plage[1] + ':00';
      } else {
        var j = jour, i = 0, suivant = null;
        while (i < 7) { j = (j + 1) % 7; i++; if (H[j]) { suivant = j; break; } }
        var noms = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
        if (plage && heure < plage[0]) {
          texte.textContent = 'Atelier ouvre à ' + plage[0] + ':00';
        } else if (suivant !== null) {
          texte.textContent = 'Atelier fermé — ouvre ' + noms[suivant] + ' à ' + H[suivant][0] + ':00';
        } else {
          texte.textContent = 'Atelier fermé';
        }
      }
    }

    var ligne = document.querySelector('#tableHoraires tr[data-jour="' + jour + '"]');
    if (ligne) ligne.classList.add('aujourdhui');
  })();

  /* ─────────────────────────────────── 8. NAVIGATION ACTIVE */
  var liens = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = liens
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  var tick = false;

  function auDefilement() {
    var courante = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 140) courante = i;
    }
    liens.forEach(function (a, i) { a.classList.toggle('ici', i === courante); });
    tick = false;
  }

  window.addEventListener('scroll', function () {
    if (!tick) { requestAnimationFrame(auDefilement); tick = true; }
  }, { passive: true });
  auDefilement();

  /* ─────────────────────────────────── 9. RÉVÉLATION */
  if (!reduit && 'IntersectionObserver' in window) {
    var cibles = document.querySelectorAll('.vie, .piece, .stock li, .etapes li, .ch, .bloc');
    cibles.forEach(function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) return;
        entree.target.classList.add('vu');
        io.unobserve(entree.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    cibles.forEach(function (el) { io.observe(el); });
  }

  /* ─────────────────────────────────── 10. DIVERS */
  var annee = document.getElementById('annee');
  if (annee) annee.textContent = new Date().getFullYear();
})();
