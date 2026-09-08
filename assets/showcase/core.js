/* UI Interaction Kit · showcase runtime */
(function () {
  'use strict';

  var CATS = [
    { id: 'motion',   n: '01', title: '质感动效',   en: 'Motion Texture (8)',      desc: '让运动与距离、速度、层级、用户输入建立关系' },
    { id: 'chart',    n: '02', title: '图表交互',   en: 'Chart Interaction (7)',   desc: '先理解任务，再选交互，最后写代码' },
    { id: 'patterns', n: '03', title: '高级交互模式', en: 'App Interaction Patterns (10)', desc: '变化从哪发生、落在哪、谁回应、周围是否让位' },
    { id: 'expand',   n: '04', title: '展开动画',   en: 'Expand Animations (7)',   desc: '起始状态 / 最终状态 / 变化属性 / 收回方式' },
    { id: 'collapse', n: '05', title: '折叠组件',   en: 'Collapse Components (8)', desc: '内容从隐藏变为显示的 8 种组织方式' },
    { id: 'nav',      n: '06', title: '导航组件',   en: 'Navigation (7)',          desc: '组件类型 / 放置位置 / 切换内容 / 高亮方式' },
    { id: 'overlay',  n: '07', title: '弹窗组件',   en: 'Overlays (7)',            desc: '触发方式 / 出现位置 / 是否阻断交互' },
    { id: 'loading',  n: '08', title: '加载动效',   en: 'Loading States (7)',      desc: '动效类型 / 预计等待时间 / 具体场景' }
  ];

  var registry = {};
  CATS.forEach(function (c) { registry[c.id] = []; });
  var mounted = [];
  var reduced = false;
  var sysReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- utils ---------------- */
  var U = {
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    el: function (tag, cls, html) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    },
    css: function (el, obj) { for (var k in obj) el.style[k] = obj[k]; return el; },
    /* pointer drag helper: returns off() */
    drag: function (el, h) {
      var active = false, id = null;
      function down(e) {
        if (e.button != null && e.button !== 0) return;
        active = true; id = e.pointerId;
        if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (err) {} }
        if (h.onStart) h.onStart(e);
        e.preventDefault();
      }
      function move(e) { if (active && e.pointerId === id && h.onMove) h.onMove(e); }
      function up(e) { if (active && e.pointerId === id) { active = false; if (h.onEnd) h.onEnd(e); } }
      el.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      return function () {
        el.removeEventListener('pointerdown', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
    },
    /* critically-ish damped spring value */
    Spring: function (v, k, d) {
      this.v = v || 0; this.t = v || 0; this.vel = 0;
      this.k = k == null ? 170 : k; this.d = d == null ? 22 : d;
    },
    /* simple raf loop -> stop() */
    loop: function (cb) {
      var id = 0, last = performance.now(), stopped = false;
      function frame(now) {
        if (stopped) return;
        var dt = Math.min((now - last) / 1000, 0.05); last = now;
        cb(dt, now);
        id = requestAnimationFrame(frame);
      }
      id = requestAnimationFrame(frame);
      return function () { stopped = true; cancelAnimationFrame(id); };
    }
  };
  U.Spring.prototype.step = function (dt) {
    if (reduced) { this.v = this.t; this.vel = 0; return this.v; }
    var a = (this.t - this.v) * this.k - this.vel * this.d;
    this.vel += a * dt;
    this.v += this.vel * dt;
    return this.v;
  };

  /* ---------------- registration ---------------- */
  window.UIK = {
    util: U,
    register: function (catId, def) {
      if (!registry[catId]) registry[catId] = [];
      registry[catId].push(def);
    },
    isReduced: function () { return reduced; },
    /* sugar: reduced-motion aware transition setter */
    tx: function (el, prop) {
      el.style.transition = reduced ? 'none' : prop;
    }
  };

  /* ---------------- mount context ---------------- */
  function makeCtx(stage) {
    var stops = [];
    return {
      el: stage,
      reduced: function () { return reduced; },
      on: function (t, ev, fn, opt) { t.addEventListener(ev, fn, opt); stops.push(function () { t.removeEventListener(ev, fn, opt); }); },
      raf: function (cb) { var s = U.loop(cb); stops.push(s); return s; },
      timeout: function (fn, ms) { var i = setTimeout(fn, ms); stops.push(function () { clearTimeout(i); }); return i; },
      interval: function (fn, ms) { var i = setInterval(fn, ms); stops.push(function () { clearInterval(i); }); return i; },
      clean: function (fn) { stops.push(fn); },
      hint: function (text) { var h = U.el('div', 'd-hint', text); stage.appendChild(h); },
      /* run all cleanups */
      _destroy: function () { stops.forEach(function (f) { try { f(); } catch (e) {} }); stops.length = 0; }
    };
  }

  /* ---------------- render ---------------- */
  function render() {
    var main = document.getElementById('main');
    var nav = document.getElementById('catnav');
    var total = 0;
    main.innerHTML = '';
    nav.innerHTML = '';

    CATS.forEach(function (c) {
      var list = registry[c.id];
      total += list.length;

      var a = U.el('a', null, c.n + ' ' + c.title + ' · ' + list.length);
      a.href = '#' + c.id; nav.appendChild(a);

      var sec = U.el('section');
      sec.id = c.id;
      var head = U.el('div', 'sec-head');
      head.innerHTML = '<h2>' + c.n + ' ' + c.title + '</h2><span class="en">' + c.en + '</span><span class="desc">' + c.desc + '</span>';
      sec.appendChild(head);

      var grid = U.el('div', 'grid');
      list.forEach(function (def, i) {
        grid.appendChild(buildCard(c, def, i, list.length));
      });
      sec.appendChild(grid);
      main.appendChild(sec);
    });

    document.getElementById('count').textContent = '共 ' + total + ' 个词条';
    observe();
  }

  function buildCard(cat, def, i, len) {
    var card = U.el('div', 'card');
    card.dataset.key = (def.en + ' ' + def.zh + ' ' + (def.desc || '') + ' ' + (def.tags || '')).toLowerCase();

    var head = U.el('div', 'card-head');
    head.innerHTML =
      '<div class="row1"><span class="idx">' + cat.n + '.' + (i + 1) + '/' + len + '</span>' +
      '<span class="zh">' + def.zh + '</span>' +
      '<span class="en">' + def.en + '</span></div>' +
      '<p>' + (def.desc || '') + '</p>';
    card.appendChild(head);

    var stage = U.el('div', 'stage');
    if (def.h) stage.style.minHeight = def.h + 'px';
    card.appendChild(stage);

    var foot = U.el('div', 'card-foot', def.hint || '');
    card.appendChild(foot);

    card._mount = function () {
      if (card._on) return;
      card._on = true;
      var ctx = makeCtx(stage);
      card._ctx = ctx;
      try { var cu = def.mount(stage, ctx); if (cu) ctx.clean(cu); }
      catch (e) { stage.innerHTML = '<span style="color:#f87171;font-size:12px">demo error: ' + e.message + '</span>'; }
    };
    card._unmount = function () {
      if (!card._on) return;
      card._on = false;
      card._ctx._destroy();
      stage.innerHTML = '';
    };
    return card;
  }

  var io = null;
  function observe() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.card').forEach(function (c) { c._mount(); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target._mount();
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('.card').forEach(function (c) { io.observe(c); });
  }

  function remount() {
    document.querySelectorAll('.card').forEach(function (c) { c._unmount(); c._mount(); });
  }

  function filter(q) {
    q = q.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(function (c) {
      c.classList.toggle('hide', q ? c.dataset.key.indexOf(q) === -1 : false);
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    try { reduced = localStorage.getItem('uik-reduced') === '1'; }
    catch (e) { reduced = sysReduced; }
    if (sysReduced) reduced = true;

    var box = document.getElementById('reduced');
    box.checked = reduced;
    box.addEventListener('change', function () {
      reduced = box.checked;
      try { localStorage.setItem('uik-reduced', reduced ? '1' : '0'); } catch (e) {}
      remount();
    });
    document.getElementById('search').addEventListener('input', function (e) { filter(e.target.value); });

    var themeBtn = document.getElementById('theme');
    if (themeBtn) {
      var saved = 'dark';
      try { saved = localStorage.getItem('uik-theme') || 'dark'; } catch (e) {}
      function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        themeBtn.textContent = t === 'light' ? '深色主题' : '浅色主题';
      }
      applyTheme(saved);
      themeBtn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try { localStorage.setItem('uik-theme', next); } catch (e) {}
      });
    }

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
