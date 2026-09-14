/* ============================================================
   Scroll-driven official site demo · runtime
   - CSS path: animation-timeline: view() drives the motion
   - JS path : same numbers, applied frame-synced (no transition)
   Both paths share the section-progress definition:
     progress = clamp(-rect.top / (sectionHeight - viewportHeight))
   ============================================================ */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supportsView = false;
  try { supportsView = CSS.supports('animation-timeline: view()'); } catch (e) { supportsView = false; }

  /* --- verification switches (also handy while reviewing the page) ---
     scroll.html?scrub=js       force the JS interpolation loop
     scroll.html?motion=reduce  force the static reduced-motion layout  */
  var forceReduce = /[?&]motion=reduce/.test(location.search);
  if (/[?&]scrub=js/.test(location.search)) supportsView = false;
  function isReduced() { return forceReduce || reduceMQ.matches; }
  if (forceReduce) doc.setAttribute('data-motion', 'reduce');

  var sections = {
    open: document.getElementById('scene-open'),
    h: document.getElementById('scene-horizontal'),
    x: document.getElementById('scene-exploded')
  };
  var lid = document.querySelector('.lid');
  var hViewport = document.getElementById('hViewport');
  var hTrack = document.getElementById('hTrack');
  var hBar = document.getElementById('hBar');
  var hCounter = document.getElementById('hCounter');
  var navProgress = document.getElementById('navProgress');
  var openCopy = document.querySelector('.open-copy');
  var hint = document.querySelector('.scroll-hint');

  /* ---------------- math ---------------- */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function smoothstep(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function progressOf(el) {
    if (!el) return 0;
    var total = el.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-el.getBoundingClientRect().top / total, 0, 1);
  }

  /* -------- travel distance for the CSS path (measured, never hard-coded) -------- */
  function setViewportVar() {
    if (!hViewport || !hTrack) return;
    var distance = Math.max(hTrack.scrollWidth - hViewport.clientWidth, 0);
    doc.style.setProperty('--h-distance-negative', (-distance) + 'px');
  }

  /* ---------------- exploded-view labels (independent UI layer) ---------------- */
  var LAYER_ORDER = ['bottom', 'cooling', 'battery', 'board', 'deck', 'shell'];
  var layers = {};
  document.querySelectorAll('.x-layer').forEach(function (g) {
    layers[g.dataset.layer] = {
      el: g,
      from: parseFloat(g.dataset.from || '0'),
      to: parseFloat(g.dataset.to || '0'),
      range: (g.dataset.range || '0,1').split(',').map(Number),
      unit: g.dataset.unit || 'px'
    };
  });
  var labelNodes = {};
  document.querySelectorAll('.x-labels span').forEach(function (s) { labelNodes[s.dataset.for] = s; });

  function currentLayer(p) {
    var cur = null;
    for (var i = 0; i < LAYER_ORDER.length; i++) {
      var L = layers[LAYER_ORDER[i]];
      if (!L) continue;
      if (p >= L.range[0]) cur = LAYER_ORDER[i];
    }
    return cur;
  }

  function paintLabels(p) {
    var cur = currentLayer(p);
    Object.keys(labelNodes).forEach(function (id) {
      var n = labelNodes[id], L = layers[id];
      if (!n || !L) return;
      var local = clamp((p - L.range[0]) / (L.range[1] - L.range[0]), 0, 1);
      // labels track their part, so they stay attached to what they describe
      n.style.transform = (id === 'cooling' ? 'translate(12px,-50%) translateY(' : 'translate(-100%,-50%) translateY(') + (L.to * easeInOutCubic(local)) + 'px)';
      var isCurrent = id === cur;
      n.classList.toggle('is-current', isCurrent);
      n.classList.toggle('is-past', !isCurrent && p >= L.range[1]);
      n.style.opacity = (isCurrent || n.classList.contains('is-past')) ? '' : '0';
    });
  }

  /* ---------------- JS scrub path ---------------- */
  function scrub(pOpen, pH, pX) {
    if (lid) lid.style.transform = 'rotateX(' + lerp(-92, -6, easeInOutCubic(pOpen)) + 'deg)';

    if (openCopy) {
      var out = 1 - smoothstep(0.06, 0.34, pOpen);
      openCopy.style.opacity = String(out);
      openCopy.style.transform = 'translateY(' + (-24 * (1 - out)) + 'px)';
    }
    if (hint) hint.style.opacity = String(1 - smoothstep(0, 0.08, pOpen));

    if (hTrack && hViewport) {
      var distance = Math.max(hTrack.scrollWidth - hViewport.clientWidth, 0);
      hTrack.style.transform = 'translate3d(' + (-distance * easeInOutCubic(pH)) + 'px,0,0)';
    }

    Object.keys(layers).forEach(function (id) {
      var L = layers[id];
      var local = clamp((pX - L.range[0]) / (L.range[1] - L.range[0]), 0, 1);
      L.el.style.transform = 'translateY(' + (L.to * easeInOutCubic(local)) + L.unit + ')';
    });
  }

  /* ---------------- shared readouts (both paths) ---------------- */
  var lastP = { h: -1, x: -1, doc: -1 };
  function readouts() {
    var pH = progressOf(sections.h);
    var pX = progressOf(sections.x);
    var total = doc.scrollHeight - window.innerHeight;
    var pDoc = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;

    if (hBar && Math.abs(pH - lastP.h) > 0.002) {
      hBar.style.width = (pH * 100) + '%';
      var idx = Math.min(Math.max(Math.ceil(pH * 6), 1), 6);
      if (hCounter) hCounter.textContent = '0' + idx;
      lastP.h = pH;
    }
    if (Math.abs(pX - lastP.x) > 0.002) { paintLabels(pX); lastP.x = pX; }
    if (navProgress && Math.abs(pDoc - lastP.doc) > 0.002) {
      navProgress.style.width = (pDoc * 100) + '%';
      lastP.doc = pDoc;
    }
  }

  /* ---------------- loop ---------------- */
  var frame = 0;
  function frameSync() {
    var pOpen = progressOf(sections.open);
    var pH = progressOf(sections.h);
    var pX = progressOf(sections.x);
    if (!supportsView && !isReduced()) scrub(pOpen, pH, pX);
    readouts();
    frame = 0;
  }
  function request() {
    if (!frame) frame = requestAnimationFrame(frameSync);
  }

  /* ---------------- i18n ---------------- */
  var enText = {};
  document.querySelectorAll('[data-i18n]').forEach(function (el) { enText[el.dataset.i18n] = el.innerHTML; });

  var ZH = {
    navOpen: '开场', navFeatures: '特性', navInside: '内部', navSpecs: '规格',
    conceptBadge: '概念可视化', backKit: '全部 64 个词条',
    openEyebrow: 'Lumen · 笔记本',
    openTitle: '打开的方式，就是你工作的方式。',
    openLede: '一台 14 英寸的机器，最初是闭合而安静的。向下滚动，它会绕真实转轴打开 —— 屏幕表面始终附着在上盖。',
    scrollHint: '向下滚动打开 ↓',
    openNote: '屏幕绕底部铰链旋转，底座保持不动。是分层的表面，不是一张平面图。',
    uiKey1: '进行中的项目', uiKey2: '今日专注', uiKey3: '构建',
    hEyebrow: '特性', hTitle: '继续向下滚，这一排会横向移动。',
    hCatDisplay: '显示', hCatBattery: '电池', hCatChassis: '机身', hCatCooling: '散热', hCatPorts: '接口', hCatKeyboard: '键盘',
    h1t: '14.2 英寸 3K 120Hz',
    h1d: '低亮度下依然色彩准确，夜里不再像举着一只手电筒。',
    h2t: '18 小时，实测不注水',
    h2d: '浏览器开着跑真实工作负载，不是 10% 亮度循环播放视频。',
    h3t: '一体成型，1.19kg',
    h3d: '整块铝切削。掌托不塌陷，抬起来也不吱呀。',
    h4t: '双风扇 + 均热板',
    h4d: '持续负载 38 dBA。风扇会升速，但你很快就不注意它了。',
    h5t: '两个 USB-C、HDMI、3.5mm',
    h5d: '正常工作日，转接头可以留在家里。',
    h6t: '1.5mm 键程，静音轴',
    h6d: '为共享空间做的。手感够实，声音不至于成为会议室里最响的东西。',
    hFootNote: '直到最后一张卡片完全进入视口，这一排才会解除固定。',
    xEyebrow: '内部', xTitle: '里面到底有什么。',
    xLede: '六层按固定顺序分离，向上滚动时沿原路径装回。概念可视化 —— 用 SVG 绘制，不是真实拆机重建。',
    xNote: '一次只讲一层 —— 外壳先走，核心随后露出，细节件最后移动。向上滚回去，一切沿原路返回。',
    layerBottom: '底壳', layerCooling: '散热与接口', layerBattery: '电池',
    layerBoard: '主板', layerDeck: '键盘面板', layerShell: '上盖',
    sEyebrow: '规格', sTitle: '数字，不带星号。',
    s1k: '显示', s1v: '14.2" 3K · 120Hz · 500 尼特',
    s2k: '电池', s2v: '72Wh · 混合使用 18 小时',
    s3k: '重量', s3v: '1.19kg',
    s4k: '接口', s4v: '2× USB-C · HDMI 2.1 · 3.5mm',
    s5k: '散热', s5v: '双风扇 · 均热板 · 持续 38 dBA',
    s6k: '材质', s6v: '再生铝一体机身',
    outroTitle: '整页就是 skill 里的一个词条。',
    outroBody: '开场、横向轨道与爆炸视图，就是 UI Interaction Kit 里的三个滚动驱动模式 —— 包括这一页遵守的规则：滚动位置是唯一事实来源、路径可反向、不给每次滚动更新挂 transition。',
    outroCta: '查看全部 64 个词条 →', outroDoc: '阅读规范',
    footLeft: 'UI Interaction Kit 的滚动驱动演示页。',
    footRight: '产品与全部内部结构均为 SVG / CSS 绘制的概念可视化，不是真实拆解。',
    footIndex: '词条索引'
  };

  var langBtn = document.getElementById('langBtn');
  var themeBtn = document.getElementById('themeBtn');

  function applyLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      var val = (lang === 'zh' && ZH[key]) ? ZH[key] : enText[key];
      if (val != null) el.innerHTML = val;
    });
    doc.setAttribute('data-lang', lang);
    doc.lang = lang === 'zh' ? 'zh-CN' : 'en';
    if (langBtn) langBtn.textContent = lang === 'zh' ? 'EN' : '中文';
    try { localStorage.setItem('uik-lang', lang); } catch (e) {}
    request();
  }

  function applyTheme(mode) {
    doc.setAttribute('data-theme', mode);
    if (themeBtn) {
      var zh = doc.getAttribute('data-lang') === 'zh';
      themeBtn.textContent = mode === 'light' ? (zh ? '深色主题' : 'Dark') : (zh ? '浅色主题' : 'Light');
    }
  }

  /* ---------------- init ---------------- */
  function init() {
    var lang = 'en', theme = 'dark';
    try {
      lang = localStorage.getItem('uik-lang') === 'zh' ? 'zh' : 'en';
      theme = localStorage.getItem('uik-theme') === 'light' ? 'light' : 'dark';
    } catch (e) {}
    applyTheme(theme);
    applyLang(lang);

    if (langBtn) langBtn.addEventListener('click', function () {
      applyLang(doc.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
    });
    if (themeBtn) themeBtn.addEventListener('click', function () {
      var next = doc.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('uik-theme', next); } catch (e) {}
    });

    setViewportVar();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () { setViewportVar(); lastP = { h: -1, x: -1, doc: -1 }; request(); });
    window.addEventListener('load', function () { setViewportVar(); lastP = { h: -1, x: -1, doc: -1 }; request(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setViewportVar(); request(); });
    document.querySelectorAll('.h-media img').forEach(function (img) {
      img.addEventListener('load', function () { setViewportVar(); request(); });
    });
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', function () { request(); });

    // expose the CSS/JS path for verification
    doc.setAttribute('data-scroll-path', supportsView ? 'css' : 'js');
    if (!supportsView) doc.setAttribute('data-scroll-runtime', 'true');

    request();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
