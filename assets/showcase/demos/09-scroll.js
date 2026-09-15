/* 09 滚动驱动官网 · Scroll-Driven Official Site (3)
   卡片里是缩略预览，完整的长滚动 + sticky 效果在 scroll.html */
(function () {
  var U = UIK.util;

  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* shared scaffolding: a self-contained scroll window with a sticky stage */
  function scroller(stage, ctx, opts) {
    var host = U.el('div');
    U.css(host, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });

    var win = U.el('div');
    U.css(win, {
      position: 'relative', height: (opts.winH || 150) + 'px', overflowY: 'auto', overflowX: 'hidden',
      overscrollBehavior: 'contain', background: 'var(--d-hole)', border: '1px solid var(--d-border)',
      borderRadius: '10px', scrollbarWidth: 'thin'
    });

    var spacer = U.el('div');
    U.css(spacer, { position: 'relative', height: (opts.winH || 150) * 3 + 'px' });

    var sticky = U.el('div');
    U.css(sticky, {
      position: 'sticky', top: '0', height: (opts.winH || 150) + 'px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
    });

    spacer.appendChild(sticky);
    win.appendChild(spacer);
    host.appendChild(win);

    var foot = U.el('div', 'd-row');
    U.css(foot, { justifyContent: 'space-between' });
    var read = U.el('span', 'd-val', 'progress 0.00');
    var link = U.el('a', 'd-btn primary', '打开完整演示 →');
    link.href = './scroll.html';
    link.target = '_blank';
    link.rel = 'noopener';
    U.css(link, { textDecoration: 'none', fontSize: '12px' });
    foot.appendChild(read);
    foot.appendChild(link);
    host.appendChild(foot);
    stage.appendChild(host);

    var api = {
      win: win, spacer: spacer, sticky: sticky, read: read,
      progress: 0,
      /* frame-synced: read the scroll offset and paint, never a CSS transition */
      bind: function (paint) {
        function update() {
          var span = spacer.offsetHeight - win.clientHeight;
          var p = span > 0 ? clamp(win.scrollTop / span, 0, 1) : 0;
          api.progress = p;
          read.textContent = 'progress ' + p.toFixed(2);
          paint(p);
        }
        ctx.on(win, 'scroll', update, { passive: true });
        ctx.on(window, 'resize', update);
        update();
        return update;
      }
    };
    return api;
  }

  /* 1 · scroll-driven opening */
  UIK.register('scroll', {
    en: 'Scroll-driven Opening', zh: '滚动驱动开场',
    desc: '高区段 + sticky 视口：产品从闭合状态开始，滚动时绕真实转轴打开，文案同步缓出。',
    hint: '在小窗里向下滚：屏幕绕底部铰链旋转，底座不动。完整效果见 scroll.html。',
    h: 300,
    mount: function (stage, ctx) {
      var s = scroller(stage, ctx, { winH: 150 });

      var laptop = U.el('div');
      U.css(laptop, { position: 'relative', width: '190px', height: '118px', perspective: '700px' });

      var lid = U.el('div');
      U.css(lid, {
        position: 'absolute', left: '0', right: '0', bottom: '14px', height: '96px',
        transformOrigin: 'bottom center', transform: 'rotateX(-92deg)', willChange: 'transform',
        borderRadius: '7px 7px 3px 3px', background: 'var(--d-panel)', border: '1px solid var(--d-border)',
        display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px'
      });
      var bar = U.el('div'); U.css(bar, { display: 'flex', gap: '3px' });
      ['', '', ''].forEach(function () { var d = U.el('i'); U.css(d, { width: '5px', height: '5px', borderRadius: '50%', background: 'var(--d-dim-2)', display: 'block' }); bar.appendChild(d); });
      var block = U.el('div'); U.css(block, { flex: '1', borderRadius: '5px', background: 'var(--d-panel-2)', border: '1px solid var(--d-border)' });
      var accent = U.el('div'); U.css(accent, { height: '6px', borderRadius: '3px', background: 'var(--d-accent)', width: '62%' });
      lid.appendChild(bar); lid.appendChild(block); lid.appendChild(accent);

      var base = U.el('div');
      U.css(base, {
        position: 'absolute', left: '-4%', right: '-4%', bottom: '0', height: '16px', borderRadius: '5px',
        background: 'var(--d-panel-2)', border: '1px solid var(--d-border)', transform: 'rotateX(58deg)', transformOrigin: 'bottom center'
      });

      laptop.appendChild(lid); laptop.appendChild(base);

      var title = U.el('div');
      U.css(title, { position: 'absolute', left: '0', right: '0', top: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--d-text)' });
      title.textContent = 'Opens the way you work.';

      s.sticky.appendChild(title);
      s.sticky.appendChild(laptop);

      s.bind(function (p) {
        if (UIK.isReduced()) { lid.style.transform = 'rotateX(-6deg)'; title.style.opacity = '0'; return; }
        var open = easeInOutCubic(p);
        lid.style.transform = 'rotateX(' + lerp(-92, -6, open) + 'deg)';
        var out = 1 - clamp((p - 0.08) / 0.24, 0, 1);
        title.style.opacity = String(out);
        title.style.transform = 'translateY(' + (-14 * (1 - out)) + 'px)';
      });
    }
  });

  /* 2 · horizontal scroll section */
  UIK.register('scroll', {
    en: 'Horizontal Scroll Section', zh: '横向滚动区段',
    desc: '固定视口，横向轨道从右向左移动：用户继续纵向滚动，内容横向检视，输入方向不变。',
    hint: '在小窗里继续向下滚，这一排会横向移动。距离由真实宽度算出，不写死。',
    h: 300,
    mount: function (stage, ctx) {
      var s = scroller(stage, ctx, { winH: 150 });

      var viewport = U.el('div');
      U.css(viewport, { position: 'absolute', left: '14px', right: '14px', top: '50%', transform: 'translateY(-50%)', overflow: 'hidden' });

      var track = U.el('div');
      U.css(track, { display: 'flex', gap: '10px', willChange: 'transform' });

      ['01 · Display', '02 · Battery', '03 · Chassis', '04 · Cooling', '05 · Ports'].forEach(function (t, i) {
        var c = U.el('div');
        U.css(c, {
          flex: '0 0 108px', height: '86px', borderRadius: '8px', background: 'var(--d-panel)',
          border: '1px solid var(--d-border)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px'
        });
        var k = U.el('div'); U.css(k, { fontSize: '9.5px', color: 'var(--d-dim-2)', letterSpacing: '.04em' }); k.textContent = t;
        var img = U.el('div'); U.css(img, { flex: '1', borderRadius: '5px', background: i % 2 ? 'var(--d-panel-2)' : 'var(--d-accent)', opacity: i % 2 ? '1' : '.85' });
        c.appendChild(k); c.appendChild(img); track.appendChild(c);
      });

      viewport.appendChild(track);
      s.sticky.appendChild(viewport);

      s.bind(function (p) {
        if (UIK.isReduced()) { track.style.transform = 'none'; return; }
        var distance = Math.max(track.scrollWidth - viewport.clientWidth, 0);
        track.style.transform = 'translate3d(' + (-distance * easeInOutCubic(p)) + 'px,0,0)';
      });
    }
  });

  /* 3 · scroll-driven hologram scan (canvas 2D preview of the Three.js section) */
  UIK.register('scroll', {
    en: 'Scroll-driven Hologram Scan', zh: '滚动驱动全息扫描',
    desc: '滚动推动一个裁剪面从下往上扫过整机：平面以下以全息显形，平面以上只留残影；反向滚动自顶向下反渲染。',
    hint: '在小窗里滚动：扫描环上移，下方逐层"渲染"出来。完整效果是 Three.js WebGL，见 scroll.html。',
    h: 300,
    mount: function (stage, ctx) {
      var s = scroller(stage, ctx, { winH: 160 });

      var canvas = U.el('canvas');
      U.css(canvas, { display: 'block', width: '100%', height: '100%' });
      s.sticky.appendChild(canvas);
      var c2d = canvas.getContext('2d');

      /* the same stack the WebGL section draws, as a flat cross-section */
      var LAYERS = [
        { w: 0.72, y: 0.76, kind: 'shell' },
        { w: 0.58, y: 0.64, kind: 'board' },
        { w: 0.46, y: 0.54, kind: 'battery' },
        { w: 0.66, y: 0.42, kind: 'deck' },
        { w: 0.58, y: 0.24, kind: 'screen' }
      ];

      function color(name, fb) {
        var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fb;
      }

      function draw(p) {
        var w = s.sticky.clientWidth, h = s.sticky.clientHeight;
        if (!w || !h) return;
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        var accent = color('--d-accent', '#6ea8fe');
        var border = color('--d-border', '#2b3348');
        var hole = color('--d-hole', '#0e121b');

        c2d.clearRect(0, 0, w, h);
        c2d.fillStyle = hole; c2d.fillRect(0, 0, w, h);

        var topY = h * 0.14, bottomY = h * 0.88;
        var scanY = bottomY + (topY - bottomY) * p;      // p=0 bottom, p=1 top

        var lh = Math.max(h * 0.055, 8);
        LAYERS.forEach(function (L) {
          var lw = w * L.w, x = (w - lw) / 2, y = h * L.y;
          var scanned = y >= scanY;                       // below the plane = already rendered
          if (UIK.isReduced()) scanned = true;
          if (scanned) {
            c2d.globalAlpha = 0.85;
            c2d.fillStyle = accent; c2d.fillRect(x, y, lw, lh);
            c2d.globalAlpha = 1;
            c2d.strokeStyle = accent; c2d.lineWidth = 1.4; c2d.strokeRect(x + .5, y + .5, lw - 1, lh - 1);
          } else {
            c2d.globalAlpha = 0.22;
            c2d.strokeStyle = border; c2d.lineWidth = 1; c2d.strokeRect(x + .5, y + .5, lw - 1, lh - 1);
            c2d.globalAlpha = 1;
          }
        });

        if (!UIK.isReduced() && p > 0.004 && p < 0.996) {
          c2d.fillStyle = accent;
          c2d.fillRect(0, scanY - 1, w, 2);
          c2d.globalAlpha = 0.5;
          for (var i = 0; i < 14; i++) {
            var mx = (i / 14) * w + ((i * 37) % 11);
            var my = scanY - ((i * 13) % 26);
            c2d.fillRect(mx, my, 1.5, 1.5);
          }
          c2d.globalAlpha = 1;
        }
      }

      s.bind(draw);
    }
  });
})();
