/* 01 质感动效 · Motion Texture (8) */
(function () {
  var U = UIK.util;

  /* 1. Magnetic Attraction */
  UIK.register('motion', {
    en: 'Magnetic Attraction', zh: '磁吸效果',
    desc: '拖动元素靠近明确目标时提示落点：距离越近吸附权重越大，松手满足条件才提交。',
    hint: '拖动圆球靠近任一槽位；权重连续变化，松手才提交，移出范围会回位。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { position: 'relative', width: '100%', height: '180px' });
      var slots = [];
      [[0.24, 0.62], [0.76, 0.62]].forEach(function (p, i) {
        var s = U.el('div'); U.css(s, {
          position: 'absolute', width: '62px', height: '62px', borderRadius: '14px',
          border: '2px dashed #3a4255', left: 'calc(' + (p[0] * 100) + '% - 31px)', top: 'calc(' + (p[1] * 100) + '% - 31px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f7994', fontSize: '11px', transition: 'border-color .2s,background .2s,color .2s'
        });
        s.textContent = '槽位 ' + (i ? 'B' : 'A');
        box.appendChild(s); slots.push(s);
      });
      var ball = U.el('div', 'grab'); U.css(ball, {
        position: 'absolute', width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(145deg,#6ea8fe,#a78bfa)', boxShadow: '0 6px 18px rgba(110,168,254,.35)',
        left: '0px', top: '0px', zIndex: 3
      });
      box.appendChild(ball);
      var info = U.el('div', 'd-val'); U.css(info, { position: 'absolute', left: '0', top: '0', color: '#98a1b8' });
      box.appendChild(info);
      stage.appendChild(box);

      var W = box.clientWidth, H = box.clientHeight;
      var home = { x: W / 2, y: 34 };
      var sx = new U.Spring(home.x, 220, 26), sy = new U.Spring(home.y, 220, 26);
      var raw = { x: home.x, y: home.y }, dragging = false, placed = -1;

      function slotCenter(i) {
        var r = slots[i].getBoundingClientRect(), b = box.getBoundingClientRect();
        return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
      }
      ctx.on(window, 'resize', function () { W = box.clientWidth; H = box.clientHeight; home = { x: W / 2, y: 34 }; });

      ctx.clean(U.drag(ball, {
        onStart: function () { dragging = true; if (placed >= 0) { slots[placed].style.borderColor = '#3a4255'; slots[placed].style.background = 'transparent'; slots[placed].style.color = '#6f7994'; placed = -1; } },
        onMove: function (e) {
          var b = box.getBoundingClientRect();
          raw.x = U.clamp(e.clientX - b.left, 22, W - 22);
          raw.y = U.clamp(e.clientY - b.top, 22, H - 22);
        },
        onEnd: function () {
          dragging = false;
          var best = -1, bd = 1e9;
          slots.forEach(function (s, i) {
            var c = slotCenter(i), d = Math.hypot(c.x - raw.x, c.y - raw.y);
            if (d < bd) { bd = d; best = i; }
          });
          if (bd < 46) {
            var c = slotCenter(best);
            placed = best; raw.x = c.x; raw.y = c.y;
            slots[best].style.borderColor = '#4ade80'; slots[best].style.background = 'rgba(74,222,128,.12)'; slots[best].style.color = '#4ade80';
          } else { raw.x = home.x; raw.y = home.y; }
        }
      }));

      ctx.raf(function (dt) {
        var tx = raw.x, ty = raw.y, w = 0;
        if (dragging && placed < 0) {
          var best = -1, bd = 1e9;
          slots.forEach(function (s, i) {
            var c = slotCenter(i), d = Math.hypot(c.x - raw.x, c.y - raw.y);
            if (d < bd) { bd = d; best = i; }
          });
          var RANGE = 130;
          if (bd < RANGE) {
            w = Math.pow(1 - bd / RANGE, 1.8);
            var c = slotCenter(best);
            tx = raw.x + (c.x - raw.x) * w * 0.8;
            ty = raw.y + (c.y - raw.y) * w * 0.8;
          }
        }
        sx.t = tx; sy.t = ty;
        sx.step(dt); sy.step(dt);
        ball.style.transform = 'translate(' + (sx.v - 22) + 'px,' + (sy.v - 22) + 'px)';
        info.textContent = '吸附权重 ' + w.toFixed(2) + (placed >= 0 ? ' · 已放入槽位 ' + (placed ? 'B' : 'A') : '');
      });
      ctx.hint('距离 130px 内开始吸附，进入 46px 且松手才提交');
    }
  });

  /* 2. Velocity-driven Deformation */
  UIK.register('motion', {
    en: 'Velocity-driven Deformation', zh: '液态形变',
    desc: '卡片随拖动速度产生柔软拉伸：形变沿运动方向、幅度有上限，停手即恢复，正文保持可读。',
    hint: '快速拖动与慢速拖动同样的距离，形变明显不同；手指停住也会逐渐恢复。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { position: 'relative', width: '100%', height: '180px' });
      var shell = U.el('div', 'grab');
      U.css(shell, {
        position: 'absolute', width: '176px', height: '104px', borderRadius: '16px',
        background: 'linear-gradient(145deg,#2a3348,#1b2233)', border: '1px solid #2f3850',
        boxShadow: '0 10px 26px rgba(0,0,0,.35)', willChange: 'transform', transformOrigin: 'center'
      });
      var inner = U.el('div');
      U.css(inner, { position: 'absolute', inset: '0', padding: '12px 14px', transformOrigin: 'center' });
      inner.innerHTML = '<div style="font-size:13px;font-weight:600">可拖动卡片</div>' +
        '<div style="font-size:11.5px;color:#98a1b8;margin-top:6px">外壳随速度形变，正文反向补偿保持可读。</div>';
      shell.appendChild(inner); box.appendChild(shell);
      var meter = U.el('div', 'd-val'); U.css(meter, { position: 'absolute', right: '0', top: '0', color: '#98a1b8' });
      box.appendChild(meter); stage.appendChild(box);

      var W = box.clientWidth, H = box.clientHeight;
      var px = (W - 176) / 2, py = (H - 104) / 2;
      var vx = 0, vy = 0, last = null, dragging = false;
      var sAmp = new U.Spring(0, 150, 18), sAng = new U.Spring(0, 150, 18);

      ctx.clean(U.drag(shell, {
        onStart: function (e) { dragging = true; last = { x: e.clientX, y: e.clientY, t: performance.now() }; },
        onMove: function (e) {
          var b = box.getBoundingClientRect();
          var nx = U.clamp(e.clientX - b.left - 88, 0, W - 176);
          var ny = U.clamp(e.clientY - b.top - 52, 0, H - 104);
          var now = performance.now(), dt = Math.max(now - last.t, 8);
          vx = ((nx - px) / dt) * 0.35 + vx * 0.65;
          vy = ((ny - py) / dt) * 0.35 + vy * 0.65;
          px = nx; py = ny; last = { x: e.clientX, y: e.clientY, t: now };
        },
        onEnd: function () { dragging = false; vx *= 0.5; vy *= 0.5; }
      }));
      ctx.on(window, 'resize', function () { W = box.clientWidth; H = box.clientHeight; });

      ctx.raf(function (dt) {
        if (!dragging) { var f = Math.pow(0.001, dt); vx *= f; vy *= f; }
        else if (performance.now() - (last ? last.t : 0) > 60) { vx *= 0.85; vy *= 0.85; }
        var sp = Math.hypot(vx, vy);
        var amp = Math.min(sp * 0.55, 0.26);           // 幅度上限
        var ang = sp > 0.02 ? Math.atan2(vy, vx) * 180 / Math.PI : sAng.t;
        sAmp.t = amp; sAng.t = ang;
        sAmp.step(dt); sAng.step(dt);
        var a = sAmp.v, d = sAng.v;
        shell.style.transform = 'translate(' + px + 'px,' + py + 'px) rotate(' + d + 'deg) scale(' + (1 + a) + ',' + (1 - a * 0.62) + ') rotate(' + (-d) + 'deg)';
        inner.style.transform = 'rotate(' + (-d) + 'deg) scale(' + (1 - a * 0.72) + ',' + (1 + a * 0.45) + ') rotate(' + d + 'deg)';
        meter.textContent = '速度 ' + (sp * 1000).toFixed(0) + ' px/s · 形变 ' + (a * 100).toFixed(0) + '%';
      });
      ctx.hint('同样距离、不同速度 → 形变不同；上限 26%');
    }
  });

  /* 3. Layered Parallax */
  UIK.register('motion', {
    en: 'Layered Parallax', zh: '3D 视差',
    desc: '前景、中景、背景按不同深度系数随指针移动，整体轻微倾斜；离开回到中性位置。',
    hint: '在卡片上移动指针；四角输入不漏底，移出后复位。触摸设备为按压拖动。',
    mount: function (stage, ctx) {
      var wrap = U.el('div'); U.css(wrap, { perspective: '700px', width: '100%', display: 'flex', justifyContent: 'center' });
      var card = U.el('div'); U.css(card, {
        position: 'relative', width: '250px', height: '150px', borderRadius: '16px', overflow: 'hidden',
        transformStyle: 'preserve-3d', background: '#141a28', border: '1px solid #2b3348', willChange: 'transform'
      });
      var bg = U.el('div'); U.css(bg, {
        position: 'absolute', inset: '-14%', background: 'radial-gradient(80% 80% at 30% 20%,#3b4a72,#111726 70%)'
      });
      var mid = U.el('div'); U.css(mid, {
        position: 'absolute', left: '50%', top: '46%', width: '86px', height: '86px', marginLeft: '-43px', marginTop: '-43px',
        borderRadius: '24px', background: 'linear-gradient(145deg,#a78bfa,#6ea8fe)', opacity: '.95'
      });
      var fg = U.el('div'); U.css(fg, {
        position: 'absolute', left: '0', right: '0', bottom: '14px', textAlign: 'center'
      });
      fg.innerHTML = '<div style="font-size:14px;font-weight:600">前景标题</div><div style="font-size:11px;color:#98a1b8">中景 / 背景按不同深度位移</div>';
      card.appendChild(bg); card.appendChild(mid); card.appendChild(fg);
      wrap.appendChild(card); stage.appendChild(wrap);

      var nx = new U.Spring(0, 120, 18), ny = new U.Spring(0, 120, 18);
      function set(e) {
        var r = card.getBoundingClientRect();
        nx.t = U.clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
        ny.t = U.clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
      }
      ctx.on(card, 'pointermove', set);
      ctx.on(card, 'pointerleave', function () { nx.t = 0; ny.t = 0; });
      ctx.on(card, 'pointerdown', set);

      ctx.raf(function (dt) {
        nx.step(dt); ny.step(dt);
        var x = nx.v, y = ny.v;
        card.style.transform = 'rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 9) + 'deg)';
        fg.style.transform = 'translate3d(' + (x * 16) + 'px,' + (y * 12) + 'px,42px)';
        mid.style.transform = 'translate3d(' + (x * 9) + 'px,' + (y * 7) + 'px,20px)';
        bg.style.transform = 'translate3d(' + (x * 4) + 'px,' + (y * 3) + 'px,0) scale(1.06)';
      });
      ctx.hint('前景 16px / 中景 9px / 背景 4px，最大倾斜 9°');
    }
  });

  /* 4. Center-focus Scaling */
  UIK.register('motion', {
    en: 'Center-focus Scaling', zh: '中心聚焦',
    desc: '以真实滚动容器中心为基准，按卡片中心到容器中心的距离映射为有限范围缩放。',
    hint: '左右滚动列表；布局尺寸不变，只用视觉变换，不引起重排。',
    mount: function (stage, ctx) {
      var scroller = U.el('div'); U.css(scroller, {
        width: '100%', overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: '12px',
        padding: '18px 0', scrollbarWidth: 'thin'
      });
      var cards = [];
      ['一月', '二月', '三月', '四月', '五月', '六月', '七月'].forEach(function (t, i) {
        var c = U.el('div'); U.css(c, {
          flex: '0 0 auto', width: '96px', height: '132px', borderRadius: '14px',
          background: 'linear-gradient(160deg,#' + (30 + i * 6) + '3450,#1a2135)',
          border: '1px solid #2c3550', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', color: '#dbe3f5', willChange: 'transform'
        });
        c.textContent = t; scroller.appendChild(c); cards.push(c);
      });
      stage.appendChild(scroller);
      var pad = (scroller.clientWidth - 96) / 2;
      scroller.style.paddingLeft = pad + 'px'; scroller.style.paddingRight = pad + 'px';

      var dirty = true;
      ctx.on(scroller, 'scroll', function () { dirty = true; }, { passive: true });
      ctx.on(window, 'resize', function () {
        var p = (scroller.clientWidth - 96) / 2;
        scroller.style.paddingLeft = p + 'px'; scroller.style.paddingRight = p + 'px'; dirty = true;
      });

      function apply() {
        dirty = false;
        var r = scroller.getBoundingClientRect(), cx = r.left + r.width / 2;
        cards.forEach(function (c) {
          var cr = c.getBoundingClientRect();
          var d = Math.min(Math.abs((cr.left + cr.width / 2) - cx) / (r.width / 2), 1);
          var s = 1.14 - 0.24 * d, o = 1 - 0.42 * d;
          c.style.transform = 'scale(' + s.toFixed(3) + ')';
          c.style.opacity = o.toFixed(2);
          c.style.borderColor = d < 0.18 ? '#6ea8fe' : '#2c3550';
        });
      }
      ctx.raf(function () { if (dirty) apply(); });
      ctx.on(window, 'load', apply);
      setTimeout(apply, 60);
      ctx.hint('缩放范围 0.90 – 1.14，视觉焦点与业务选中分离');
    }
  });

  /* 5. Liquid Tab Indicator */
  UIK.register('motion', {
    en: 'Liquid Tab Indicator', zh: '液态 Tab',
    desc: '指示背景前后缘用不同节奏运动，形成先拉长再收拢的轮廓；文字与命中区域保持稳定。',
    hint: '连续快速点击各标签；指示块从当前形态接续，最终停在最后一次选择。',
    mount: function (stage, ctx) {
      var bar = U.el('div'); U.css(bar, {
        position: 'relative', display: 'flex', gap: '2px', background: '#121724',
        border: '1px solid #262e40', borderRadius: '999px', padding: '5px', width: '100%'
      });
      var ind = U.el('div'); U.css(ind, {
        position: 'absolute', top: '5px', bottom: '5px', left: '0', width: '0',
        borderRadius: '999px', background: 'linear-gradient(90deg,#6ea8fe,#a78bfa)', zIndex: 0
      });
      bar.appendChild(ind);
      var labels = ['首页', '发现推荐', '消息', '我的'];
      var tabs = labels.map(function (t, i) {
        var b = U.el('button', null, t);
        b.type = 'button';
        U.css(b, {
          position: 'relative', zIndex: 1, flex: '1 1 auto', background: 'transparent', border: 'none',
          color: '#98a1b8', padding: '8px 6px', fontSize: '12.5px', cursor: 'pointer', borderRadius: '999px', minHeight: '34px'
        });
        b.setAttribute('role', 'tab');
        bar.appendChild(b); return b;
      });
      stage.appendChild(bar);

      var a = new U.Spring(0, 230, 24);  // 前缘：快
      var b2 = new U.Spring(0, 130, 19); // 后缘：慢 → 先拉长后收拢 + 轻微回弹
      var cur = 0;
      function go(i) {
        cur = i;
        var br = bar.getBoundingClientRect(), r = tabs[i].getBoundingClientRect();
        a.t = r.left - br.left; b2.t = r.right - br.left;
        tabs.forEach(function (t, k) { t.style.color = k === i ? '#0b0d12' : '#98a1b8'; t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      }
      tabs.forEach(function (t, i) {
        ctx.on(t, 'click', function () { go(i); });
        ctx.on(t, 'keydown', function (e) {
          if (e.key === 'ArrowRight') { go((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
          if (e.key === 'ArrowLeft') { go((i - 1 + tabs.length) % tabs.length); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
        });
      });
      ctx.on(window, 'resize', function () { go(cur); });

      ctx.raf(function (dt) {
        a.step(dt); b2.step(dt);
        var l = Math.min(a.v, b2.v), w = Math.abs(b2.v - a.v);
        ind.style.left = l + 'px'; ind.style.width = w + 'px';
      });
      setTimeout(function () { go(0); a.v = a.t; b2.v = b2.t; }, 30);
      ctx.hint('前缘 stiffness 230 / 后缘 130：跨项切换同样连续');
    }
  });

  /* 6. Shared-element Image Expansion */
  UIK.register('motion', {
    en: 'Shared-element Image Expansion', zh: '图片展开',
    desc: '缩略图连续过渡到全屏视图：记录源图位置、尺寸与圆角，关闭时回到仍存在的源图。',
    hint: '点击任一缩略图展开，Esc 或点击关闭按钮收起；收起时沿原路径回到源图。',
    mount: function (stage, ctx) {
      var grid = U.el('div'); U.css(grid, { display: 'flex', gap: '10px', width: '100%' });
      var thumbs = [];
      [['linear-gradient(135deg,#f472b6,#a78bfa)', '作品 A'], ['linear-gradient(135deg,#34d399,#6ea8fe)', '作品 B'], ['linear-gradient(135deg,#fbbf24,#f87171)', '作品 C']].forEach(function (p, i) {
        var t = U.el('div', 'grab');
        U.css(t, {
          flex: '1 1 0', height: '112px', borderRadius: '12px', background: p[0], cursor: 'pointer',
          display: 'flex', alignItems: 'flex-end', padding: '8px', color: '#0b0d12', fontSize: '11.5px', fontWeight: '600', transition: 'transform .18s'
        });
        t.textContent = p[1]; grid.appendChild(t); thumbs.push(t);
      });
      stage.appendChild(grid);

      var ov = null;
      function open(src, idx) {
        if (ov) return;
        var r = src.getBoundingClientRect();
        ov = U.el('div'); U.css(ov, {
          position: 'fixed', inset: '0', background: 'rgba(6,8,12,.86)', zIndex: 999, display: 'flex', flexDirection: 'column'
        });
        var img = U.el('div'); U.css(img, {
          position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
          borderRadius: '12px', background: thumbs[idx].style.background, zIndex: 1000,
          transition: UIK.isReduced() ? 'none' : 'left .42s cubic-bezier(.2,.8,.2,1),top .42s cubic-bezier(.2,.8,.2,1),width .42s cubic-bezier(.2,.8,.2,1),height .42s cubic-bezier(.2,.8,.2,1),border-radius .42s'
        });
        var cap = U.el('div'); U.css(cap, {
          position: 'fixed', left: '0', right: '0', bottom: '34px', textAlign: 'center', color: '#e6e9f2',
          fontSize: '13px', zIndex: 1001, opacity: '0', transition: UIK.isReduced() ? 'none' : 'opacity .3s .18s'
        });
        cap.textContent = '全屏视图 · 文字与按钮独立呈现，不随图片拉伸';
        var close = U.el('button', 'd-btn', '关闭 (Esc)');
        U.css(close, { position: 'fixed', right: '18px', top: '18px', zIndex: 1002 });
        ov.appendChild(img); ov.appendChild(cap); ov.appendChild(close);
        document.body.appendChild(ov);
        src.style.opacity = '0';
        requestAnimationFrame(function () {
          var m = 28, aw = window.innerWidth - m * 2, ah = window.innerHeight - 120;
          var ar = r.width / r.height, scale = Math.min(aw / r.width, ah / r.height) * 0.98;
          var w = Math.min(aw, r.width * scale), h = w / ar;
          img.style.left = ((window.innerWidth - w) / 2) + 'px';
          img.style.top = ((window.innerHeight - h) / 2 - 10) + 'px';
          img.style.width = w + 'px'; img.style.height = h + 'px';
          img.style.borderRadius = '18px';
          cap.style.opacity = '1';
        });
        function shut() {
          if (!ov) return;
          var nr = src.getBoundingClientRect();
          img.style.left = nr.left + 'px'; img.style.top = nr.top + 'px';
          img.style.width = nr.width + 'px'; img.style.height = nr.height + 'px';
          img.style.borderRadius = '12px';
          cap.style.opacity = '0'; ov.style.background = 'rgba(6,8,12,0)';
          setTimeout(function () {
            document.body.removeChild(ov); ov = null; src.style.opacity = '1';
            document.removeEventListener('keydown', onKey);
          }, UIK.isReduced() ? 0 : 430);
        }
        function onKey(e) { if (e.key === 'Escape') shut(); }
        ctx.clean(function () { if (ov) { document.body.removeChild(ov); ov = null; src.style.opacity = '1'; document.removeEventListener('keydown', onKey); } });
        close.addEventListener('click', shut);
        ov.addEventListener('click', function (e) { if (e.target === ov) shut(); });
        document.addEventListener('keydown', onKey);
      }
      thumbs.forEach(function (t, i) { ctx.on(t, 'click', function () { open(t, i); }); });
      ctx.hint('过渡期间隐藏源图，避免出现两张重复图片');
    }
  });

  /* 7. Gesture-driven Transition */
  UIK.register('motion', {
    en: 'Gesture-driven Transition', zh: '手势转场',
    desc: '拖动期间位移直接映射转场进度；松手综合进度、速度与方向决定完成或取消。',
    hint: '按住卡片向左拖（或快速甩动）；松手按进度+速度判定，也可用「下一页」按钮。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, {
        position: 'relative', width: '100%', maxWidth: '300px', height: '168px',
        borderRadius: '14px', overflow: 'hidden', background: '#0e121b', border: '1px solid #262e40'
      });
      function page(txt, color, sub) {
        var p = U.el('div'); U.css(p, {
          position: 'absolute', inset: '0', background: color, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', willChange: 'transform'
        });
        p.innerHTML = '<div style="font-size:15px;font-weight:600">' + txt + '</div><div style="font-size:11.5px;opacity:.75;margin-top:4px">' + sub + '</div>';
        return p;
      }
      var pages = [page('页面 A', 'linear-gradient(160deg,#1f2b47,#141a28)', '当前页面'), page('页面 B', 'linear-gradient(160deg,#3a2a4d,#1b2233)', '下一页')];
      pages.forEach(function (p) { box.appendChild(p); });
      var bar = U.el('div', 'd-row'); U.css(bar, { marginTop: '10px', justifyContent: 'center' });
      var back = U.el('button', 'd-btn', '返回上一页'); var next = U.el('button', 'd-btn primary', '下一页');
      bar.appendChild(back); bar.appendChild(next);
      var wrap = U.el('div'); U.css(wrap, { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' });
      wrap.appendChild(box); wrap.appendChild(bar); stage.appendChild(wrap);

      var prog = new U.Spring(0, 200, 26), dragging = false, startX = 0, startY = 0, lastX = 0, lastT = 0, vel = 0, dir = 0, cur = 0;
      function reset() { prog.v = 0; prog.t = 0; prog.vel = 0; pages[0].style.opacity = '1'; }
      ctx.clean(U.drag(box, {
        onStart: function (e) { dragging = true; startX = lastX = e.clientX; startY = e.clientY; lastT = performance.now(); vel = 0; dir = 0; },
        onMove: function (e) {
          var dx = e.clientX - startX, dy = e.clientY - startY;
          if (!dir && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) dir = dx < 0 ? -1 : 1;
          if (dir === -1) {
            var w = box.clientWidth;
            prog.t = U.clamp((startX - e.clientX) / w, 0, 1);
            var now = performance.now();
            vel = ((e.clientX - lastX) / Math.max(now - lastT, 8)) * 0.4 + vel * 0.6;
            lastX = e.clientX; lastT = now;
          }
        },
        onEnd: function () {
          dragging = false;
          if (dir === -1) {
            if (vel < -0.45 || prog.t > 0.42) { commit(); } else { prog.t = 0; }
          }
          dir = 0;
        }
      }));
      function commit() {
        prog.t = 1;
        var done = false;
        var stop = ctx.raf(function () {
          if (!done && Math.abs(prog.v - 1) < 0.01) {
            done = true; stop();
            var t = pages[0].innerHTML; pages[0].innerHTML = pages[1].innerHTML;
            pages[1].innerHTML = t;
            var bg = pages[0].style.background; pages[0].style.background = pages[1].style.background; pages[1].style.background = bg;
            cur = cur ? 0 : 1; reset();
          }
        });
      }
      ctx.on(next, 'click', function () { if (UIK.isReduced()) { var t = pages[0].innerHTML; pages[0].innerHTML = pages[1].innerHTML; pages[1].innerHTML = t; } else commit(); });
      ctx.on(back, 'click', function () { reset(); });

      ctx.raf(function (dt) {
        if (!dragging && prog.t !== 1) { /* spring handles */ }
        prog.step(dt);
        var p = prog.v, w = box.clientWidth;
        pages[1].style.transform = 'translateX(' + ((1 - p) * w) + 'px)';
        pages[0].style.transform = 'translateX(' + (-p * w * 0.32) + 'px) scale(' + (1 - p * 0.06) + ')';
        pages[0].style.opacity = String(1 - p * 0.5);
      });
      ctx.hint('甩动速度 < -0.45 px/ms 或进度 > 0.42 判定完成；取消回弹到 0');
    }
  });

  /* 8. Collision and Spring Response */
  UIK.register('motion', {
    en: 'Collision and Spring Response', zh: '碰撞回弹',
    desc: '自由移动元素按简化碰撞体相互推挤：明确质量、阻尼与恢复系数，固定时间步避免穿透。',
    hint: '拖动任一圆球推开其他球；停止输入后收敛，不会持续抖动或穿透。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, {
        position: 'relative', width: '100%', height: '180px', borderRadius: '12px',
        background: '#0e121b', border: '1px solid #262e40', overflow: 'hidden', touchAction: 'none'
      });
      stage.appendChild(box);
      var W = box.clientWidth, H = box.clientHeight;
      var colors = ['#6ea8fe', '#a78bfa', '#4ade80', '#fbbf24', '#f87171', '#38bdf8', '#f472b6', '#34d399'];
      var names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      var bodies = [], nodes = [];
      for (var i = 0; i < 8; i++) {
        var r = 13 + (i % 3) * 4;
        var b = {
          x: 30 + (i % 4) * (W - 60) / 3 + (i > 3 ? 14 : 0), y: 34 + Math.floor(i / 4) * (H - 70),
          vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, r: r, m: r * r / 100, inv: 100 / (r * r), held: false
        };
        bodies.push(b);
        var n = U.el('div', 'grab'); U.css(n, {
          position: 'absolute', width: (r * 2) + 'px', height: (r * 2) + 'px', borderRadius: '50%',
          background: colors[i], color: '#0b0d12', fontSize: '11px', fontWeight: '700',
          display: 'flex', alignItems: 'center', justifyContent: 'center', left: '0', top: '0', willChange: 'transform'
        });
        n.textContent = names[i]; box.appendChild(n); nodes.push(n);
      }
      ctx.on(window, 'resize', function () { W = box.clientWidth; H = box.clientHeight; });

      bodies.forEach(function (b, i) {
        ctx.clean(U.drag(nodes[i], {
          onStart: function () { b.held = true; b.vx = 0; b.vy = 0; },
          onMove: function (e) {
            var rc = box.getBoundingClientRect();
            var nx = U.clamp(e.clientX - rc.left, b.r, W - b.r), ny = U.clamp(e.clientY - rc.top, b.r, H - b.r);
            b.vx = (nx - b.x) * 12; b.vy = (ny - b.y) * 12;
            b.x = nx; b.y = ny;
          },
          onEnd: function () { b.held = false; }
        }));
      });

      function step(h) {
        var i, j, b;
        for (i = 0; i < bodies.length; i++) {
          b = bodies[i];
          if (b.held) continue;
          b.x += b.vx * h; b.y += b.vy * h;
          if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.72; }
          if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.72; }
          if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.72; }
          if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * 0.72; }
          var damp = Math.pow(0.42, h);
          b.vx *= damp; b.vy *= damp;
          var sp = Math.hypot(b.vx, b.vy);
          if (sp > 900) { b.vx *= 900 / sp; b.vy *= 900 / sp; }
          if (sp < 1.2) { b.vx = 0; b.vy = 0; }
        }
        for (i = 0; i < bodies.length; i++) {
          for (j = i + 1; j < bodies.length; j++) {
            var a = bodies[i], c = bodies[j];
            var dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.001, min = a.r + c.r;
            if (d < min) {
              var nx = dx / d, ny = dy / d, over = min - d;
              var ia = a.held ? 0.02 : a.inv, ic = c.held ? 0.02 : c.inv, sum = ia + ic || 1;
              a.x -= nx * over * (ia / sum); a.y -= ny * over * (ia / sum);
              c.x += nx * over * (ic / sum); c.y += ny * over * (ic / sum);
              var rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
              if (rv < 0) {
                var imp = -(1 + 0.62) * rv / sum;
                if (!a.held) { a.vx -= imp * ia * nx; a.vy -= imp * ia * ny; }
                if (!c.held) { c.vx += imp * ic * nx; c.vy += imp * ic * ny; }
              }
            }
          }
        }
      }

      if (UIK.isReduced()) {
        bodies.forEach(function (b, i) { nodes[i].style.transform = 'translate(' + (b.x - b.r) + 'px,' + (b.y - b.r) + 'px)'; });
        ctx.hint('已开启减少动效：静态布局，不启动物理循环');
        return;
      }
      var acc = 0, FIXED = 1 / 120;
      ctx.raf(function (dt) {
        acc += Math.min(dt, 0.1);
        var n = 0;
        while (acc >= FIXED && n < 6) { step(FIXED); acc -= FIXED; n++; }
        bodies.forEach(function (b, i) { nodes[i].style.transform = 'translate(' + (b.x - b.r) + 'px,' + (b.y - b.r) + 'px)'; });
      });
      ctx.hint('固定步长 1/120s，最多 6 子步；恢复系数 0.62，静止后休眠');
    }
  });
})();
