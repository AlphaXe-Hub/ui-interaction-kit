/* 08 加载动效 · Loading States (7) */
(function () {
  var U = UIK.util;
  function host(stage) { var h = U.el('div'); U.css(h, { position: 'relative', width: '100%', height: '178px', display: 'flex', alignItems: 'center', justifyContent: 'center' }); stage.appendChild(h); return h; }
  function fakeContent() {
    var c = U.el('div'); U.css(c, { width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' });
    c.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6ea8fe,#a78bfa)"></div>' +
      '<div><div style="font-size:12.5px;font-weight:600">客户：深圳市水务集团</div><div style="font-size:11px;color:#98a1b8">最近跟进 2 小时前</div></div></div>' +
      '<div style="font-size:11.5px;color:#98a1b8">数据已加载完成，骨架被真实内容替换，布局没有跳动。</div>';
    return c;
  }
  function shimmerKeyframes() {
    if (document.getElementById('uik-shimmer')) return;
    var s = document.createElement('style');
    s.id = 'uik-shimmer';
    s.textContent = '@keyframes uikShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}';
    document.head.appendChild(s);
  }

  /* 1. Page Loader */
  UIK.register('loading', {
    en: 'Page Loader', zh: '整页加载',
    desc: '覆盖整个页面告知首次加载；必须等核心内容就绪，并给出超时或重试，不能停在加载态。',
    hint: '自动循环演示：覆盖层 → 数据到达即切换。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var inner = U.el('div'); U.css(inner, { width: '100%', padding: '12px' });
      inner.appendChild(fakeContent());
      h.appendChild(inner);
      var ov = U.el('div'); U.css(ov, {
        position: 'absolute', inset: '0', background: 'rgba(11,13,18,.88)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '10px', zIndex: 6, opacity: '1'
      });
      UIK.tx(ov, 'opacity .3s');
      var ring = U.el('div'); U.css(ring, {
        width: '30px', height: '30px', borderRadius: '50%', border: '3px solid #2b3348', borderTopColor: '#6ea8fe'
      });
      if (!UIK.isReduced()) ring.animate(
        [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 900, iterations: Infinity });
      var txt = U.el('div'); U.css(txt, { fontSize: '11.5px', color: '#98a1b8' });
      txt.textContent = '正在加载页面数据…';
      ov.appendChild(ring); ov.appendChild(txt); h.appendChild(ov);
      var on = true;
      ctx.interval(function () {
        on = !on;
        ov.style.opacity = on ? '1' : '0';
        ov.style.pointerEvents = on ? 'auto' : 'none';
      }, 2600);
      ctx.hint('阻塞整页，只在必须等待时使用');
    }
  });

  /* 2. Skeleton */
  UIK.register('loading', {
    en: 'Skeleton', zh: '骨架屏',
    desc: '内容未就绪时用占位结构保留页面布局，避免加载完成后的跳动。',
    hint: '自动循环演示：骨架 → 真实内容，尺寸保持一致。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var sk = U.el('div'); U.css(sk, { width: '100%', display: 'flex', flexDirection: 'column', gap: '9px', padding: '4px' });
      function bar(w, hh) { var b = U.el('div'); U.css(b, { width: w, height: hh, borderRadius: '7px', background: '#232b3d' }); return b; }
      var r1 = U.el('div'); U.css(r1, { display: 'flex', gap: '10px', alignItems: 'center' });
      var dot = U.el('div'); U.css(dot, { width: '34px', height: '34px', borderRadius: '50%', background: '#232b3d', flex: '0 0 34px' });
      var rc = U.el('div'); U.css(rc, { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1' });
      rc.appendChild(bar('62%', '11px')); rc.appendChild(bar('38%', '9px'));
      r1.appendChild(dot); r1.appendChild(rc);
      sk.appendChild(r1); sk.appendChild(bar('100%', '9px')); sk.appendChild(bar('86%', '9px'));
      var real = fakeContent(); U.css(real, { display: 'none' });
      h.appendChild(sk); h.appendChild(real);
      var loading = true;
      ctx.interval(function () {
        loading = !loading;
        sk.style.display = loading ? 'flex' : 'none';
        real.style.display = loading ? 'none' : 'flex';
      }, 2400);
      ctx.hint('占位尺寸贴近真实内容，避免替换时跳动');
    }
  });

  /* 3. Shimmer */
  UIK.register('loading', {
    en: 'Shimmer', zh: '微光扫过',
    desc: '在骨架屏上叠加移动高光，告诉用户内容仍在加载；reduced-motion 时高光停止。',
    hint: '自动循环演示；开启「减少动效」后高光停止移动。',
    mount: function (stage, ctx) {
      shimmerKeyframes();
      var h = host(stage);
      var wrap = U.el('div'); U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });
      [0, 1, 2].forEach(function (i) {
        var line = U.el('div'); U.css(line, {
          position: 'relative', height: i === 0 ? '34px' : '12px', borderRadius: '8px', background: '#1e2534', overflow: 'hidden'
        });
        if (i === 0) line.style.width = '70%'; else line.style.width = i === 1 ? '100%' : '82%';
        var gl = U.el('div');
        U.css(gl, {
          position: 'absolute', top: '0', bottom: '0', width: '45%',
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.13),transparent)'
        });
        if (!UIK.isReduced()) gl.style.animation = 'uikShimmer 1.5s infinite';
        line.appendChild(gl); wrap.appendChild(line);
      });
      h.appendChild(wrap);
      ctx.hint('Shimmer 是 Skeleton 的增强，不承担布局保留');
    }
  });

  /* 4. Spinner */
  UIK.register('loading', {
    en: 'Spinner', zh: '旋转指示器',
    desc: '任务处理中且无法判断完成时间时使用，表示系统仍在工作；不伪造百分比。',
    hint: '短任务建议延迟 200ms 再显示，避免一闪而过。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var box = U.el('div'); U.css(box, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' });
      var sp = U.el('div'); U.css(sp, {
        width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #2b3348', borderTopColor: '#6ea8fe'
      });
      var txt = U.el('div', 'd-val', '处理中…');
      box.appendChild(sp); box.appendChild(txt); h.appendChild(box);
      if (!UIK.isReduced()) sp.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 900, iterations: Infinity });
      else txt.textContent = '处理中…（静态替代）';
      ctx.hint('不确定进度时不要显示百分比');
    }
  });

  /* 5. Progress Bar */
  UIK.register('loading', {
    en: 'Progress Bar', zh: '进度条',
    desc: '任务进度可被计算时展示已完成百分比，让用户了解还要多久。',
    hint: '自动循环演示 0 → 100%，到达后显示完成态。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var box = U.el('div'); U.css(box, { width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' });
      var track = U.el('div'); U.css(track, { height: '8px', background: '#232b3a', borderRadius: '4px', overflow: 'hidden' });
      var fill = U.el('div'); U.css(fill, { height: '100%', width: '0', background: 'linear-gradient(90deg,#6ea8fe,#4ade80)', borderRadius: '4px' });
      track.appendChild(fill);
      var txt = U.el('div', 'd-val', '0%');
      box.appendChild(track); box.appendChild(txt); h.appendChild(box);
      var p = 0;
      if (UIK.isReduced()) { fill.style.width = '100%'; txt.textContent = '100% · 已完成'; }
      else {
        ctx.interval(function () {
          p += 4;
          if (p > 100) p = 0;
          fill.style.width = p + '%';
          txt.textContent = p + '%' + (p >= 100 ? ' · 已完成' : '');
          track.setAttribute('aria-valuenow', p);
        }, 90);
      }
      ctx.hint('进度可计算才使用，失败要给出重试');
    }
  });

  /* 6. Circular Progress */
  UIK.register('loading', {
    en: 'Circular Progress', zh: '环形进度',
    desc: '与进度条作用相同，但适合按钮、卡片等空间有限的场景。',
    hint: '自动循环演示环形填充，中心显示百分比。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var box = U.el('div'); U.css(box, { position: 'relative', width: '86px', height: '86px' });
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 86 86'); svg.setAttribute('width', '86'); svg.setAttribute('height', '86');
      svg.innerHTML = '<circle cx="43" cy="43" r="34" fill="none" stroke="#232b3a" stroke-width="8"/>' +
        '<circle id="arc" cx="43" cy="43" r="34" fill="none" stroke="#6ea8fe" stroke-width="8" stroke-linecap="round" ' +
        'stroke-dasharray="213.6" stroke-dashoffset="213.6" transform="rotate(-90 43 43)"/>';
      box.appendChild(svg);
      var txt = U.el('div', 'd-val', '0%');
      U.css(txt, { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#e6e9f2' });
      box.appendChild(txt); h.appendChild(box);
      var arc = svg.querySelector('#arc'), C = 2 * Math.PI * 34, p = 0;
      function set(v) { arc.setAttribute('stroke-dashoffset', String(C * (1 - v / 100))); txt.textContent = v + '%'; }
      if (UIK.isReduced()) set(100);
      else ctx.interval(function () { p += 4; if (p > 100) p = 0; set(p); }, 90);
      ctx.hint('小空间展示确定进度');
    }
  });

  /* 7. Button Loader */
  UIK.register('loading', {
    en: 'Button Loader', zh: '按钮加载',
    desc: '提交、生成或保存后让按钮进入加载态，同时防止重复点击。',
    hint: '点击提交：按钮进入加载态并禁用，完成后回到可点击状态。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn primary', '提交表单'); btn.type = 'button';
      U.css(btn, { minWidth: '132px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' });
      h.appendChild(btn);
      var sp = U.el('span'); U.css(sp, {
        width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(11,13,18,.35)',
        borderTopColor: '#0b0d12', display: 'none'
      });
      btn.insertBefore(sp, btn.firstChild);
      var busy = false;
      ctx.on(btn, 'click', function () {
        if (busy) return;
        busy = true; btn.disabled = true; sp.style.display = 'inline-block';
        btn.setAttribute('aria-busy', 'true');
        btn.lastChild.textContent = '提交中…';
        if (!UIK.isReduced()) sp.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 800, iterations: Infinity });
        var t = setTimeout(function () {
          busy = false; btn.disabled = false; sp.style.display = 'none';
          btn.setAttribute('aria-busy', 'false');
          btn.lastChild.textContent = '提交成功';
          var t2 = setTimeout(function () { btn.lastChild.textContent = '提交表单'; }, 1200);
          ctx.clean(function () { clearTimeout(t2); });
        }, 1500);
        ctx.clean(function () { clearTimeout(t); });
      });
      ctx.hint('加载期间禁用按钮，避免重复提交');
    }
  });
})();
