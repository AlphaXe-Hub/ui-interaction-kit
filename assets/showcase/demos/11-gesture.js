/* 11 手势与反馈 · Gesture & Feedback (8)
   捏合密度 / 滚动驱动进度 / 快速滚动拖影 / 下拉拉伸 / 拖拽吸附 / 弧线重排 / 自动反色 / 焦点模式 */
(function () {
  var U = UIK.util;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var seq = 0;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* 通用：一个可滚动的小窗口（内含 spacer 撑出滚动范围） */
  function scrollBox(stage, ctx, winH, times, extra) {
    var win = U.el('div');
    U.css(win, {
      position: 'relative', height: winH + 'px', overflowY: 'auto', overflowX: 'hidden',
      overscrollBehavior: 'contain', background: 'var(--d-hole)', border: '1px solid var(--d-border)',
      borderRadius: '10px', scrollbarWidth: 'thin', touchAction: 'none'
    });
    var inner = U.el('div');
    U.css(inner, { position: 'relative', minHeight: (winH * times) + 'px' });
    if (extra) U.css(extra, {});
    win.appendChild(inner);
    if (extra) inner.appendChild(extra);
    stage.appendChild(win);
    return { win: win, inner: inner };
  }

  /* 1. Pinch to Zoom Density */
  UIK.register('gesture', {
    en: 'Pinch to Zoom Density', zh: '捏合改变内容密度',
    h: 250,
    desc: '双指捏合在不同布局间切换：两列大图、三列网格、单列文字行；换档改变的是布局与元素尺寸，不是整体缩放。',
    hint: '按钮 / Ctrl（⌘）+ 滚轮 / 双指捏合都能换档；换档时元素重排而非整体缩放，并记住上次档位。',
    mount: function (stage, ctx) {
      var LV = [
        { cols: 2, h: 76, gap: 8, name: '两列大图' },
        { cols: 3, h: 50, gap: 8, name: '三列网格' },
        { cols: 1, h: 24, gap: 6, name: '单列文字行' }
      ];
      var BOX_H = 168;

      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });
      var box = U.el('div');
      U.css(box, { position: 'relative', width: '100%', height: BOX_H + 'px', overflow: 'hidden' });
      var names = ['日落海岸', '城市夜景', '雪山清晨', '雨林徒步'];

      var items = names.map(function (n, i) {
        var it = U.el('div');
        U.css(it, {
          position: 'absolute', left: '0', top: '0', overflow: 'hidden', borderRadius: '10px',
          background: 'var(--d-panel)', border: '1px solid var(--d-border)', display: 'flex',
          flexDirection: 'column', cursor: 'pointer',
          transition: UIK.isReduced() ? 'none' : 'transform .3s cubic-bezier(.34,1.2,.64,1),width .3s,height .3s'
        });
        it.innerHTML =
          '<div class="ph" style="flex:1 1 auto;background:' + (i % 2 ? 'var(--d-accent-2)' : 'var(--d-accent)') + ';opacity:.4"></div>' +
          '<div class="nm" style="padding:5px 7px;font-size:10.5px;color:var(--d-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + n + '</div>';
        box.appendChild(it);
        return it;
      });
      wrap.appendChild(box);

      var bar = U.el('div', 'd-row');
      U.css(bar, { justifyContent: 'space-between', alignItems: 'center' });
      var read = U.el('span', 'd-val', '');
      var minus = U.el('button', 'd-btn', '− 疏');
      var plus = U.el('button', 'd-btn', '+ 密');
      U.css(minus, { fontSize: '12px' }); U.css(plus, { fontSize: '12px' });
      bar.appendChild(read); bar.appendChild(minus); bar.appendChild(plus);
      wrap.appendChild(bar);
      stage.appendChild(wrap);

      var lv = 0;
      try { lv = U.clamp(parseInt(localStorage.getItem('uik-density') || '0', 10) || 0, 0, LV.length - 1); } catch (e) {}
      function layout() {
        var L = LV[lv], W = box.clientWidth || 300;
        var colW = (W - L.gap * (L.cols - 1)) / L.cols;
        var rows = Math.ceil(items.length / L.cols);
        var contentH = rows * L.h + (rows - 1) * L.gap;
        var y0 = Math.max(0, (BOX_H - contentH) / 2);
        items.forEach(function (it, i) {
          var r = Math.floor(i / L.cols), c = i % L.cols;
          it.style.transform = 'translate(' + (c * (colW + L.gap)) + 'px,' + (y0 + r * (L.h + L.gap)) + 'px)';
          it.style.width = colW + 'px';
          it.style.height = L.h + 'px';
          it.querySelector('.ph').style.display = lv === 2 ? 'none' : 'block';
        });
        read.textContent = (lv + 1) + '/' + LV.length + ' · ' + L.name;
        box.setAttribute('aria-label', L.name);
        try { localStorage.setItem('uik-density', String(lv)); } catch (e) {}
      }
      function go(d) { var n = U.clamp(lv + d, 0, LV.length - 1); if (n !== lv) { lv = n; layout(); } }
      ctx.on(minus, 'click', function () { go(-1); });
      ctx.on(plus, 'click', function () { go(1); });
      ctx.on(window, 'resize', layout);
      layout();

      /* Ctrl / ⌘ + wheel on desktop */
      ctx.on(box, 'wheel', function (e) {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        go(e.deltaY < 0 ? 1 : -1);
      }, { passive: false });

      /* two-finger pinch on touch */
      var pinchStart = 0;
      function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
      ctx.on(box, 'touchstart', function (e) {
        if (e.touches.length === 2) pinchStart = dist(e.touches);
      }, { passive: true });
      ctx.on(box, 'touchmove', function (e) {
        if (e.touches.length !== 2 || !pinchStart) return;
        e.preventDefault();
        var d = dist(e.touches);
        if (d > pinchStart * 1.25) { go(1); pinchStart = d; }
        else if (d < pinchStart * 0.8) { go(-1); pinchStart = d; }
      }, { passive: false });
      ctx.hint('档位离散且松手吸附，不做无级缩放；档位会记住（桌面可用 Ctrl/⌘ + 滚轮）');
    }
  });

  /* 2. Scroll-driven Progress Animation */
  UIK.register('gesture', {
    en: 'Scroll-driven Progress Animation', zh: '滚动驱动进度动画',
    h: 230,
    desc: '动画进度绑定到容器滚动位置：向下滚动正向播放，反向滚动沿同一路径倒放，停在任意位置都稳定。',
    hint: '滚动窗口内上下滑动：进度由容器真实滚动范围推导，反向滚动原路倒放，停在中间不回弹。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });

      var win = U.el('div');
      U.css(win, {
        position: 'relative', height: '150px', overflowY: 'auto', overflowX: 'hidden',
        background: 'var(--d-hole)', border: '1px solid var(--d-border)', borderRadius: '10px',
        scrollbarWidth: 'thin', overscrollBehavior: 'contain'
      });
      var spacer = U.el('div');
      U.css(spacer, { height: '460px', position: 'relative' });
      var stageInner = U.el('div');
      U.css(stageInner, {
        position: 'sticky', top: '0', height: '150px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: '16px'
      });

      var ring = U.el('div');
      U.css(ring, {
        width: '58px', height: '58px', borderRadius: '50%', flex: '0 0 auto',
        border: '3px solid var(--d-track)', position: 'relative'
      });
      var arc = U.el('div');
      U.css(arc, {
        position: 'absolute', inset: '-3px', borderRadius: '50%',
        border: '3px solid transparent', borderTopColor: 'var(--d-accent)', borderRightColor: 'var(--d-accent)'
      });
      ring.appendChild(arc);

      var bar = U.el('div');
      U.css(bar, { width: '16px', height: '90px', borderRadius: '999px', background: 'var(--d-track)', position: 'relative', overflow: 'hidden' });
      var barFill = U.el('div');
      U.css(barFill, { position: 'absolute', left: '0', right: '0', bottom: '0', height: '0%', background: 'var(--d-accent)' });
      bar.appendChild(barFill);

      stageInner.appendChild(ring); stageInner.appendChild(bar);
      spacer.appendChild(stageInner);
      win.appendChild(spacer);
      wrap.appendChild(win);

      var read = U.el('div', 'd-val', 'progress 0.00');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      /* frame-synced: read the real scroll offset, no CSS transition */
      function update() {
        var span = spacer.offsetHeight - win.clientHeight;
        var p = span > 0 ? U.clamp(win.scrollTop / span, 0, 1) : 0;
        arc.style.transform = 'rotate(' + (p * 300) + 'deg)';
        ring.style.transform = 'scale(' + (0.86 + p * 0.2) + ')';
        ring.style.borderColor = p > 0.02 ? 'var(--d-accent)' : 'var(--d-track)';
        barFill.style.height = (p * 100) + '%';
        read.textContent = 'progress ' + p.toFixed(2) + (p === 0 || p === 1 ? ' · 端点' : ' · 中间态');
      }
      ctx.on(win, 'scroll', update, { passive: true });
      ctx.on(window, 'resize', update);
      update();
      ctx.hint('进度取自容器真实滚动范围；正向播放、反向倒放同一条路径，中间态即合法状态');
    }
  });

  /* 3. Velocity-based Motion Blur */
  UIK.register('gesture', {
    en: 'Velocity-based Motion Blur', zh: '快速滚动拖影',
    h: 218,
    desc: '列表滚动时按真实速度施加方向性模糊（纵向拉伸），速度归零后平滑恢复清晰，静止时不模糊。',
    hint: '快速上下滑动列表看拖影：模糊方向与滚动一致、有上限，停手后 1–2 帧内恢复清晰。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '9px' });

      /* 方向性模糊：SVG feGaussianBlur 的 stdDeviation 是 x/y 分离的，
         垂直滚动时设 "0 N" 就是纵向拖影；各向同性的 CSS blur() 不是运动模糊 */
      var fid = 'mb' + (seq++);
      var svg = document.createElementNS(SVGNS, 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
      svg.style.position = 'absolute';
      var defs = document.createElementNS(SVGNS, 'defs');
      var filter = document.createElementNS(SVGNS, 'filter');
      filter.setAttribute('id', fid);
      filter.setAttribute('x', '-10%'); filter.setAttribute('y', '-40%');
      filter.setAttribute('width', '120%'); filter.setAttribute('height', '180%');
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      var blur = document.createElementNS(SVGNS, 'feGaussianBlur');
      blur.setAttribute('stdDeviation', '0 0');
      filter.appendChild(blur); defs.appendChild(filter); svg.appendChild(defs);
      wrap.appendChild(svg);

      var win = U.el('div');
      U.css(win, {
        position: 'relative', height: '128px', overflowY: 'auto', overflowX: 'hidden',
        background: 'var(--d-hole)', border: '1px solid var(--d-border)', borderRadius: '10px',
        scrollbarWidth: 'thin', overscrollBehavior: 'contain'
      });
      var list = U.el('div');
      U.css(list, { padding: '8px', display: 'flex', flexDirection: 'column', gap: '7px' });
      for (var i = 0; i < 12; i++) {
        var row = U.el('div');
        U.css(row, {
          height: '30px', flex: '0 0 auto', borderRadius: '8px', background: 'var(--d-panel)',
          border: '1px solid var(--d-border)', display: 'flex', alignItems: 'center',
          padding: '0 11px', fontSize: '11.5px', color: 'var(--d-dim)'
        });
        row.textContent = '第 ' + (i + 1) + ' 条 · 滚动速度决定拖影强度';
        list.appendChild(row);
      }
      win.appendChild(list);
      wrap.appendChild(win);

      var read = U.el('div', 'd-val', 'blur 0.0px · velocity 0.00 px/ms');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      var target = 0, current = 0, lastTop = 0, lastT = 0, vel = 0;
      var MAX = 5;

      ctx.on(win, 'scroll', function () {
        var now = performance.now();
        var dt = Math.max(now - lastT, 8);
        vel = Math.abs(win.scrollTop - lastTop) / dt;
        lastTop = win.scrollTop; lastT = now;
        target = Math.min(MAX, vel * 2.4);              // 强度随真实速度，带上限
      }, { passive: true });
      lastT = performance.now();

      ctx.raf(function () {
        target *= 0.82;                                  // 停手后目标自然衰减到 0
        current += (target - current) * 0.42;
        if (current < 0.04) current = 0;
        if (current === 0) {
          vel = 0;                                       // 停手后读数也归零，不留旧速度
          if (list.style.filter) { list.style.filter = 'none'; blur.setAttribute('stdDeviation', '0 0'); }
        } else {
          list.style.filter = 'url(#' + fid + ')';
          blur.setAttribute('stdDeviation', '0 ' + current.toFixed(2));
        }
        read.textContent = 'blur ' + current.toFixed(1) + 'px · velocity ' + vel.toFixed(2) + ' px/ms';
      });
      ctx.hint('方向性模糊 = feGaussianBlur 的 x/y 分离；滚动条与吸顶 UI 不参与模糊，静止时完全清晰');
    }
  });

  /* 4. Rubber-band Header Stretch */
  UIK.register('gesture', {
    en: 'Rubber-band Header Stretch', zh: '下拉拉伸顶部图片',
    h: 246,
    desc: '内容已在顶部时继续下拉，头部图片按下拉距离拉伸放大，覆盖文字同步淡出，松手带阻尼回弹。',
    hint: '在窗口内向下拖动（到顶后继续拉）：图片以上边为原点拉伸、文字同步淡出；松手回弹，不留空白缝。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '9px' });

      var win = U.el('div');
      U.css(win, {
        position: 'relative', height: '176px', overflow: 'hidden', background: 'var(--d-hole)',
        border: '1px solid var(--d-border)', borderRadius: '10px', touchAction: 'none', cursor: 'grab'
      });
      var content = U.el('div');
      U.css(content, { position: 'relative' });

      var hdr = U.el('div');
      U.css(hdr, {
        position: 'relative', height: '92px', background: 'var(--d-accent)', opacity: '.55',
        transformOrigin: 'top center', willChange: 'transform', overflow: 'hidden'
      });
      var cap = U.el('div');
      U.css(cap, {
        position: 'absolute', left: '0', right: '0', bottom: '12px', textAlign: 'center',
        fontSize: '13px', fontWeight: '600', color: 'var(--d-inv-text)'
      });
      cap.textContent = '下拉拉伸 · 覆盖文字同步淡出';
      hdr.appendChild(cap);

      var rows = U.el('div');
      U.css(rows, { padding: '10px', display: 'flex', flexDirection: 'column', gap: '7px' });
      for (var i = 0; i < 8; i++) {
        var r = U.el('div');
        U.css(r, {
          height: '28px', borderRadius: '8px', background: 'var(--d-panel)', border: '1px solid var(--d-border)',
          display: 'flex', alignItems: 'center', padding: '0 11px', fontSize: '11.5px', color: 'var(--d-dim)'
        });
        r.textContent = '内容 ' + (i + 1);
        rows.appendChild(r);
      }
      content.appendChild(hdr); content.appendChild(rows);
      win.appendChild(content);
      wrap.appendChild(win);

      var read = U.el('div', 'd-val', 'stretch ×1.00 · 文字 100%');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      /* 手动接管滚动：只有自己能干净地拦下"已到顶还继续下拉"的手势 */
      var startY = 0, startScroll = 0, mode = 'idle';
      function maxScroll() { return Math.max(0, content.offsetHeight - win.clientHeight); }
      function reset(animate) {
        hdr.style.transition = animate && !UIK.isReduced() ? 'transform .46s cubic-bezier(.34,1.3,.64,1)' : 'none';
        cap.style.transition = animate && !UIK.isReduced() ? 'opacity .3s' : 'none';
        hdr.style.transform = 'scaleY(1)';
        cap.style.opacity = '1';
        read.textContent = 'stretch ×1.00 · 文字 100%';
      }
      ctx.clean(U.drag(win, {
        onStart: function (e) {
          startY = e.clientY; startScroll = win.scrollTop; mode = 'idle';
          win.style.cursor = 'grabbing';
          hdr.style.transition = 'none'; cap.style.transition = 'none';
        },
        onMove: function (e) {
          var dy = e.clientY - startY;
          if (startScroll <= 0 && dy > 0) {
            mode = 'stretch';
            var s = dy / (dy + 120);                    // 非线性：越深越费力
            hdr.style.transform = 'scaleY(' + (1 + s * 0.6).toFixed(3) + ')';
            cap.style.opacity = String(Math.max(0, 1 - s * 1.2));
            read.textContent = 'stretch ×' + (1 + s * 0.6).toFixed(2) + ' · 文字 ' + Math.round(Math.max(0, 1 - s * 1.2) * 100) + '%';
          } else {
            mode = 'scroll';
            win.scrollTop = U.clamp(startScroll - dy, 0, maxScroll());
          }
        },
        onEnd: function () {
          win.style.cursor = 'grab';
          if (mode === 'stretch') reset(true);          // 松手阻尼回弹
        }
      }));
      reset(false);
      ctx.hint('只在 scrollTop=0 且继续下拉时接管；上滑与普通滚动完全走原路径，顶部不产生空白缝');
    }
  });

  /* 5. Snap to Guides */
  UIK.register('gesture', {
    en: 'Snap to Guides', zh: '拖拽元素自动吸附',
    h: 236,
    desc: '拖动元素靠近参考线时自动吸附并显示对齐线，进入/退出用不同阈值避免抖动，吸附瞬间给一次轻微顿挫。',
    hint: '拖动方块靠近中线或边框线：吸附时出现对齐线并有一次顿挫；移开超过退出阈值才解除。',
    mount: function (stage, ctx) {
      var W = 0, H = 168, SIZE = 44, PAD = 14;
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '9px' });

      var box = U.el('div');
      U.css(box, { position: 'relative', width: '100%', height: H + 'px', borderRadius: '10px', background: 'var(--d-hole)', border: '1px solid var(--d-border)', overflow: 'hidden', touchAction: 'none' });

      /* guides: vertical x positions + horizontal y positions */
      var vLine = U.el('div');
      U.css(vLine, { position: 'absolute', top: '0', bottom: '0', width: '1px', background: 'var(--d-accent)', opacity: '0', pointerEvents: 'none' });
      var hLineEl = U.el('div');
      U.css(hLineEl, { position: 'absolute', left: '0', right: '0', height: '1px', background: 'var(--d-accent)', opacity: '0', pointerEvents: 'none' });
      box.appendChild(vLine); box.appendChild(hLineEl);

      var chip = U.el('div');
      U.css(chip, { position: 'absolute', left: '0', top: '0', width: SIZE + 'px', height: SIZE + 'px', willChange: 'transform' });
      var face = U.el('div');
      U.css(face, {
        width: '100%', height: '100%', borderRadius: '11px', background: 'var(--d-accent)',
        opacity: '.85', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--d-inv-text)', fontSize: '15px', fontWeight: '600'
      });
      face.textContent = '◆';
      chip.appendChild(face);
      box.appendChild(chip);
      wrap.appendChild(box);

      var read = U.el('div', 'd-val', '');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      function guides() {
        W = box.clientWidth;
        return {
          v: [PAD, W / 2, W - PAD],
          h: [PAD, H / 2, H - PAD]
        };
      }
      var G = guides();
      ctx.on(window, 'resize', function () { G = guides(); });

      var raw = { x: G.v[1] - SIZE / 2, y: G.h[1] - SIZE / 2 };   // 指针推导出的自由位置（元素左上角）
      var pos = { x: raw.x, y: raw.y };          // 实际渲染位置（弹簧追随吸附目标）
      var snapped = { v: false, h: false };
      var target = { x: raw.x, y: raw.y };
      var pulse = 0;

      var ENTER = 9, EXIT = 18;
      function computeSnap() {
        var cx = raw.x + SIZE / 2, cy = raw.y + SIZE / 2;
        var out = { x: raw.x, y: raw.y, v: null, h: null };
        G.v.forEach(function (gx) {
          var d = Math.abs(cx - gx);
          var on = snapped.v ? d < EXIT : d < ENTER;
          if (on && (out.v === null || d < Math.abs(cx - out.v))) out.v = gx;
        });
        G.h.forEach(function (gy) {
          var d = Math.abs(cy - gy);
          var on = snapped.h ? d < EXIT : d < ENTER;
          if (on && (out.h === null || d < Math.abs(cy - out.h))) out.h = gy;
        });
        if (out.v !== null) out.x = out.v - SIZE / 2;
        if (out.h !== null) out.y = out.h - SIZE / 2;
        return out;
      }

      ctx.clean(U.drag(box, {
        onStart: function (e) {
          var r = box.getBoundingClientRect();
          raw.x = U.clamp(e.clientX - r.left - SIZE / 2, 0, W - SIZE);
          raw.y = U.clamp(e.clientY - r.top - SIZE / 2, 0, H - SIZE);
        },
        onMove: function (e) {
          var r = box.getBoundingClientRect();
          raw.x = U.clamp(e.clientX - r.left - SIZE / 2, 0, W - SIZE);
          raw.y = U.clamp(e.clientY - r.top - SIZE / 2, 0, H - SIZE);
        }
      }));

      ctx.raf(function (dt) {
        var s = computeSnap();
        var wasV = snapped.v, wasH = snapped.h;
        snapped.v = s.v !== null; snapped.h = s.h !== null;
        if ((snapped.v && !wasV) || (snapped.h && !wasH)) pulse = 1;   // 吸附瞬间一次顿挫

        target.x = s.x; target.y = s.y;
        var k = 1 - Math.exp(-dt * 26);                                 // 高刚度追随：跟手但吸附时柔和
        pos.x += (target.x - pos.x) * k;
        pos.y += (target.y - pos.y) * k;

        pulse *= 0.86;
        chip.style.transform = 'translate(' + pos.x.toFixed(2) + 'px,' + pos.y.toFixed(2) + 'px)';
        face.style.transform = 'scale(' + (1 + pulse * 0.09).toFixed(3) + ')';

        vLine.style.opacity = snapped.v ? '.9' : '0';
        vLine.style.left = (s.v === null ? 0 : s.v) + 'px';
        hLineEl.style.opacity = snapped.h ? '.9' : '0';
        hLineEl.style.top = (s.h === null ? 0 : s.h) + 'px';

        read.textContent = (snapped.v || snapped.h)
          ? '吸附中：' + (snapped.v ? 'X=' + s.v.toFixed(0) : 'X 自由') + ' / ' + (snapped.h ? 'Y=' + s.h.toFixed(0) : 'Y 自由')
          : '自由拖拽（进入 9px 吸附，退出 18px 解除）';
      });
      ctx.hint('进入 9px / 退出 18px 迟滞避免抖动；吸附只影响视觉位置，可读数始终保留真实坐标');
    }
  });

  /* 6. Arc Grid Reflow */
  UIK.register('gesture', {
    en: 'Arc Grid Reflow', zh: '网格重排走弧线',
    h: 234,
    desc: '列数变化时每一项沿弧线移动到新位置，相邻项错峰出发，快速连续切换从当前中间位置接续。',
    hint: '切换 2 / 3 列：元素沿弧线依次游到新位置；连续快速切换会从半路接续，不回起点重播。',
    mount: function (stage, ctx) {
      var ITEMS = 6, BOX_H = 150, GAP = 9;
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });
      var box = U.el('div');
      U.css(box, { position: 'relative', width: '100%', height: BOX_H + 'px', overflow: 'hidden' });

      var items = [];
      for (var i = 0; i < ITEMS; i++) {
        var it = U.el('div');
        U.css(it, {
          position: 'absolute', left: '0', top: '0', borderRadius: '10px', background: 'var(--d-panel)',
          border: '1px solid var(--d-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', color: 'var(--d-accent)', willChange: 'transform'
        });
        it.textContent = String(i + 1);
        U.css(it, { width: '60px', height: '40px' });
        box.appendChild(it);
        items.push({ el: it, cur: { x: 0, y: 0, w: 60, h: 40 }, from: null, to: null, delay: 0 });
      }
      wrap.appendChild(box);

      var bar = U.el('div', 'd-row');
      U.css(bar, { justifyContent: 'space-between', alignItems: 'center' });
      var read = U.el('span', 'd-val', '2 列');
      var btn2 = U.el('button', 'd-btn', '2 列');
      var btn3 = U.el('button', 'd-btn', '3 列');
      U.css(btn2, { fontSize: '12px' }); U.css(btn3, { fontSize: '12px' });
      bar.appendChild(read); bar.appendChild(btn2); bar.appendChild(btn3);
      wrap.appendChild(bar);
      stage.appendChild(wrap);

      var cols = 2, DUR = 400, STAGGER = 26;
      function targets(c) {
        var W = box.clientWidth || 300;
        var colW = (W - GAP * (c - 1)) / c;
        var rows = Math.ceil(ITEMS / c);
        var itemH = Math.min(46, (BOX_H - GAP * (rows - 1)) / rows);
        var contentH = rows * itemH + (rows - 1) * GAP;
        var y0 = Math.max(0, (BOX_H - contentH) / 2);
        return items.map(function (_, i) {
          var r = Math.floor(i / c), cc = i % c;
          return { x: cc * (colW + GAP), y: y0 + r * (itemH + GAP), w: colW, h: itemH };
        });
      }
      function set(cur) {
        var it = items[cur.i];
        it.cur = cur;
        it.el.style.transform = 'translate(' + cur.x.toFixed(2) + 'px,' + cur.y.toFixed(2) + 'px)';
        it.el.style.width = cur.w.toFixed(2) + 'px';
        it.el.style.height = cur.h.toFixed(2) + 'px';
      }
      function applyCols(c) {
        cols = c;
        read.textContent = c + ' 列';
        var t = targets(c);
        items.forEach(function (it, i) {
          it.from = { x: it.cur.x, y: it.cur.y, w: it.cur.w, h: it.cur.h };   // 从当前中间位置接续
          it.to = t[i];
          it.delay = i * STAGGER;
        });
        start();
      }

      var running = false, startTime = 0;
      function start() { running = true; startTime = performance.now(); }
      ctx.raf(function () {
        if (!running) return;
        var now = performance.now();
        var total = DUR + (ITEMS - 1) * STAGGER;
        var allDone = true;
        items.forEach(function (it, i) {
          var t = U.clamp((now - startTime - it.delay) / DUR, 0, 1);
          if (t < 1) allDone = false;
          var e = easeOutCubic(t);
          /* 二次贝塞尔：控制点取位移的垂直方向，形成弧线而不是直线 */
          var dx = it.to.x - it.from.x, dy = it.to.y - it.from.y;
          var len = Math.hypot(dx, dy) || 1;
          var off = Math.min(26, len * 0.34);
          var cx = (it.from.x + it.to.x) / 2 - (dy / len) * off;
          var cy = (it.from.y + it.to.y) / 2 + (dx / len) * off;
          var mt = 1 - e;
          var x = mt * mt * it.from.x + 2 * mt * e * cx + e * e * it.to.x;
          var y = mt * mt * it.from.y + 2 * mt * e * cy + e * e * it.to.y;
          set({ i: i, x: x, y: y, w: it.from.w + (it.to.w - it.from.w) * e, h: it.from.h + (it.to.h - it.from.h) * e });
        });
        if (allDone || now - startTime > total + 40) {
          items.forEach(function (it, i) { set({ i: i, x: it.to.x, y: it.to.y, w: it.to.w, h: it.to.h }); });
          running = false;
        }
      });
      ctx.on(btn2, 'click', function () { if (cols !== 2) applyCols(2); });
      ctx.on(btn3, 'click', function () { if (cols !== 3) applyCols(3); });
      ctx.on(window, 'resize', function () {
        var t = targets(cols);
        items.forEach(function (it, i) { set({ i: i, x: t[i].x, y: t[i].y, w: t[i].w, h: t[i].h }); });
      });

      /* first paint */
      (function () {
        var t = targets(cols);
        items.forEach(function (it, i) { set({ i: i, x: t[i].x, y: t[i].y, w: t[i].w, h: t[i].h }); });
      })();
      ctx.hint('路径是二次贝塞尔（控制点垂直于位移方向）；错峰 26ms；落位精确等于布局位置');
    }
  });

  /* 7. Adaptive Contrast Overlay */
  UIK.register('gesture', {
    en: 'Adaptive Contrast Overlay', zh: '悬浮元素自动反色',
    h: 232,
    desc: '悬浮文字按背后图像区域的亮度自动在深色与浅色之间连续切换，临界亮度加滞回，保证任何位置都可读。',
    hint: '左右拖动背景：三个悬浮标签各自按背后亮度反色，过程连续不硬切，临界点不闪烁。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '9px' });

      var view = U.el('div');
      U.css(view, {
        position: 'relative', width: '100%', height: '132px', overflow: 'hidden',
        borderRadius: '10px', border: '1px solid var(--d-border)', touchAction: 'none', cursor: 'grab'
      });

      /* 背景图案：真实项目里这是一张图片；这里用自绘渐变，亮度可直接由位置推出来。
         换成图片时，把 brightnessAt() 换成 canvas drawImage + 降采样取区域平均即可 */
      var bg = U.el('div');
      U.css(bg, {
        position: 'absolute', top: '0', left: '0', width: '200%', height: '100%',
        background: 'linear-gradient(90deg,#f7f9fc 0%,#c9d2e0 26%,#5b6474 55%,#262c39 78%,#0d1017 100%)',
        willChange: 'transform'
      });
      view.appendChild(bg);

      var chips = [0.24, 0.5, 0.76].map(function (fx, i) {
        var c = U.el('div');
        U.css(c, {
          position: 'absolute', top: (16 + i * 34) + 'px', left: (fx * 100) + '%', transform: 'translateX(-50%)',
          padding: '6px 11px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '600',
          border: '1px solid rgba(128,128,128,.4)', background: 'rgba(128,128,128,.16)',
          whiteSpace: 'nowrap', pointerEvents: 'none'
        });
        c.innerHTML =
          '<span class="dark" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#0b0d12">悬浮标签 ' + (i + 1) + '</span>' +
          '<span class="light" style="position:relative;display:flex;align-items:center;justify-content:center;color:#ffffff">悬浮标签 ' + (i + 1) + '</span>';
        view.appendChild(c);
        return { el: c, fx: fx, dark: true };
      });
      wrap.appendChild(view);

      var read = U.el('div', 'd-val', '');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      var offset = 0, MAXOFF = 0, dragging = false, startX = 0, startOffset = 0;
      function measure() { MAXOFF = view.clientWidth; }
      function paint() {
        bg.style.transform = 'translateX(' + (-offset) + 'px)';
        var parts = [];
        chips.forEach(function (ch, i) {
          /* 元素背后区域的亮度：位置 → 渐变上的相对位置 → 亮度 */
          var bx = ch.fx * view.clientWidth + offset;
          var t = U.clamp(bx / (view.clientWidth * 2), 0, 1);
          var lum = 1 - t;
          /* 滞回：只有越过 ±0.06 才真正切换，避免临界亮度闪烁 */
          if (ch.dark && lum < 0.44) ch.dark = false;
          else if (!ch.dark && lum > 0.56) ch.dark = true;
          /* 连续过渡用交叉淡化，不做硬切 */
          var want = ch.dark ? 1 : 0;
          var w = U.clamp((lum - 0.44) / 0.12, 0, 1);
          var darkOp = ch.dark ? U.clamp(0.5 + w / 2, 0, 1) : U.clamp(w / 2, 0, 1);
          ch.el.querySelector('.dark').style.opacity = String(darkOp.toFixed(2));
          ch.el.querySelector('.light').style.opacity = String((1 - darkOp).toFixed(2));
          parts.push((i + 1) + ':' + (ch.dark ? '深字' : '浅字') + '(' + lum.toFixed(2) + ')');
        });
        read.textContent = parts.join(' · ');
      }
      measure();
      paint();
      ctx.on(window, 'resize', function () { measure(); paint(); });
      ctx.clean(U.drag(view, {
        onStart: function (e) { dragging = true; startX = e.clientX; startOffset = offset; view.style.cursor = 'grabbing'; },
        onMove: function (e) {
          if (!dragging) return;
          offset = U.clamp(startOffset + (e.clientX - startX), 0, MAXOFF);
          paint();
        },
        onEnd: function () { dragging = false; view.style.cursor = 'grab'; }
      }));
      ctx.hint('亮度取元素背后区域而非整图平均；滞回 ±0.06；颜色交叉淡化，滚动中不硬切');
    }
  });

  /* 8. Focus Mode Selection */
  UIK.register('gesture', {
    en: 'Focus Mode Selection', zh: '选中项突出显示',
    h: 214,
    desc: '选中项放大提亮，同级未选中项降饱和、轻微缩小与模糊，注意力集中在当前选择上；未选中项仍可读可点。',
    hint: '点击或左右方向键切换：选中项放大提亮，其余降饱和缩小模糊，但依然清晰可点。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });

      var row = U.el('div');
      U.css(row, { display: 'flex', gap: '9px', justifyContent: 'center', alignItems: 'center', height: '128px', outline: 'none' });
      row.tabIndex = 0;
      row.setAttribute('role', 'listbox');

      var data = [
        { t: '海边', c: 'var(--d-accent)' },
        { t: '城市', c: 'var(--d-accent-2)' },
        { t: '山谷', c: 'var(--d-ok)' },
        { t: '街头', c: 'var(--d-warn)' },
        { t: '静物', c: 'var(--d-danger)' }
      ];
      var cards = data.map(function (d, i) {
        var c = U.el('div');
        U.css(c, {
          width: '56px', height: '82px', flex: '0 0 auto', borderRadius: '11px', overflow: 'hidden',
          background: 'var(--d-panel)', border: '1px solid var(--d-border)', cursor: 'pointer',
          transition: UIK.isReduced() ? 'none' : 'transform .32s cubic-bezier(.34,1.2,.64,1),filter .32s,opacity .32s,border-color .32s'
        });
        c.setAttribute('role', 'option');
        c.innerHTML = '<div style="height:54px;background:' + d.c + ';opacity:.6"></div>' +
          '<div style="padding:5px 6px;font-size:10.5px;color:var(--d-text);text-align:center">' + d.t + '</div>';
        row.appendChild(c);
        return c;
      });
      wrap.appendChild(row);

      var read = U.el('div', 'd-val', '');
      U.css(read, { textAlign: 'center' });
      wrap.appendChild(read);
      stage.appendChild(wrap);

      var active = 1;
      function select(i) {
        active = U.clamp(i, 0, cards.length - 1);
        cards.forEach(function (c, k) {
          var on = k === active;
          c.style.transform = on ? 'scale(1.1) translateY(-4px)' : 'scale(.9)';
          c.style.filter = on ? 'none' : 'saturate(.32) blur(1.6px)';
          c.style.opacity = on ? '1' : '.72';
          c.style.borderColor = on ? 'var(--d-accent)' : 'var(--d-border)';
          c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        read.textContent = '当前选择：' + data[active].t + '（模糊 ≤1.6px，缩小 10%，命中区不变）';
      }
      cards.forEach(function (c, i) { ctx.on(c, 'click', function () { select(i); }); });
      ctx.on(row, 'keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(active); }
      });
      select(active);
      ctx.hint('模糊克制（≤1.6px）、缩小 10%，命中区不随视觉缩放漂移；键盘方向键可切换');
    }
  });
})();
