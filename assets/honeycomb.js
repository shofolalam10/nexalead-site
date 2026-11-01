/* Animated honeycomb background.
   Draws a hexagon grid on a canvas. A soft light band sweeps across the grid and a few cells
   glow and fade out. CSS masks fade the edges into the page. Static when the visitor prefers
   reduced motion, and paused when the canvas is off screen or the tab is hidden. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas.hex-bg'));
  if (!canvases.length) return;
  var SQ3 = Math.sqrt(3);

  canvases.forEach(function (cv) {
    var dark = cv.getAttribute('data-tone') === 'dark';
    var R = parseFloat(cv.getAttribute('data-size')) || 34;
    var rgb = dark ? '150,185,255' : '31,91,255';
    var baseA = dark ? 0.13 : 0.14, waveA = dark ? 0.55 : 0.5, litA = dark ? 0.2 : 0.12;
    var ctx = cv.getContext('2d');
    var w = 0, h = 0, dpr = 1, cells = [], grid = null;
    var lit = [], lastSpawn = 0, last = 0, raf = 0, visible = true;
    var start = performance.now();

    function hex(c, x, y, r) {
      c.moveTo(x + r * Math.cos(-Math.PI / 6), y + r * Math.sin(-Math.PI / 6));
      for (var k = 1; k < 6; k++) {
        var a = Math.PI / 180 * (60 * k - 30);
        c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      }
      c.closePath();
    }

    function build() {
      var rect = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width)); h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      var sw = SQ3 * R, sh = 1.5 * R;
      for (var row = -1, y = 0; y < h + R * 2; row++, y = row * sh) {
        var off = (row & 1) ? sw / 2 : 0;
        for (var x = -sw + off; x < w + sw; x += sw) cells.push({ x: x, y: y });
      }
      grid = document.createElement('canvas');
      grid.width = w * dpr; grid.height = h * dpr;
      var g = grid.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(' + rgb + ',' + baseA + ')';
      g.beginPath();
      for (var i = 0; i < cells.length; i++) hex(g, cells[i].x, cells[i].y, R - 1);
      g.stroke();
    }

    function draw(now) {
      var t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(grid, 0, 0, w, h);

      /* diagonal light band: a few cells at a time brighten as it passes */
      var L = Math.max(w, h) * 0.9, speed = 0.045;
      ctx.lineWidth = 1.4;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var p = (c.x * 0.8 + c.y * 0.6) / L - t * speed;
        var band = Math.sin(p * Math.PI * 2);
        if (band > 0.82) {
          var a = (band - 0.82) / 0.18;
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (a * waveA).toFixed(3) + ')';
          ctx.beginPath(); hex(ctx, c.x, c.y, R - 1); ctx.stroke();
        }
      }

      /* glowing cells */
      if (!reduce && now - lastSpawn > 900 && lit.length < 9 && cells.length) {
        lastSpawn = now;
        lit.push({ c: cells[(Math.random() * cells.length) | 0], born: now, life: 3600 + Math.random() * 2000 });
      }
      for (var j = lit.length - 1; j >= 0; j--) {
        var L2 = lit[j], age = (now - L2.born) / L2.life;
        if (age >= 1) { lit.splice(j, 1); continue; }
        var k = Math.sin(age * Math.PI);
        ctx.beginPath(); hex(ctx, L2.c.x, L2.c.y, R - 1);
        ctx.fillStyle = 'rgba(' + rgb + ',' + (k * litA).toFixed(3) + ')'; ctx.fill();
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (k * waveA * 0.8).toFixed(3) + ')'; ctx.stroke();
      }
    }

    function frame(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - last >= 33) { last = now; draw(now); }
      raf = requestAnimationFrame(frame);
    }
    function play() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }

    function seedStatic() {
      /* a few fixed glowing cells so the still version is not flat */
      lit = [];
      for (var n = 0; n < 7 && cells.length; n++) {
        lit.push({ c: cells[(((n * 7919) % cells.length) + cells.length) % cells.length], born: 0, life: 2 });
      }
      var now = 0.5; start = 0;
      ctx.clearRect(0, 0, w, h); ctx.drawImage(grid, 0, 0, w, h);
      lit.forEach(function (l) {
        ctx.beginPath(); hex(ctx, l.c.x, l.c.y, R - 1);
        ctx.fillStyle = 'rgba(' + rgb + ',' + litA + ')'; ctx.fill();
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (waveA * 0.7) + ')'; ctx.stroke();
      });
    }

    build();
    if (reduce) seedStatic();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { build(); if (reduce) seedStatic(); }, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) play();
      }).observe(cv);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) play(); });
    play();
  });
})();
