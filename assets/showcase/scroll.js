/* ============================================================
   Scroll-driven official site demo · runtime
   - CSS path: animation-timeline: view() drives the motion
   - JS path : same numbers, applied frame-synced (no transition)
   Both paths share one progress definition:
     progress = clamp(-rect.top / (sectionHeight - viewportHeight))
   Pattern 3 is a Three.js hologram scan: scroll pushes a clipping plane
   up through the machine. Three.js is the only external dependency and
   only this section needs it — if it is missing, the section falls back
   to a static drawing.
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
    x: document.getElementById('scene-holo')
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

  /* ============================================================
     Pattern 3 · scroll-driven hologram scan
     One scrubbed value drives: clipPlane.constant, the scan disc Y, the
     camera orbit, mote opacity and the HUD — so they cannot drift apart.
     ============================================================ */
  var holo = (function () {
    var stage = document.getElementById('holoStage');
    var canvas = document.getElementById('holoCanvas');
    var pctEl = document.getElementById('holoPct');
    var fallback = document.getElementById('holoFallback');
    var partEls = Array.prototype.slice.call(document.querySelectorAll('.holo-parts span'));
    var api = { set: function () {}, resize: function () {}, ok: false };

    if (!stage || !canvas) return api;
    function degrade() {
      if (fallback) fallback.hidden = false;
      canvas.style.display = 'none';
      api.ok = false;
    }
    /* scroll.html?holo=off forces the fallback so it can be reviewed */
    var forceOff = /[?&]holo=off/.test(location.search);
    if (!window.THREE || forceOff) { degrade(); return api; }

    var SCAN_MIN = -3.4, SCAN_MAX = 6.9;
    var renderer, scene, camera, clipPlane, scanDisc, motes, clock0 = performance.now();
    var clipped = [], ghosts = [], progress = 0;

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    } catch (e) { degrade(); return api; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Clipping planes are opt-in: without this flag material.clippingPlanes
    // is silently ignored (no error, no warning).
    renderer.localClippingEnabled = true;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(readVar('--holo-bg', '#05070c'));
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);

    scene.add(new THREE.AmbientLight(0x9ec7ff, 0.55));
    var key = new THREE.PointLight(0x9ec7ff, 1.15, 120); key.position.set(16, 20, 18); scene.add(key);
    var rim = new THREE.PointLight(0x6ea8fe, 0.75, 100); rim.position.set(-18, -8, -14); scene.add(rim);

    clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), SCAN_MIN);
    var root = new THREE.Group();
    scene.add(root);

    var C_FILL = readVar('--holo-fill', '#123a63');
    var C_EMIS = readVar('--holo-emis', '#3b82f6');
    var C_WIRE = readVar('--holo-wire', '#bfdbfe');
    var C_GHOST = readVar('--holo-ghost', '#31405f');
    var C_DISC = readVar('--holo-disc', '#93c5fd');

    function fillMat(extra) {
      var m = new THREE.MeshPhongMaterial({
        color: new THREE.Color(C_FILL),
        emissive: new THREE.Color(C_EMIS),
        emissiveIntensity: 0.6, shininess: 26,
        transparent: true, opacity: 0.52, side: THREE.DoubleSide,
        clippingPlanes: [clipPlane]
      });
      clipped.push(m);
      return m;
    }
    function wireMat() {
      var m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(C_WIRE), wireframe: true,
        transparent: true, opacity: 0.34, clippingPlanes: [clipPlane]
      });
      clipped.push(m);
      return m;
    }
    function ghostMat() {
      var m = new THREE.MeshBasicMaterial({
        color: new THREE.Color(C_GHOST), wireframe: true,
        transparent: true, opacity: 0.12
      });
      ghosts.push(m);
      return m;
    }

    /* a part is drawn three times from one geometry: holographic fill,
       projected wireframe, and an unclipped ghost so the unscanned region
       still reads as "detected but not rendered" */
    function addPart(geo, parent, pos, rot, opts) {
      opts = opts || {};
      var group = parent || root;
      var meshes = [];
      if (opts.fill !== false) {
        var f = new THREE.Mesh(geo, fillMat());
        meshes.push(f); group.add(f);
      }
      if (opts.wire !== false) {
        var w = new THREE.Mesh(geo, wireMat());
        meshes.push(w); group.add(w);
      }
      var g = new THREE.Mesh(geo, ghostMat());
      meshes.push(g); group.add(g);
      meshes.forEach(function (m) {
        if (pos) m.position.set(pos[0], pos[1], pos[2]);
        if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      });
      return meshes;
    }

    /* --- the machine: shell, deck, screen + the parts inside --- */
    var W = 13.2, D = 9;
    addPart(new THREE.BoxGeometry(W, 0.5, D), root, [0, -2.5, 0], null, {});                 // bottom shell
    addPart(new THREE.BoxGeometry(W - 1, 0.16, D - 0.7), root, [0, -2.12, 0], null, {});     // keyboard deck
    addPart(new THREE.BoxGeometry(8.6, 0.12, 5.4), root, [0, -2.24, 0.2], null, {});         // mainboard
    addPart(new THREE.BoxGeometry(1.7, 0.22, 1.7), root, [-2.3, -2.05, 0.3], null, {});      // SoC
    addPart(new THREE.BoxGeometry(6, 0.34, 4.1), root, [2.6, -2.2, 0.4], null, {});          // battery
    addPart(new THREE.CylinderGeometry(0.85, 0.85, 0.34, 18), root, [-4.6, -2.15, -2.6], [Math.PI / 2, 0, 0], {}); // fan L
    addPart(new THREE.CylinderGeometry(0.85, 0.85, 0.34, 18), root, [4.6, -2.15, -2.6], [Math.PI / 2, 0, 0], {});  // fan R
    addPart(new THREE.BoxGeometry(7.4, 0.1, 0.46), root, [0, -1.98, -2.9], null, {});        // heat pipe
    for (var p = 0; p < 3; p++) {
      addPart(new THREE.BoxGeometry(0.44, 0.24, 0.34), root, [-5.6 + p * 1.1, -2.32, D / 2 - 0.2], null, { wire: false });
    }

    // screen on a hinge group: rotate the group and the surface follows it
    var hinge = new THREE.Group();
    hinge.position.set(0, -2.24, -D / 2 + 0.4);
    hinge.rotation.x = -0.16;                 // opened, leaning back slightly
    root.add(hinge);
    addPart(new THREE.BoxGeometry(W, 8.6, 0.36), hinge, [0, 4.3, 0], null, {});
    addPart(new THREE.BoxGeometry(W - 0.9, 7.8, 0.08), hinge, [0, 4.3, 0.22], null, { wire: false });

    /* --- the visible scan line --- */
    scanDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(8.4, 8.4, 0.05, 64, 1, true),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(C_DISC), transparent: true, opacity: 0.6, side: THREE.DoubleSide
      })
    );
    scene.add(scanDisc);

    /* --- rising motes inside the scan column (wrap, never respawn) --- */
    var MOTES = 220;
    var moteGeo = new THREE.BufferGeometry();
    var motePos = new Float32Array(MOTES * 3);
    for (var i = 0; i < MOTES; i++) {
      var a = Math.random() * Math.PI * 2, r = Math.random() * 9.5;
      motePos[i * 3] = Math.cos(a) * r;
      motePos[i * 3 + 1] = SCAN_MIN + Math.random() * (SCAN_MAX - SCAN_MIN);
      motePos[i * 3 + 2] = Math.sin(a) * r;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
      color: new THREE.Color(C_DISC), size: 0.11, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(motes);

    function readVar(name, fallbackColor) {
      var v = getComputedStyle(doc).getPropertyValue(name).trim();
      return v || fallbackColor;
    }

    function resize() {
      if (!renderer) return;
      var w = canvas.clientWidth || stage.clientWidth, h = canvas.clientHeight || stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    var running = false, frameId = 0;
    function paint(now) {
      var t = (now - clock0) / 1000;
      var h = SCAN_MIN + (SCAN_MAX - SCAN_MIN) * progress;
      var prog = progress;

      // plane normal (0,-1,0): a point is kept when -y + constant >= 0,
      // i.e. y <= constant — so constant IS the scan height.
      clipPlane.constant = h;
      scanDisc.position.y = h;
      scanDisc.material.opacity = (prog > 0.004 && prog < 0.996) ? 0.5 + Math.sin(t * 9) * 0.16 : 0;

      // two incommensurable frequencies: non-repeating flicker, not a metronome
      var flick = Math.sin(t * 23) * Math.sin(t * 7.3) > 0.93 ? 0.32 : 1;
      for (var i = 0; i < clipped.length; i++) {
        var base = clipped[i].wireframe ? 0.34 : 0.52;
        clipped[i].opacity = base * flick;
      }
      for (var j = 0; j < ghosts.length; j++) ghosts[j].opacity = 0.06 + prog * 0.08;

      var mp = motes.geometry.attributes.position;
      for (var k = 0; k < MOTES; k++) {
        var y = mp.array[k * 3 + 1] + 0.03;
        if (y > SCAN_MAX) y = SCAN_MIN;
        mp.array[k * 3 + 1] = y;
      }
      mp.needsUpdate = true;
      motes.material.opacity = 0.22 + prog * 0.5;

      var ang = 0.62 + t * 0.07 + prog * 0.42;
      camera.position.set(Math.sin(ang) * 27, 7.6 + prog * 4.2, Math.cos(ang) * 27);
      camera.lookAt(0, 0.7, 0);

      renderer.render(scene, camera);
    }

    function loop(now) {
      if (!running) return;
      paint(now);
      frameId = requestAnimationFrame(loop);
    }

    api.set = function (p) {
      // reduced motion keeps the finished state: no scrubbed scan at all
      progress = isReduced() ? 1 : clamp(p, 0, 1);
      if (pctEl) pctEl.textContent = String(Math.round(progress * 100));
      // only one layer gets the strong emphasis: the most recently entered window
      var bestIdx = -1, bestStart = -1;
      for (var i = 0; i < partEls.length; i++) {
        var r = (partEls[i].dataset.range || '0,1').split(',').map(Number);
        if (progress >= r[0] && progress <= r[1] && r[0] > bestStart) { bestStart = r[0]; bestIdx = i; }
      }
      for (var k = 0; k < partEls.length; k++) partEls[k].classList.toggle('on', k === bestIdx);
      if (!running && isReduced()) { resize(); paint(performance.now()); }   // static final frame
    };
    api.resize = resize;
    api.ok = true;

    if (!isReduced()) {
      running = true;
      frameId = requestAnimationFrame(loop);
    } else {
      // layout is not measured yet at this point — paint after the first frame
      requestAnimationFrame(function () { resize(); api.set(1); });
      running = false;
    }
    api.stop = function () { running = false; cancelAnimationFrame(frameId); };
    return api;
  })();

  /* ---------------- JS scrub path (patterns 1 + 2) ---------------- */
  function scrub(pOpen, pH) {
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
    if (Math.abs(pX - lastP.x) > 0.002) { holo.set(pX); lastP.x = pX; }
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
    if (!supportsView && !isReduced()) scrub(pOpen, pH);
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
    xLede: '滚动把扫描面从下往上推过整机：平面以下的部分以全息方式显形，平面以上的只留一层淡残影。',
    xNote: '一次只揭示一个高度 —— 停在中途可以看到实时横截面；向上滚动会自顶向下反渲染。概念可视化：几何体由程序生成，不是真实机器的扫描结果。',
    holoFallbackText: 'WebGL 不可用或 Three.js 加载失败，这一段改为静态剖面示意。',
    holoFallbackNote: '滚动驱动行为不变，只有渲染方式降级。',
    partShell: '上盖与屏幕', partDeck: '键盘面板', partBoard: '主板', partBattery: '电池', partCooling: '散热与接口',
    sEyebrow: '规格', sTitle: '数字，不带星号。',
    s1k: '显示', s1v: '14.2" 3K · 120Hz · 500 尼特',
    s2k: '电池', s2v: '72Wh · 混合使用 18 小时',
    s3k: '重量', s3v: '1.19kg',
    s4k: '接口', s4v: '2× USB-C · HDMI 2.1 · 3.5mm',
    s5k: '散热', s5v: '双风扇 · 均热板 · 持续 38 dBA',
    s6k: '材质', s6v: '再生铝一体机身',
    outroTitle: '整页就是 skill 里的一个词条。',
    outroBody: '开场、横向轨道与全息扫描，就是 UI Interaction Kit 里的三个滚动驱动模式 —— 包括这一页遵守的规则：滚动位置是唯一事实来源、路径可反向、不给每次滚动更新挂 transition。',
    outroCta: '查看全部 64 个词条 →', outroDoc: '阅读规范',
    footLeft: 'UI Interaction Kit 的滚动驱动演示页。',
    footRight: '产品与全部内部结构均为程序生成的概念可视化，不是真实拆解或扫描。',
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
    if (holo.ok) { holo.resize(); }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () {
      setViewportVar();
      if (holo.ok) holo.resize();
      lastP = { h: -1, x: -1, doc: -1 };
      request();
    });
    window.addEventListener('load', function () {
      setViewportVar();
      if (holo.ok) holo.resize();
      lastP = { h: -1, x: -1, doc: -1 };
      request();
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setViewportVar(); request(); });
    document.querySelectorAll('.h-media img').forEach(function (img) {
      img.addEventListener('load', function () { setViewportVar(); request(); });
    });
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', function () { request(); });

    doc.setAttribute('data-scroll-path', supportsView ? 'css' : 'js');
    doc.setAttribute('data-holo-path', holo.ok ? 'webgl' : 'fallback');

    request();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
