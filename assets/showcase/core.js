/* UI Interaction Kit · showcase runtime */
(function () {
  'use strict';

  var CATS = [
    { id: 'motion', n: '01', title: '质感动效', enTitle: 'Motion Texture', en: 'Motion Texture (8)', desc: '让运动与距离、速度、层级、用户输入建立关系', enDesc: 'Motion tied to distance, velocity, depth and user input' },
    { id: 'chart', n: '02', title: '图表交互', enTitle: 'Chart Interaction', en: 'Chart Interaction (7)', desc: '先理解任务，再选交互，最后写代码', enDesc: 'Understand the task, choose the interaction, then code' },
    { id: 'patterns', n: '03', title: '高级交互模式', enTitle: 'App Interaction Patterns', en: 'App Interaction Patterns (10)', desc: '变化从哪发生、落在哪、谁回应、周围是否让位', enDesc: 'Where it starts, where it lands, who reacts, who makes room' },
    { id: 'expand', n: '04', title: '展开动画', enTitle: 'Expand Animations', en: 'Expand Animations (7)', desc: '起始状态 / 最终状态 / 变化属性 / 收回方式', enDesc: 'Start state / end state / property / collapse path' },
    { id: 'collapse', n: '05', title: '折叠组件', enTitle: 'Collapse Components', en: 'Collapse Components (8)', desc: '内容从隐藏变为显示的 8 种组织方式', enDesc: 'Eight ways to reveal hidden content' },
    { id: 'nav', n: '06', title: '导航组件', enTitle: 'Navigation', en: 'Navigation (7)', desc: '组件类型 / 放置位置 / 切换内容 / 高亮方式', enDesc: 'Component type / placement / content / highlight' },
    { id: 'overlay', n: '07', title: '弹窗组件', enTitle: 'Overlays', en: 'Overlays (7)', desc: '触发方式 / 出现位置 / 是否阻断交互', enDesc: 'Trigger / position / whether it blocks interaction' },
    { id: 'loading', n: '08', title: '加载动效', enTitle: 'Loading States', en: 'Loading States (7)', desc: '动效类型 / 预计等待时间 / 具体场景', enDesc: 'Pattern / expected wait / where it is used' }
  ];

  /* ---------------- English copy (keyed by category + English term) ---------------- */
  var I18N = {
    ui: {
      subtitle: '61 front-end interaction entries · every demo is playable · vanilla JS, zero dependencies',
      search: 'Search term / Chinese name / scenario',
      github: 'GitHub repo',
      themeToLight: 'Light theme',
      themeToDark: 'Dark theme',
      reduced: 'Reduce motion',
      countPrefix: '',
      countSuffix: ' entries',
      langToZh: '中文',
      langToEn: 'EN'
    },
    items: {
      'motion|Magnetic Attraction': { desc: 'Drag an element near a clear target and preview the drop point: the closer it gets, the stronger the pull; commit only on release.', hint: 'Drag the ball toward a slot — pull grows continuously; release inside 46px commits, outside returns home.' },
      'motion|Velocity-driven Deformation': { desc: 'A card stretches with drag speed: deformation follows the motion direction with a capped amplitude and recovers as soon as the finger stops.', hint: 'Same distance, different speed → different deformation; capped at 11%; body text stays readable.' },
      'motion|Layered Parallax': { desc: 'Foreground, midground, near and background layers shift by different depth factors; the card tilts slightly and returns to neutral on leave.', hint: 'Move the pointer over the card; four depth layers, max tilt 9°.' },
      'motion|Center-focus Scaling': { desc: 'Measured against the real scroll container center: the distance to center maps to a bounded scale range.', hint: 'Scroll horizontally; layout size never changes, only visual transforms.' },
      'motion|Liquid Tab Indicator': { desc: 'The indicator leading and trailing edges move at different paces, stretching then contracting; labels and hit areas stay fixed.', hint: 'Click tabs rapidly — the indicator continues from its current shape and lands on the last choice.' },
      'motion|Shared-element Image Expansion': { desc: 'A thumbnail morphs continuously into the fullscreen view: source position, size and corner radius are recorded and restored on close.', hint: 'Click a thumbnail to expand; Esc or the close button reverses the same path.' },
      'motion|Gesture-driven Transition': { desc: 'Drag distance maps directly to transition progress; on release, commit or cancel is decided by progress, velocity and direction.', hint: 'Drag left or flick; progress follows your finger 1:1, then springs to settle.' },
      'motion|Collision and Spring Response': { desc: 'Free-moving elements push each other using simplified colliders with explicit mass, damping and restitution, stepped at a fixed timestep.', hint: 'Drag any ball to push the others; motion converges after input stops.' },

      'chart|Brush Selection': { desc: 'Drag across the chart to select a time or data range; the unselected area dims and the brush can be reversed or cleared.', hint: 'Drag horizontally to select, double-click to clear.' },
      'chart|Crosshair': { desc: 'Vertical and horizontal guides follow the pointer and show the matching values on both axes.', hint: 'Move the pointer over the chart; guides disappear on leave.' },
      'chart|Data Point Highlight': { desc: 'Emphasize a specific or important data point without changing what the data means.', hint: 'The peak pulses automatically; the nearest point enlarges on hover.' },
      'chart|Tooltip': { desc: 'Inspect the details of one data point; the bubble follows the point, flips near edges and works with touch.', hint: 'Hover or tap anywhere on the chart.' },
      'chart|Legend Filter': { desc: 'Show, hide or compare series; at least one series stays readable and the axis rescales.', hint: 'Click a legend item to toggle a series.' },
      'chart|Zoom': { desc: 'Inspect a slice of a wide range with the wheel or buttons; a reset entry is always available.', hint: 'Wheel to zoom, buttons to step, double-click to reset.' },
      'chart|Drill Down': { desc: 'Move from summary data into a finer level, with breadcrumbs to go back.', hint: 'Click a bar to drill into weekly detail; use the breadcrumb to return.' },

      'patterns|Radial Theme Transition': { desc: 'Reveal the other theme from the exact pointer position with a circular mask; the radius covers the farthest corner and neither layer is scaled.', hint: 'Click the toggle from different spots to see the center move.' },
      'patterns|Drag-to-Reorder': { desc: 'The dragged row leaves the list flow, the drop index is recalculated every frame, and the other rows animate out of the way into a visible slot.', hint: 'Hold and drag any row; the layout stops wherever you stop.' },
      'patterns|Staggered Bulk Selection': { desc: 'State updates instantly while the checkmarks appear one by one with a slight elastic pop; the animation never blocks the next action.', hint: 'Click Select all / Clear; state changes immediately, the sweep is visual only.' },
      'patterns|Velocity-Based Slider Snap': { desc: 'Release velocity is tracked: the thumb overshoots slightly, then springs back to the nearest valid tick, clamped to range.', hint: 'Flick the thumb and release — it overshoots, then settles on a tick.' },
      'patterns|Animated Text Disclosure': { desc: 'Animate from the current height to the measured content height; the chevron rotates 180° and the layout never jumps.', hint: 'Click the header to expand or collapse.' },
      'patterns|Spring Stepper Progress': { desc: 'The progress segment overshoots its target slightly and settles back; completed, current and upcoming states stay distinct.', hint: 'Click Next Step — the bar overshoots, then settles.' },
      'patterns|Ripple Feedback for Related Switches': { desc: 'Toggling one switch sends a subtle ripple to its neighbours; their real on/off state never changes.', hint: 'Toggle any switch; neighbours shake but stay unchanged.' },
      'patterns|Curved Card Deletion': { desc: 'Past the threshold the card flies to the trash along a curved path while shrinking, rotating and fading; data is removed after the exit animation.', hint: 'Drag a card left past 110px to delete; release earlier to spring back.' },
      'patterns|Stacked Card Scroll': { desc: 'The top card pins at the boundary while the cards behind compress into a visible stack, scaled by how many are behind.', hint: 'Scroll up — earlier cards compress instead of disappearing.' },
      'patterns|Expanding Tag Selection': { desc: 'The active tag grows slightly and neighbours slide aside smoothly; nothing overlaps or jumps, and wrapping still works.', hint: 'Click tags; neighbours make room via spacing.' },

      'expand|Circle to Pill': { desc: 'A small circular entry expands horizontally into a pill that carries a short status.', hint: 'Start: 56px circle; end: 220px pill with text.' },
      'expand|Pill to Card': { desc: 'A compact status bar expands into a full information card with more content and actions.', hint: '220×36 pill → 260×150 card.' },
      'expand|Compact to Expand': { desc: 'The same control starts compact and expands into a full panel when needed.', hint: 'Compact toolbar → full control panel.' },
      'expand|Corner Radius Morph': { desc: 'Size stays almost the same; the transition is carried by the corner radius, e.g. card to dialog.', hint: 'Width and height fixed, radius 28px → 6px.' },
      'expand|Size Morph': { desc: 'A small widget becomes a large module by animating width and height.', hint: '90×90 widget → 270×160 module.' },
      'expand|Content Reflow': { desc: 'After the container expands, its content rearranges from a compressed layout to a full one.', hint: 'Container and children change together; order is preserved.' },
      'expand|Reverse Collapse': { desc: 'On collapse it travels back along the same path to the entry point instead of disappearing.', hint: 'Click again to reverse along the original path.' },

      'collapse|Accordion': { desc: 'A group of collapsible sections where opening one closes the others.', hint: 'Mutually exclusive: only one section stays open.' },
      'collapse|Collapse': { desc: 'A standalone block that expands and collapses independently of the others.', hint: 'Each block keeps its own state.' },
      'collapse|Dropdown': { desc: 'A list of options opens below the button and closes right after a choice.', hint: 'Select to close; outside click and Esc also close.' },
      'collapse|Treeview': { desc: 'Hierarchical content: click a parent node to reveal its children, and keep going deeper.', hint: 'Click nodes with children; indentation and chevrons show depth.' },
      'collapse|Expandable Card': { desc: 'A card shows title and summary by default and expands in place to reveal full content.', hint: 'Click the card to expand in place.' },
      'collapse|Sidebar': { desc: 'A narrow icon rail expands into a full menu, saving space on desktop.', hint: 'Toggle between a 56px rail and a 160px menu.' },
      'collapse|Radio Menu': { desc: 'A center button fans a few quick actions out to the sides.', hint: 'Click the center button to fan out four actions.' },
      'collapse|Container Transform': { desc: 'A small card or thumbnail grows continuously into the full detail view.', hint: 'Click the card to expand; click again to shrink back.' },

      'nav|Tabs': { desc: 'Switch between parallel content groups on the same page; the indicator tracks the active tab.', hint: 'Click or use arrow keys; aria-selected stays in sync.' },
      'nav|Segment Control': { desc: 'A compact switch between two or three views with a sliding thumb.', hint: 'The slider is measured from the real button position.' },
      'nav|Breadcrumb': { desc: 'Shows where the current page sits in the hierarchy and lets you jump back up.', hint: 'Middle levels are clickable; the last one is not.' },
      'nav|Pagination': { desc: 'Splits large content across pages with first/last, ellipsis and clear disabled states.', hint: 'Click page numbers; prev/next disable at the ends.' },
      'nav|Stepper': { desc: 'Breaks a flow into steps and shows progress; completed, current and upcoming look clearly different.', hint: 'Advance with Next; completed steps can be revisited.' },
      'nav|Sidebar': { desc: 'Primary entries stay pinned on the left with the current page highlighted.', hint: 'Click to switch; collapse to an icon rail.' },
      'nav|Bottom Navigation': { desc: 'Three to five top-level destinations pinned to the bottom for one-handed use.', hint: '3–5 items, badge never covers the icon, hit area ≥ 44px.' },

      'overlay|Tooltip': { desc: 'A one-line explanation for an icon or button on hover or keyboard focus; touch uses tap.', hint: 'Hover or Tab to focus; tap on touch devices.' },
      'overlay|Popover': { desc: 'Richer supplementary content than a tooltip, may include buttons; closes on outside click or Esc.', hint: 'Click to open; click outside or press Esc to close.' },
      'overlay|Dropdown Menu': { desc: 'A set of actions or options; the menu closes right after a choice and writes the result back.', hint: 'Pick an action — the menu closes and the button updates.' },
      'overlay|Drawer': { desc: 'Slides in from the side to show details or editing while the page behind stays visible.', hint: 'Opens from the right; Esc or the overlay closes it.' },
      'overlay|Bottom Sheet': { desc: 'Mobile-friendly actions within thumb reach; supports a drag-down gesture to dismiss.', hint: 'Opens from the bottom; drag the handle past 50px to close.' },
      'overlay|Modal': { desc: 'Centered with a scrim, demanding a decision; focus is trapped and restored on close.', hint: 'Only the buttons or Esc can close it.' },
      'overlay|Toast': { desc: 'Brief feedback after an action: auto-dismisses, never takes focus, never blocks the flow.', hint: 'Click repeatedly to stack toasts; each clears after 2.5s.' },

      'loading|Page Loader': { desc: 'Covers the page while core content loads; never leave it stuck — provide a timeout or retry.', hint: 'Auto-loops: overlay → content as soon as data arrives.' },
      'loading|Skeleton': { desc: 'Placeholder structure keeps the layout stable before content arrives, avoiding a jump.', hint: 'Auto-loops: skeleton → real content with the same size.' },
      'loading|Shimmer': { desc: 'A moving highlight over the skeleton tells the user that loading is still in progress.', hint: 'Auto-loops; the sweep stops under reduced-motion.' },
      'loading|Spinner': { desc: 'For tasks with unknown duration — shows the system is still working, never fakes a percentage.', hint: 'Delay ~200ms on fast tasks to avoid flashing.' },
      'loading|Progress Bar': { desc: 'When progress can be computed, show the percentage so users know how much is left.', hint: 'Auto-loops 0 → 100%.' },
      'loading|Circular Progress': { desc: 'Same job as a progress bar, for tight spaces such as buttons and cards.', hint: 'Auto-loops the ring fill with the value in the center.' },
      'loading|Button Loader': { desc: 'After submit, the button enters a loading state and blocks duplicate submissions.', hint: 'Click submit — it stays disabled until done.' }
    }
  };

  var registry = {};
  CATS.forEach(function (c) { registry[c.id] = []; });
  var mounted = [];
  var reduced = false;
  var lang = 'zh';
  var sysReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function t(key) { return I18N.ui[key]; }
  function itemCopy(catId, def, field) {
    if (lang !== 'en') return def[field];
    var it = I18N.items[catId + '|' + def.en];
    return (it && it[field]) ? it[field] : def[field];
  }

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
    Spring: function (v, k, d) {
      this.v = v || 0; this.t = v || 0; this.vel = 0;
      this.k = k == null ? 170 : k; this.d = d == null ? 22 : d;
    },
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
    tx: function (el, prop) { el.style.transition = reduced ? 'none' : prop; }
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
      var title = lang === 'en' ? c.enTitle : c.title;
      var desc = lang === 'en' ? c.enDesc : c.desc;

      var a = U.el('a', null, c.n + ' ' + title + ' · ' + list.length);
      a.href = '#' + c.id; nav.appendChild(a);

      var sec = U.el('section');
      sec.id = c.id;
      var head = U.el('div', 'sec-head');
      head.innerHTML = '<h2>' + c.n + ' ' + title + '</h2><span class="en">' + c.en + '</span><span class="desc">' + desc + '</span>';
      sec.appendChild(head);

      var grid = U.el('div', 'grid');
      list.forEach(function (def, i) { grid.appendChild(buildCard(c, def, i, list.length)); });
      sec.appendChild(grid);
      main.appendChild(sec);
    });

    var count = document.getElementById('count');
    count.textContent = lang === 'en' ? (total + t('countSuffix')) : ('共 ' + total + ' 个词条');
    observe();
  }

  function buildCard(cat, def, i, len) {
    var isEn = lang === 'en';
    var card = U.el('div', 'card');
    card.dataset.key = (def.en + ' ' + def.zh + ' ' + (def.desc || '') + ' ' + (def.tags || '') + ' ' + (I18N.items[cat.id + '|' + def.en] ? I18N.items[cat.id + '|' + def.en].desc : '')).toLowerCase();

    var head = U.el('div', 'card-head');
    head.innerHTML =
      '<div class="row1"><span class="idx">' + cat.n + '.' + (i + 1) + '/' + len + '</span>' +
      '<span class="zh">' + (isEn ? def.en : def.zh) + '</span>' +
      '<span class="en">' + (isEn ? def.zh : def.en) + '</span></div>' +
      '<p>' + (itemCopy(cat.id, def, 'desc') || '') + '</p>';
    card.appendChild(head);

    var stage = U.el('div', 'stage');
    if (def.h) stage.style.minHeight = def.h + 'px';
    card.appendChild(stage);

    var foot = U.el('div', 'card-foot', itemCopy(cat.id, def, 'hint') || '');
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
      entries.forEach(function (en) { if (en.isIntersecting) en.target._mount(); });
    }, { rootMargin: '200px' });
    document.querySelectorAll('.card').forEach(function (c) { io.observe(c); });
  }

  function rerender() {
    document.querySelectorAll('.card').forEach(function (c) { c._unmount(); });
    render();
  }

  function filter(q) {
    q = q.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(function (c) {
      c.classList.toggle('hide', q ? c.dataset.key.indexOf(q) === -1 : false);
    });
  }

  /* ---------------- language ---------------- */
  function applyLang(next) {
    lang = next;
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    try { localStorage.setItem('uik-lang', lang); } catch (e) {}

    var sub = document.getElementById('subtitle');
    if (sub) sub.textContent = lang === 'en' ? t('subtitle') : '61 个前端交互与动效词条 · 每个演示都可直接操作 · 原生 JS 无依赖';
    var search = document.getElementById('search');
    if (search) search.placeholder = lang === 'en' ? t('search') : '搜索词条 / 中文名 / 场景';
    var gh = document.getElementById('gh-link');
    if (gh) gh.textContent = lang === 'en' ? (t('github') + ' ↗') : 'GitHub 仓库 ↗';
    var red = document.getElementById('reduced-label');
    if (red) red.textContent = lang === 'en' ? t('reduced') : '减少动效';
    var lb = document.getElementById('lang');
    if (lb) lb.textContent = lang === 'en' ? t('langToZh') : t('langToEn');
    syncThemeLabel();
    rerender();
  }

  function syncThemeLabel() {
    var tb = document.getElementById('theme');
    if (!tb) return;
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    tb.textContent = lang === 'en'
      ? (isLight ? t('themeToDark') : t('themeToLight'))
      : (isLight ? '深色主题' : '浅色主题');
  }

  /* ---------------- init ---------------- */
  function init() {
    try { reduced = localStorage.getItem('uik-reduced') === '1'; } catch (e) { reduced = sysReduced; }
    if (sysReduced) reduced = true;
    try { lang = localStorage.getItem('uik-lang') === 'en' ? 'en' : 'zh'; } catch (e) { lang = 'zh'; }

    var box = document.getElementById('reduced');
    box.checked = reduced;
    box.addEventListener('change', function () {
      reduced = box.checked;
      try { localStorage.setItem('uik-reduced', reduced ? '1' : '0'); } catch (e) {}
      document.querySelectorAll('.card').forEach(function (c) { c._unmount(); c._mount(); });
    });
    document.getElementById('search').addEventListener('input', function (e) { filter(e.target.value); });

    var themeBtn = document.getElementById('theme');
    if (themeBtn) {
      var saved = 'dark';
      try { saved = localStorage.getItem('uik-theme') || 'dark'; } catch (e) {}
      function setTheme(mode) {
        document.documentElement.setAttribute('data-theme', mode);
        syncThemeLabel();
      }
      setTheme(saved);
      themeBtn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(next);
        try { localStorage.setItem('uik-theme', next); } catch (e) {}
      });
    }

    var langBtn = document.getElementById('lang');
    if (langBtn) langBtn.addEventListener('click', function () { applyLang(lang === 'zh' ? 'en' : 'zh'); });

    applyLang(lang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
