/* 14 弹簧物理 · Spring Physics (4)
   调参台 / 可中断运动 / 阻尼三态 / 惯性抛掷
   所有弹簧均为自研积分器（标准阻尼弹簧 + dt 积分），不包含任何第三方库代码 */
(function () {
  var U = UIK.util;

  /* 带质量的阻尼弹簧：a = ((target - value) * k - velocity * c) / m */
  function Spring(v, k, c, m) {
    this.v = v; this.t = v; this.vel = 0;
    this.k = k; this.c = c; this.m = m || 1;
  }
  Spring.prototype.step = function (dt) {
    if (UIK.isReduced()) { this.v = this.t; this.vel = 0; return this.v; }
    var a = ((this.t - this.v) * this.k - this.vel * this.c) / this.m;
    this.vel += a * dt;
    this.v += this.vel * dt;
    return this.v;
  };
  /* 位置与速度分开判定：以像素位移和以 1 单位位移驱动的弹簧，阈值量级完全不同 */
  Spring.prototype.settled = function (posEps, velEps) {
    var pe = posEps == null ? 0.4 : posEps;
    var ve = velEps == null ? pe : velEps;
    return Math.abs(this.t - this.v) < pe && Math.abs(this.vel) < ve;
  };
  function zeta(k, c, m) { return c / (2 * Math.sqrt(k * m)); }
  function zetaLabel(z) { return z < 0.97 ? '欠阻尼' : (z > 1.03 ? '过阻尼' : '临界'); }

  function rangeRow(label, min, max, step, value, onInput) {
    var row = U.el('div');
    U.css(row, { display: 'flex', alignItems: 'center', gap: '9px', width: '100%' });
    var lb = U.el('span', null, label);
    U.css(lb, { width: '74px', flex: '0 0 auto', fontSize: '11px', color: 'var(--d-dim)' });
    var inp = U.el('input');
    inp.type = 'range';
    inp.min = String(min); inp.max = String(max); inp.step = String(step); inp.value = String(value);
    U.css(inp, { flex: '1 1 auto', minWidth: '0', accentColor: 'var(--d-accent)', cursor: 'pointer' });
    var out = U.el('span', null, String(value));
    U.css(out, { width: '46px', flex: '0 0 auto', fontSize: '11px', color: 'var(--d-accent)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' });
    inp.addEventListener('input', function () { out.textContent = inp.value; onInput(parseFloat(inp.value)); });
    row.appendChild(lb); row.appendChild(inp); row.appendChild(out);
    return { row: row, input: inp, out: out };
  }

  /* 1. Spring Tuner */
  UIK.register('spring', {
    en: 'Spring Tuner', zh: '弹簧调参台',
    h: 296,
    desc: '拖动 stiffness / damping / mass 三个参数，实时看到阻尼比、过冲幅度与稳定时间如何变化。',
    hint: '点「出发」看球弹过去，再拖三个滑杆：ζ < 1 会过冲、≈1 干脆到位、> 1 变迟钝。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '11px' });

      var track = U.el('div');
      U.css(track, {
        position: 'relative', height: '52px', borderRadius: '11px', background: 'var(--d-hole)',
        border: '1px solid var(--d-border)', overflow: 'hidden'
      });
      var ball = U.el('div');
      U.css(ball, {
        position: 'absolute', left: '0', top: '9px', width: '34px', height: '34px', borderRadius: '50%',
        background: 'var(--d-accent)', willChange: 'transform'
      });
      track.appendChild(ball);
      wrap.appendChild(track);

      var read = U.el('div', 'd-val', '');
      U.css(read, { fontVariantNumeric: 'tabular-nums' });
      wrap.appendChild(read);

      /* 声明提前：滑杆回调会用到这些量 */
      var sp = null;
      var side = 0, t0 = 0, peak = 0, stableMs = 0, armed = false, startV = 0, span0 = 1;
      var params = { k: 320, c: 24, m: 1 };
      /* 改参数后，上一次运动测出的过冲/稳定时间不再代表当前参数，必须清掉 */
      function onParam() { peak = 0; stableMs = 0; refresh(); }
      var r1 = rangeRow('stiffness', 80, 600, 10, params.k, function (v) { params.k = v; onParam(); });
      var r2 = rangeRow('damping', 6, 60, 1, params.c, function (v) { params.c = v; onParam(); });
      var r3 = rangeRow('mass', 0.5, 3, 0.1, params.m, function (v) { params.m = v; onParam(); });
      wrap.appendChild(r1.row); wrap.appendChild(r2.row); wrap.appendChild(r3.row);

      var btn = U.el('button', 'd-btn primary', '出发');
      U.css(btn, { fontSize: '12px', alignSelf: 'flex-start' });
      wrap.appendChild(btn);
      stage.appendChild(wrap);

      var SIZE = 34;
      sp = new Spring(0, params.k, params.c, params.m);

      function travel() { return Math.max(1, track.clientWidth - SIZE); }
      function refresh() {
        if (!sp) return;
        sp.k = params.k; sp.c = params.c; sp.m = params.m;
        var z = zeta(params.k, params.c, params.m);
        read.textContent = 'ζ ' + z.toFixed(2) + '（' + zetaLabel(z) + '）' + (stableMs ? ' · 稳定耗时 ' + Math.round(stableMs) + 'ms' : '') +
          (peak > 0.005 ? ' · 过冲 ' + Math.round(peak * 100) + '%' : ' · 无过冲');
      }
      function go() {
        side = side ? 0 : 1;
        sp.t = side * travel();
        /* 基准在出发时固定：过冲要相对"这次要走的距离"来算，不能每帧重取 */
        startV = sp.v;
        span0 = Math.max(1, Math.abs(sp.t - startV));
        t0 = performance.now(); peak = 0; stableMs = 0; armed = true;
      }
      ctx.on(btn, 'click', go);
      ctx.on(window, 'resize', function () { sp.t = side * travel(); sp.v = sp.t; paint(); });

      function paint() { ball.style.transform = 'translateX(' + sp.v.toFixed(2) + 'px)'; }
      ctx.raf(function (dt) {
        sp.step(dt);
        if (armed) {
          /* 过冲 = 实际走过的距离超出目标距离的比例 */
          var ratio = (Math.abs(sp.v - startV) - span0) / span0;
          if (ratio > peak) peak = ratio;
          if (sp.settled(0.5)) {
            if (!stableMs) stableMs = performance.now() - t0;
            armed = false;
            refresh();
          }
        }
        paint();
      });
      sp.t = 0; refresh();
      ctx.hint('ζ = c / (2√(km))；滑杆直接改弹簧参数，正在飞的球会立刻按新参数继续（不重启动画）');
    }
  });

  /* 2. Interruptible Motion */
  UIK.register('spring', {
    en: 'Interruptible Motion', zh: '可中断运动',
    h: 258,
    desc: '同样的来回切换，弹簧保留速度、换向平滑；固定时长过渡会在中断处把速度清零，出现顿挫。',
    hint: '快速连点「反向」：看上面那条速度读数 —— 弹簧平滑换向，transition 的速度被清零。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });

      function lane(title) {
        var box = U.el('div');
        U.css(box, { display: 'flex', flexDirection: 'column', gap: '5px' });
        var cap = U.el('div', null, title);
        U.css(cap, { fontSize: '11px', color: 'var(--d-dim)' });
        var track = U.el('div');
        U.css(track, {
          position: 'relative', height: '40px', borderRadius: '9px', background: 'var(--d-hole)',
          border: '1px solid var(--d-border)'
        });
        var chip = U.el('div');
        U.css(chip, {
          position: 'absolute', left: '0', top: '6px', width: '28px', height: '28px', borderRadius: '8px',
          willChange: 'transform'
        });
        track.appendChild(chip);
        box.appendChild(cap); box.appendChild(track);
        return { box: box, chip: chip, track: track };
      }
      var A = lane('弹簧驱动（保留速度）');
      var B = lane('固定时长过渡（中断即清零）');
      U.css(A.chip, { background: 'var(--d-accent)' });
      U.css(B.chip, { background: 'var(--d-accent-2)' });
      wrap.appendChild(A.box); wrap.appendChild(B.box);

      var read = U.el('div', 'd-val', '');
      U.css(read, { fontVariantNumeric: 'tabular-nums' });
      wrap.appendChild(read);

      var btn = U.el('button', 'd-btn primary', '反向');
      U.css(btn, { fontSize: '12px', alignSelf: 'flex-start' });
      wrap.appendChild(btn);
      stage.appendChild(wrap);

      var SIZE = 28;
      var sp = new Spring(0, 300, 22, 1);
      var side = 0, lastX2 = 0, vel2 = 0;

      function travel() { return Math.max(1, A.track.clientWidth - SIZE); }
      function readX(el) {
        var m = getComputedStyle(el).transform;
        if (!m || m === 'none') return 0;
        var p = /matrix\(([^)]+)\)/.exec(m);
        return p ? parseFloat(p[1].split(',')[4]) || 0 : 0;
      }
      function toggle() {
        side = side ? 0 : 1;
        /* 弹簧：只改目标，保留当前位置与速度 —— 这就是它能平滑换向的原因 */
        sp.t = side * travel();
        /* 过渡：中断时位置连续，但速度从 0 重新开始 */
        UIK.tx(B.chip, 'transform .6s ease-out');
        B.chip.style.transform = 'translateX(' + (side * travel()) + 'px)';
      }
      ctx.on(btn, 'click', toggle);
      ctx.on(window, 'resize', function () {
        sp.t = side * travel(); sp.v = sp.t;
        B.chip.style.transform = 'translateX(' + (side * travel()) + 'px)';
      });

      ctx.raf(function (dt) {
        sp.step(dt);
        A.chip.style.transform = 'translateX(' + sp.v.toFixed(2) + 'px)';
        var x2 = readX(B.chip);
        vel2 = (x2 - lastX2) / Math.max(dt, 0.001);
        lastX2 = x2;
        read.textContent = '弹簧 v ' + (sp.vel / 100).toFixed(2) + ' / 过渡 v ' + (vel2 / 100).toFixed(2) + '（单位：px per 10ms）';
      });
      ctx.hint('快速连点：弹簧的 v 连续变化；过渡的 v 每次换向都被清零 —— 这是"顿挫感"的来源');
    }
  });

  /* 3. Damping Regimes */
  UIK.register('spring', {
    en: 'Damping Regimes', zh: '阻尼三态',
    h: 268,
    desc: '同一个动作在欠阻尼、临界阻尼、过阻尼下的并排对比：过冲幅度与稳定时间完全不同。',
    hint: '点「同时触发」：三张卡用同一组 stiffness，只改 damping，看 ζ 决定要不要过冲。',
    mount: function (stage, ctx) {
      var K = 300, M = 1;
      var CRIT = 2 * Math.sqrt(K * M);            // 临界阻尼的 c
      var sets = [
        { name: '欠阻尼', c: CRIT * 0.35, col: 'var(--d-warn)' },
        { name: '临界阻尼', c: CRIT, col: 'var(--d-ok)' },
        { name: '过阻尼', c: CRIT * 1.8, col: 'var(--d-accent-2)' }
      ];

      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '11px' });
      var row = U.el('div');
      U.css(row, { display: 'flex', gap: '8px', alignItems: 'flex-start' });

      var cards = sets.map(function (s) {
        var box = U.el('div');
        U.css(box, {
          flex: '1 1 0', minWidth: '0', borderRadius: '11px', border: '1px solid var(--d-border)',
          background: 'var(--d-panel)', padding: '10px 9px', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: '8px'
        });
        var dot = U.el('div');
        U.css(dot, {
          width: '26px', height: '26px', borderRadius: '8px', background: s.col, willChange: 'transform'
        });
        var nm = U.el('div', null, s.name);
        U.css(nm, { fontSize: '11px', color: 'var(--d-text)', fontWeight: '600' });
        var zl = U.el('div', null, 'ζ ' + zeta(K, s.c, M).toFixed(2));
        U.css(zl, { fontSize: '10.5px', color: 'var(--d-dim)' });
        var st = U.el('div', null, '—');
        U.css(st, { fontSize: '10.5px', color: 'var(--d-dim-2)', textAlign: 'center', lineHeight: '1.5' });
        box.appendChild(dot); box.appendChild(nm); box.appendChild(zl); box.appendChild(st);
        row.appendChild(box);
        return { el: box, dot: dot, stat: st, sp: new Spring(0, K, s.c, M), t0: 0, peak: 0, done: 0, startV: 0, span0: 1 };
      });
      wrap.appendChild(row);

      var btn = U.el('button', 'd-btn primary', '同时触发');
      U.css(btn, { fontSize: '12px', alignSelf: 'flex-start' });
      wrap.appendChild(btn);
      stage.appendChild(wrap);

      function trigger() {
        cards.forEach(function (c) {
          c.sp.t = c.sp.t ? 0 : 1;              // 0 → 1 交替
          c.startV = c.sp.v;
          c.span0 = Math.max(0.001, Math.abs(c.sp.t - c.startV));
          c.t0 = performance.now(); c.peak = 0; c.done = 0;
          c.stat.textContent = '运动中…';
        });
      }
      ctx.on(btn, 'click', trigger);

      ctx.raf(function (dt) {
        cards.forEach(function (c) {
          c.sp.step(dt);
          var p = c.sp.v;
          if (c.t0) {
            var ratio = (Math.abs(p - c.startV) - c.span0) / c.span0;
            if (ratio > c.peak) c.peak = ratio;
            if (c.sp.settled(0.02, 0.2)) {
              if (!c.done) {
                c.done = performance.now() - c.t0;
                c.stat.textContent = (c.peak > 0.005 ? '过冲 ' + Math.round(c.peak * 100) + '%\n' : '无过冲\n') + '稳定 ' + Math.round(c.done) + 'ms';
                c.t0 = 0;
              }
            }
          }
          /* 位移 + 缩放一起由同一弹簧驱动 */
          c.dot.style.transform = 'translateY(' + (p * 22).toFixed(2) + 'px) scale(' + (1 + p * 0.28).toFixed(3) + ')';
        });
      });
      ctx.hint('三张卡 stiffness 都是 ' + K + '，只有 damping 不同（临界值 ' + CRIT.toFixed(1) + '）：过冲由 ζ 决定，不是由"快慢"决定');
    }
  });

  /* 4. Inertial Throw */
  UIK.register('spring', {
    en: 'Inertial Throw', zh: '惯性抛掷',
    h: 262,
    desc: '拖拽时跟手，松手后按释放速度继续滑行，由摩擦逐帧衰减，碰到边界反弹并损失能量。',
    hint: '拖动方块后甩出去：速度决定滑行距离，摩擦越大停得越快；撞到两端会反弹但损失能量。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });

      var track = U.el('div');
      U.css(track, {
        position: 'relative', height: '64px', borderRadius: '11px', background: 'var(--d-hole)',
        border: '1px solid var(--d-border)', overflow: 'hidden', touchAction: 'none', cursor: 'grab'
      });
      var knob = U.el('div');
      U.css(knob, {
        position: 'absolute', left: '0', top: '9px', width: '76px', height: '46px', borderRadius: '10px',
        background: 'var(--d-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--d-inv-text)', fontSize: '11px', fontWeight: '600', willChange: 'transform'
      });
      knob.textContent = '甩我';
      track.appendChild(knob);
      wrap.appendChild(track);

      var read = U.el('div', 'd-val', '');
      U.css(read, { fontVariantNumeric: 'tabular-nums' });
      wrap.appendChild(read);

      var fric = { v: 0.96 };
      var fr = rangeRow('friction', 0.85, 0.995, 0.005, fric.v, function (v) {
        fric.v = v;
        fr.out.textContent = v.toFixed(3);
      });
      fr.out.textContent = fric.v.toFixed(3);
      wrap.appendChild(fr.row);
      stage.appendChild(wrap);

      var SIZE = 76;
      var x = 0, vel = 0, dragging = false, grabDx = 0, lastX = 0, lastT = 0;

      function maxX() { return Math.max(0, track.clientWidth - SIZE); }
      function paint() {
        knob.style.transform = 'translateX(' + x.toFixed(2) + 'px)';
        read.textContent = 'x ' + x.toFixed(0) + ' / ' + maxX().toFixed(0) + ' · 速度 ' + (vel / 100).toFixed(2) + ' · 摩擦 ' + fric.v.toFixed(3);
      }
      ctx.clean(U.drag(track, {
        onStart: function (e) {
          dragging = true;
          var r = track.getBoundingClientRect();
          grabDx = U.clamp(e.clientX - r.left - x, 0, SIZE);
          lastX = e.clientX; lastT = performance.now(); vel = 0;
          track.style.cursor = 'grabbing';
        },
        onMove: function (e) {
          if (!dragging) return;
          var r = track.getBoundingClientRect();
          x = U.clamp(e.clientX - r.left - grabDx, 0, maxX());
          var now = performance.now();
          var dt = Math.max(now - lastT, 8);
          vel = ((e.clientX - lastX) / dt) * 0.55 + vel * 0.45;   // 平滑测速
          lastX = e.clientX; lastT = now;
          paint();
        },
        onEnd: function () {
          dragging = false;
          track.style.cursor = 'grab';
          vel *= 16;                                    // 换算成 px/s 量级
        }
      }));

      ctx.raf(function (dt) {
        if (!dragging) {
          x += vel * dt;
          vel *= Math.pow(fric.v, dt * 60);             // 逐帧摩擦衰减（与帧率无关）
          if (x < 0) { x = 0; vel = -vel * 0.45; }       // 边界反弹并损失能量
          if (x > maxX()) { x = maxX(); vel = -vel * 0.45; }
          if (Math.abs(vel) < 3) vel = 0;                // 收敛：停下来
          paint();
        }
      });
      ctx.on(window, 'resize', function () { x = U.clamp(x, 0, maxX()); paint(); });
      paint();
      ctx.hint('松手速度决定滑行距离；摩擦用 pow(f, dt×60) 衰减 → 高低帧率下距离一致；撞墙反弹损失 55% 能量');
    }
  });
})();
