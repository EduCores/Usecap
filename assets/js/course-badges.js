/**
 * Course photo status badges
 *
 * Injects status badges (styled after .slider-badge) into each
 * .single-courses .courses-images, randomly distributed:
 *
 *  - #309255 (green)  -> "Inscríbete" (with a white countdown above it)
 *  - #FF4D4D (red)    -> "En Clases" + below "Próximo · {fecha random de reapertura}" (green)
 *  - #F1B441 (yellow) -> "Últimos Cupos"
 *
 * Each card carries only ONE badge; the red one is the only exception and stacks
 * its "Próximo · fecha" badge (in green) underneath. The green badge shows a
 * countdown (date/time counting in reverse, white) above it. The column is
 * aligned to the bottom right of the photo.
 */
(function () {
  'use strict';

  var MONTHS = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  // Random reopening dates used by the red "En Clases" badge.
  var REOPEN_DATES = [
    'Próximo · 15 de septiembre',
    'Próximo · 03 de octubre',
    'Próximo · 22 de noviembre',
    'Próximo · 08 de diciembre',
    'Próximo · 17 de enero 2027',
    'Próximo · 26 de febrero 2027'
  ];

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // Random future target for the green countdown (between 10 and 40 days ahead).
  function randomTarget() {
    var days = 10 + Math.floor(Math.random() * 31);
    var ms = days * 24 * 60 * 60 * 1000 +
      Math.floor(Math.random() * 24) * 60 * 60 * 1000 +
      Math.floor(Math.random() * 60) * 60 * 1000;
    return new Date(Date.now() + ms);
  }

  // Short target for the yellow "Últimos Cupos" badge: counter almost ending
  // (a few minutes up to ~2 hours ahead).
  function randomShortTarget() {
    var ms = Math.floor(Math.random() * 120) * 60 * 1000 +
      Math.floor(Math.random() * 60) * 1000;
    return new Date(Date.now() + ms);
  }

  function buildCountdown(target, variant) {
    var dateLabel = target.getDate() + ' ' + MONTHS[target.getMonth()] + ' ' +
      target.getFullYear() + ' · ' + pad(target.getHours()) + ':' + pad(target.getMinutes());

    var v = variant ? ' countdown-' + variant : '';

    return '<div class="course-countdown' + v + '" data-target="' + target.getTime() + '">' +
      '<span class="countdown-date">' + dateLabel + '</span>' +
      '<span class="countdown-timer">--d : --h : --m : --s</span>' +
      '</div>';
  }

  function startCountdown(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var timerEl = el.querySelector('.countdown-timer');

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        timerEl.textContent = '0d : 00h : 00m : 00s';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      timerEl.textContent = d + 'd : ' + pad(h) + 'h : ' + pad(m) + 'm : ' + pad(s) + 's';
    }

    tick();
    setInterval(tick, 1000);
  }

  function boldMetaNumbers() {
    var spans = document.querySelectorAll('.single-courses .courses-meta span');
    Array.prototype.forEach.call(spans, function (span) {
      Array.prototype.forEach.call(span.childNodes, function (node) {
        if (node.nodeType !== 3) {
          return;
        }
        var t = node.nodeValue;
        var m = t.match(/^\s*(\d+\s*h\s*\d+\s*min|\d[\d.,]*)\s*([\s\S]*)$/);
        if (!m) {
          return;
        }
        var num = m[1];
        var rest = m[2];
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode(' '));
        var strong = document.createElement('strong');
        strong.textContent = num;
        frag.appendChild(strong);
        frag.appendChild(document.createTextNode(rest));
        span.replaceChild(frag, node);
      });
    });
  }

  function buildBadge(kind) {
    var badge = '';
    var countdown = '';

    if (kind === 'green') {
      badge = '<div class="badge-row badge-row--green"><span class="course-badge badge-green">Inscríbete</span></div>';
      countdown = buildCountdown(randomTarget(), 'green');
    } else if (kind === 'red') {
      var date = REOPEN_DATES[Math.floor(Math.random() * REOPEN_DATES.length)];
      badge = '<div class="badge-row badge-row--red"><span class="course-badge badge-red">En Clases</span>' +
        '<span class="course-badge badge-green">' + date + '</span></div>';
    } else {
      badge = '<div class="badge-row badge-row--yellow"><span class="course-badge badge-yellow">Últimos Cupos</span></div>';
      countdown = buildCountdown(randomShortTarget(), 'yellow');
    }

    return { badge: badge, countdown: countdown };
  }

  function init() {
    var wrappers = document.querySelectorAll('.single-courses .courses-images');

    Array.prototype.forEach.call(wrappers, function (wrap) {
      var roll = Math.random();
      var kinds = [];

      if (roll < 0.4) {
        kinds.push('green');
      } else if (roll < 0.75) {
        kinds.push('red');
      } else {
        kinds.push('yellow');
      }

      var col = document.createElement('div');
      col.className = 'courses-badges';

      var html = '';
      kinds.forEach(function (kind) {
        var built = buildBadge(kind);
        html += built.badge;

        if (built.countdown) {
          var tmp = document.createElement('div');
          tmp.innerHTML = built.countdown;
          var countdownEl = tmp.firstElementChild;
          wrap.appendChild(countdownEl);
          startCountdown(countdownEl);
        }
      });
      col.innerHTML = html;

      wrap.appendChild(col);
    });

    boldMetaNumbers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();