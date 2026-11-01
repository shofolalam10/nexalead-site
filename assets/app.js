/* Nexa Lead homepage interactions */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* Mega menus */
  var megas = $$('[data-mega]');
  function closeAll(except) {
    megas.forEach(function (b) {
      if (b !== except) {
        b.setAttribute('aria-expanded', 'false');
        $('#' + b.getAttribute('aria-controls')).classList.remove('open');
      }
    });
  }
  megas.forEach(function (b) {
    var m = $('#' + b.getAttribute('aria-controls'));
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', String(!open));
      m.classList.toggle('open', !open);
    });
    m.addEventListener('click', function (e) { e.stopPropagation(); });
  });
  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var openBtn = megas.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
      closeAll();
      if (openBtn) openBtn.focus();
    }
  });

  /* Mobile drawer */
  var burger = $('.burger'), drawer = $('#drawer');
  burger.addEventListener('click', function () {
    var o = drawer.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(o));
    burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  });
  $$('a', drawer).forEach(function (a) {
    a.addEventListener('click', function () {
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    });
  });

  /* Hero call sequence: the one orchestrated moment on the page */
  var msgs = $$('#thread .msg'), typing = $('#typing'), fBook = $('#fBook'), fSum = $('#fSum'), timer = $('#timer');
  if (reduce) {
    msgs.forEach(function (m) { m.classList.add('show'); });
    fBook.classList.add('show'); fSum.classList.add('show');
    timer.textContent = '1:12';
  } else {
    var t = 0, sec = 0;
    var iv = setInterval(function () {
      sec++;
      timer.textContent = Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
      if (sec >= 72) clearInterval(iv);
    }, 1000);
    msgs.forEach(function (m, i) {
      var isAi = m.classList.contains('ai');
      t += i === 0 ? 400 : (isAi ? 1500 : 1100);
      if (isAi && i > 0) {
        (function (at, el) {
          setTimeout(function () { typing.classList.add('show'); el.parentNode.insertBefore(typing, el); }, at - 900);
        })(t, m);
      }
      (function (el, at) {
        setTimeout(function () { typing.classList.remove('show'); el.classList.add('show'); }, at);
      })(m, t);
    });
    setTimeout(function () { fBook.classList.add('show'); }, t + 600);
    setTimeout(function () { fSum.classList.add('show'); }, t + 1400);
  }

  /* Tabs with arrow-key support. Used by the showcase and the FAQ. */
  function wireTabs(tabs, onSelect) {
    function select(tb, focus) {
      tabs.forEach(function (o) {
        var on = o === tb;
        o.setAttribute('aria-selected', String(on));
        o.tabIndex = on ? 0 : -1;
      });
      onSelect(tb);
      if (focus) tb.focus();
    }
    tabs.forEach(function (tb, i) {
      tb.addEventListener('click', function () { select(tb, false); });
      tb.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    return select;
  }
  var stabs = $$('#showcase .tab');
  var selectShow = wireTabs(stabs, function (tb) {
    stabs.forEach(function (o) { $('#' + o.getAttribute('aria-controls')).classList.toggle('on', o === tb); });
  });
  $$('[data-tab]').forEach(function (a) {
    a.addEventListener('click', function () {
      var tb = $('#' + a.getAttribute('data-tab'));
      if (tb) selectShow(tb, false);
      closeAll();
    });
  });

  var ftabs = $$('[data-faq]');
  wireTabs(ftabs, function (tb) {
    ftabs.forEach(function (o) { $('#' + o.getAttribute('data-faq')).classList.toggle('on', o === tb); });
  });

  /* Industries */
  var IND = {
    roofing: { t: 'Roofing', d: 'After a storm, your phone can ring nonstop while your crew is on roofs. Every caller gets answered, gets the right questions, and gets an inspection on the calendar.', q: 'Caller: "Hail hit my roof last night. Can someone look at it this week?"' },
    hvac: { t: 'HVAC', d: 'Breakdowns do not wait for business hours. Urgent no-heat and no-cool calls get routed to your on-call tech, and routine tune-ups get booked.', q: 'Caller: "My AC stopped working and it is 95 degrees upstairs."' },
    plumbing: { t: 'Plumbing', d: 'Leaks and backups need a fast answer. Callers get help right away, emergencies reach you, and estimates land on your schedule.', q: 'Caller: "Water heater is leaking all over the garage floor."' },
    electrical: { t: 'Electrical', d: 'Most calls are quote requests. We collect the job details, photos if needed, and book the estimate so you show up prepared.', q: 'Caller: "I need a quote to add outlets in my basement."' },
    property: { t: 'Property management', d: 'Tenants call about maintenance at all hours. True emergencies get routed to you and everything else becomes a clean work order.', q: 'Tenant: "The kitchen sink is backing up and will not drain."' },
    auto: { t: 'Auto repair', d: 'Callers want quotes, status updates, and appointments. Handle the routine questions automatically and keep your front counter moving.', q: 'Caller: "Can I get my brakes looked at on Friday morning?"' },
    salon: { t: 'Salons and barbers', d: 'Your hands are busy with clients. Booking, rescheduling, and common questions get handled without interrupting a cut.', q: 'Caller: "Do you have anything open Saturday for a fade?"' }
  };
  var card = $('#indCard'), ibtns = $$('.ind-btn');
  function showInd(k) {
    var x = IND[k]; if (!x) return;
    ibtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ind') === k)); });
    card.innerHTML = '';
    var h = document.createElement('h3'); h.textContent = x.t;
    var p = document.createElement('p'); p.textContent = x.d;
    var q = document.createElement('div'); q.className = 'q';
    var s = document.createElement('small'); s.textContent = 'A typical call';
    q.appendChild(s); q.appendChild(document.createTextNode(x.q));
    var a = document.createElement('a'); a.className = 'btn'; a.href = '#contact'; a.style.marginTop = '22px'; a.textContent = 'Book a call';
    card.appendChild(h); card.appendChild(p); card.appendChild(q); card.appendChild(a);
  }
  ibtns.forEach(function (b) { b.addEventListener('click', function () { showInd(b.getAttribute('data-ind')); }); });
  $$('a[data-ind]').forEach(function (a) { a.addEventListener('click', function () { showInd(a.getAttribute('data-ind')); closeAll(); }); });
  showInd('roofing');
})();
