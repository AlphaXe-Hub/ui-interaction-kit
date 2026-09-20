/* 10 质感组件交互 · Texture Components (6)
   组件级形态细节：重叠排列 / 进度底色 / 横向手风琴 / 组件托盘 / 跟手放大图标 / 下拉摘要 */
(function () {
  var U = UIK.util;

  /* 1. Overlapping Stack */
  UIK.register('texture', {
    en: 'Overlapping Stack', zh: '重叠排列',
    h: 150,
    desc: '一组同类元素互相压住三分之一，末尾显示剩余数量；点击依次散开成整行并显示名称，再点收回。',
    hint: '点击这一组头像：依次错峰散开显示名称，末尾计数隐藏；再次点击按相反顺序收拢。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' });

      var row = U.el('div');
      U.css(row, { display: 'flex', alignItems: 'center', height: '48px', outline: 'none', cursor: 'pointer', touchAction: 'manipulation' });
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-expanded', 'false');

      var people = [
        { n: '陈', r: '产品', c: 'var(--d-accent)' },
        { n: '林', r: '设计', c: 'var(--d-accent-2)' },
        { n: '周', r: '前端', c: 'var(--d-ok)' },
        { n: '吴', r: '测试', c: 'var(--d-warn)' }
      ];
      var items = people.map(function (p, i) {
        var it = U.el('div');
        U.css(it, {
          display: 'flex', alignItems: 'center', overflow: 'hidden', flex: '0 0 auto',
          maxWidth: '36px', marginLeft: i ? '-12px' : '0', willChange: 'max-width'
        });
        it.innerHTML =
          '<span style="width:36px;height:36px;border-radius:999px;display:flex;align-items:center;justify-content:center;' +
          'background:' + p.c + ';color:var(--d-inv-text);font-size:12.5px;font-weight:600;flex:0 0 auto;' +
          'box-shadow:0 0 0 2px var(--d-panel)">' + p.n + '</span>' +
          '<span class="nm" style="margin-left:7px;padding-right:9px;font-size:12px;color:var(--d-text);white-space:nowrap;' +
          'opacity:0;transition:opacity .2s">' + p.n + ' · ' + p.r + '</span>';
        row.appendChild(it);
        return it;
      });

      var badge = U.el('div', null, '+4');
      U.css(badge, {
        maxWidth: '36px', marginLeft: '-12px', height: '36px', borderRadius: '999px', flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        background: 'var(--d-track)', color: 'var(--d-dim)', fontSize: '11.5px', fontWeight: '600',
        border: '1px solid var(--d-border)', boxSizing: 'content-box'
      });
      row.appendChild(badge);
      wrap.appendChild(row);

      var note = U.el('div', null, '4 人在协作 · 另有 4 人未显示');
      U.css(note, { fontSize: '11.5px', color: 'var(--d-dim-2)' });
      wrap.appendChild(note);
      stage.appendChild(wrap);

      var open = false;
      function apply(next) {
        open = next;
        row.setAttribute('aria-expanded', open ? 'true' : 'false');
        items.forEach(function (it, i) {
          var delay = UIK.isReduced() ? 0 : (open ? i : (items.length - 1 - i)) * 46;
          it.style.transition = UIK.isReduced() ? 'none'
            : 'max-width .42s cubic-bezier(.34,1.3,.64,1) ' + delay + 'ms,margin-left .42s cubic-bezier(.34,1.3,.64,1) ' + delay + 'ms';
          it.style.maxWidth = open ? '112px' : '36px';
          it.style.marginLeft = open ? (i ? '7px' : '0') : (i ? '-12px' : '0');
          it.querySelector('.nm').style.opacity = open ? '1' : '0';
        });
        badge.style.transition = UIK.isReduced() ? 'none' : 'max-width .3s ease,margin-left .3s ease,opacity .2s';
        badge.style.maxWidth = open ? '0px' : '36px';
        badge.style.marginLeft = open ? '0px' : '-12px';
        badge.style.opacity = open ? '0' : '1';
      }
      apply(false);

      function toggle() { apply(!open); }
      ctx.on(row, 'click', toggle);
      ctx.on(row, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
      ctx.hint('错峰延迟 46ms；收回时按相反顺序；计数徽标随展开隐藏');
    }
  });

  /* 2. Progress-fill Background */
  UIK.register('texture', {
    en: 'Progress-fill Background', zh: '进度底色',
    h: 200,
    desc: '用组件背景的填充宽度表示完成进度：每勾选一项底色平滑前推，全部完成时整个组件轻微提亮。',
    hint: '勾选条目：背景底色按真实完成比例前推，取消可后退；全部完成时组件提亮一次。',
    mount: function (stage, ctx) {
      var box = U.el('div');
      U.css(box, {
        position: 'relative', width: '100%', borderRadius: '12px', border: '1px solid var(--d-border)',
        background: 'var(--d-panel)', overflow: 'hidden', padding: '13px 14px',
        transition: UIK.isReduced() ? 'none' : 'box-shadow .3s ease'
      });

      var fill = U.el('div');
      U.css(fill, {
        position: 'absolute', left: '0', top: '0', bottom: '0', width: '0%',
        background: 'var(--d-accent)', opacity: '.17', pointerEvents: 'none',
        transition: UIK.isReduced() ? 'none' : 'width .42s cubic-bezier(.4,0,.2,1)'
      });
      box.appendChild(fill);

      var content = U.el('div');
      U.css(content, { position: 'relative', zIndex: 1 });
      var head = U.el('div');
      U.css(head, { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' });
      var title = U.el('span', null, '上线检查清单');
      U.css(title, { fontSize: '12.5px', fontWeight: '600', color: 'var(--d-text)' });
      var pct = U.el('span', null, '0 / 4');
      U.css(pct, { fontSize: '11.5px', color: 'var(--d-dim)', fontVariantNumeric: 'tabular-nums' });
      head.appendChild(title); head.appendChild(pct);

      var tasks = ['接口联通', '埋点校验', '文案复核', '灰度开关'];
      var list = U.el('div');
      U.css(list, { display: 'flex', flexDirection: 'column', gap: '7px' });
      var boxes = tasks.map(function (t) {
        var lb = U.el('label');
        U.css(lb, { display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12px', color: 'var(--d-text)', cursor: 'pointer', minHeight: '26px' });
        var cb = U.el('input');
        cb.type = 'checkbox';
        U.css(cb, { width: '16px', height: '16px', accentColor: 'var(--d-accent)', cursor: 'pointer', flex: '0 0 auto' });
        lb.appendChild(cb); lb.appendChild(U.el('span', null, t));
        list.appendChild(lb);
        return cb;
      });

      content.appendChild(head); content.appendChild(list);
      box.appendChild(content);
      stage.appendChild(box);

      function paint() {
        var done = boxes.filter(function (b) { return b.checked; }).length;
        var ratio = done / boxes.length;
        fill.style.width = (ratio * 100) + '%';
        pct.textContent = done + ' / ' + boxes.length;
        var all = done === boxes.length;
        box.style.boxShadow = all ? '0 0 0 1.5px var(--d-accent), 0 8px 22px rgba(0,0,0,.18)' : 'none';
        title.textContent = all ? '上线检查清单 · 已就绪' : '上线检查清单';
      }
      boxes.forEach(function (cb) { ctx.on(cb, 'change', paint); });
      paint();
      ctx.hint('填充层在内容之下、不拦截点击；宽度由真实完成比例推导，可前进也可后退');
    }
  });

  /* 3. Horizontal Accordion */
  UIK.register('texture', {
    en: 'Horizontal Accordion', zh: '横向手风琴',
    h: 214,
    desc: '多个面板并排竖放，默认等宽只露图标与竖排文字；点击某条横向展开变宽露出完整内容，其他条同步收窄。',
    hint: '点击任意竖条：该条横向展开变宽，其他条同步收窄；同时只有一条展开，容器高度不变。',
    mount: function (stage, ctx) {
      var row = U.el('div');
      U.css(row, { display: 'flex', gap: '8px', width: '100%', height: '186px' });

      var data = [
        { ic: '◆', t: '设计', h: '设计规范', d: '组件库与排版基线，覆盖深浅两套主题。' },
        { ic: '▲', t: '开发', h: '开发规范', d: '目录结构、构建流程与代码评审要求。' },
        { ic: '●', t: '测试', h: '测试策略', d: '单元、回归与真机兼容的覆盖清单。' },
        { ic: '■', t: '上线', h: '发布流程', d: '灰度开关、回滚预案与值班安排。' }
      ];

      var bars = data.map(function (d, i) {
        var bar = U.el('div');
        U.css(bar, {
          position: 'relative', flex: '1 1 0', minWidth: '58px', overflow: 'hidden', cursor: 'pointer',
          borderRadius: '12px', border: '1px solid var(--d-border)', background: 'var(--d-panel)',
          display: 'flex', alignItems: 'center', outline: 'none',
          transition: UIK.isReduced() ? 'none' : 'flex-grow .5s cubic-bezier(.4,0,.2,1),border-color .3s'
        });
        bar.tabIndex = 0;
        bar.setAttribute('role', 'button');
        bar.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');

        var rail = U.el('div');
        U.css(rail, {
          flex: '0 0 44px', width: '44px', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '9px'
        });
        var ic = U.el('span', null, d.ic);
        U.css(ic, { fontSize: '15px', color: 'var(--d-accent)', lineHeight: '1' });
        var vt = U.el('span', null, d.t);
        U.css(vt, { fontSize: '12.5px', color: 'var(--d-text)', letterSpacing: '.14em', writingMode: 'vertical-rl' });
        rail.appendChild(ic); rail.appendChild(vt);

        var body = U.el('div');
        U.css(body, {
          flex: '1 1 auto', minWidth: '0', paddingRight: '12px', opacity: '0',
          transition: UIK.isReduced() ? 'none' : 'opacity .3s ease .12s'
        });
        body.innerHTML = '<div style="font-size:12px;font-weight:600;color:var(--d-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + d.h +
          '</div><div style="margin-top:6px;font-size:11px;line-height:1.55;color:var(--d-dim)">' + d.d + '</div>';

        bar.appendChild(rail); bar.appendChild(body);
        row.appendChild(bar);
        return { bar: bar, body: body, i: i };
      });
      stage.appendChild(row);

      var active = 0;
      function select(k) {
        active = k;
        bars.forEach(function (b) {
          var on = b.i === k;
          b.bar.style.flexGrow = on ? '3.2' : '1';
          b.bar.style.borderColor = on ? 'var(--d-accent)' : 'var(--d-border)';
          b.body.style.opacity = on ? '1' : '0';
          b.bar.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      }
      bars.forEach(function (b) {
        ctx.on(b.bar, 'click', function () { select(b.i); });
        ctx.on(b.bar, 'keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(b.i); }
        });
      });
      select(0);
      ctx.hint('收起态等宽、展开约 3.6 倍；展开内容延迟淡入，不在窄条里被挤压');
    }
  });

  /* 4. Component Tray */
  UIK.register('texture', {
    en: 'Component Tray', zh: '组件托盘',
    h: 236,
    desc: '主组件下方垫一层深色托盘，默认只露一行小字；点击后托盘从下方抽出显示明细，主组件位置保持不动。',
    hint: '点击托盘：向下抽出显示明细，收起态那一行始终可读；主组件坐标全程不变。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      // alignSelf:stretch 抵消 .stage 的 align-items:center —— 否则托盘一变高，
      // 居中的内容会整体上移，主组件看起来像被推走了
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', alignSelf: 'stretch' });

      var main = U.el('div');
      U.css(main, {
        position: 'relative', zIndex: 2, padding: '14px', borderRadius: '12px 12px 0 0',
        border: '1px solid var(--d-border)', borderBottom: 'none', background: 'var(--d-panel)'
      });
      main.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
        '<span style="font-size:12.5px;font-weight:600;color:var(--d-text)">订单 #2049</span>' +
        '<span style="font-size:11.5px;color:var(--d-ok)">已支付</span></div>' +
        '<div style="margin-top:6px;font-size:11.5px;color:var(--d-dim)">3 件商品 · 预计明天送达</div>';

      var tray = U.el('div');
      U.css(tray, {
        position: 'relative', zIndex: 1, height: '34px', overflow: 'hidden',
        borderRadius: '0 0 12px 12px', border: '1px solid var(--d-border)', borderTop: 'none',
        background: 'var(--d-hole)',
        transition: UIK.isReduced() ? 'none' : 'height .38s cubic-bezier(.4,0,.2,1)'
      });

      var head = U.el('div');
      U.css(head, {
        height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--d-dim)'
      });
      head.innerHTML = '<span class="sum">共 12 条明细 · 点击展开</span><span class="cv" style="transition:' +
        (UIK.isReduced() ? 'none' : 'transform .3s') + '">▾</span>';

      var rows = U.el('div');
      U.css(rows, { padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '7px' });
      ['商品签收 2026-09-19 14:02', '支付完成 2026-09-19 13:57', '仓库出库 2026-09-19 09:31', '订单创建 2026-09-19 09:12'].forEach(function (r) {
        var line = U.el('div', null, r);
        U.css(line, { fontSize: '11.5px', color: 'var(--d-dim-2)', paddingLeft: '9px', borderLeft: '2px solid var(--d-border)' });
        rows.appendChild(line);
      });

      tray.appendChild(head); tray.appendChild(rows);
      wrap.appendChild(main); wrap.appendChild(tray);
      stage.appendChild(wrap);

      var open = false;
      function toggle() {
        open = !open;
        tray.style.height = open ? '168px' : '34px';
        head.querySelector('.cv').style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
        head.querySelector('.sum').textContent = open ? '共 12 条明细 · 点击收起' : '共 12 条明细 · 点击展开';
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      head.tabIndex = 0;
      head.setAttribute('role', 'button');
      head.setAttribute('aria-expanded', 'false');
      ctx.on(head, 'click', toggle);
      ctx.on(head, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
      ctx.hint('托盘向下生长，主组件 top 不变；展开高度封顶 168px，明细更多时在托盘内滚动');
    }
  });

  /* 5. Proximity-scale Icons */
  UIK.register('texture', {
    en: 'Proximity-scale Icons', zh: '跟手放大图标',
    h: 150,
    desc: '一排小图标在按住划动时按指针距离平滑缩放，相邻图标沿同一衰减曲线向外让位。',
    hint: '按住图标区并左右划动：距离指针最近的图标放大，两侧同步让位；松手全部复位。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '112px', touchAction: 'none', cursor: 'grab' });

      var glyphs = ['◧', '◨', '◆', '⬡', '▲', '●', '■'];
      var icons = glyphs.map(function (g) {
        var ic = U.el('div', null, g);
        U.css(ic, {
          width: '40px', height: '40px', flex: '0 0 auto', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--d-panel)', border: '1px solid var(--d-border)', color: 'var(--d-accent)',
          fontSize: '15px', willChange: 'transform'
        });
        wrap.appendChild(ic);
        return ic;
      });
      stage.appendChild(wrap);

      var centers = [];
      // 由布局常量推导原始中心（40 宽 + 10 间距），不用 getBoundingClientRect —— 
      // 后者会被上一次的 transform 位移污染，导致连拖时基准漂移
      function measure() {
        var total = icons.length * 40 + (icons.length - 1) * 10;
        var start = (wrap.getBoundingClientRect().width - total) / 2;
        centers = icons.map(function (_, i) { return start + i * 50 + 20; });
      }
      measure();
      ctx.on(window, 'resize', measure);

      var active = false;
      function rest() {
        icons.forEach(function (ic) {
          UIK.tx(ic, 'transform .36s cubic-bezier(.34,1.4,.64,1),border-color .25s');
          ic.style.transform = 'translateX(0) scale(1)';
          ic.style.borderColor = 'var(--d-border)';
        });
      }
      function paint(clientX) {
        var base = wrap.getBoundingClientRect();
        var x = clientX - base.left;
        var SIZE = 40, GAP = 10;

        // 1. 距离 → 缩放（smoothstep 衰减，连续无阶跃）
        var scales = icons.map(function (ic, i) {
          var d = Math.abs(x - centers[i]);
          var f = Math.max(0, 1 - d / 96);
          return 1 + 0.5 * (f * f * (3 - 2 * f));
        });

        // 2. 让位 = 按缩放后的真实宽度重新均分并居中，位移由新中心推导
        var widths = scales.map(function (s) { return SIZE * s; });
        var total = widths.reduce(function (a, b) { return a + b; }, 0) + GAP * (icons.length - 1);
        var acc = (base.width - total) / 2;
        icons.forEach(function (ic, i) {
          var target = acc + widths[i] / 2;
          acc += widths[i] + GAP;
          ic.style.transform = 'translateX(' + (target - centers[i]).toFixed(2) + 'px) scale(' + scales[i].toFixed(3) + ')';
          ic.style.borderColor = scales[i] > 1.18 ? 'var(--d-accent)' : 'var(--d-border)';
        });
      }
      ctx.clean(U.drag(wrap, {
        onStart: function (e) {
          if (UIK.isReduced()) return;
          active = true;
          icons.forEach(function (ic) { ic.style.transition = 'none'; });
          measure(); paint(e.clientX);
        },
        onMove: function (e) { if (active) paint(e.clientX); },
        onEnd: function () { active = false; rest(); }
      }));
      rest();
      ctx.hint('缩放与让位来自同一衰减曲线（线性距离 → smoothstep，半径 96px）；松手复位，静止时不循环');
    }
  });

  /* 6. Pull-down Summary */
  UIK.register('texture', {
    en: 'Pull-down Summary', zh: '下拉摘要',
    h: 226,
    desc: '顶部一行胶囊，下拉时跟手展开成完整统计面板；松手按位移与速度决定展开还是回弹收起。',
    hint: '向下拖动顶部一行：面板高度跟手；拖过 120px 或快速下甩即展开，否则回弹收起。',
    mount: function (stage, ctx) {
      var COLLAPSED = 46, EXPANDED = 196;

      var box = U.el('div');
      U.css(box, {
        position: 'relative', width: '100%', height: COLLAPSED + 'px', overflow: 'hidden',
        borderRadius: '14px', border: '1px solid var(--d-border)', background: 'var(--d-panel)'
      });

      var head = U.el('div');
      U.css(head, {
        height: COLLAPSED + 'px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', cursor: 'grab', touchAction: 'none', borderBottom: '1px solid transparent'
      });
      head.innerHTML =
        '<span style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--d-text)">' +
        '<span style="display:inline-block;width:7px;height:7px;border-radius:999px;background:var(--d-ok)"></span>本周 1,284 次</span>' +
        '<span class="cv" style="font-size:12px;color:var(--d-dim-2);transition:' + (UIK.isReduced() ? 'none' : 'transform .3s') + '">▾</span>';

      var body = U.el('div');
      U.css(body, { padding: '0 14px 14px', opacity: '0' });
      var stats = [['访问', '1,284'], ['新增', '96'], ['转化', '4.8%'], ['活跃', '312']];
      var grid = U.el('div');
      U.css(grid, { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '9px' });
      stats.forEach(function (s) {
        var c = U.el('div');
        U.css(c, { background: 'var(--d-panel-2)', border: '1px solid var(--d-border)', borderRadius: '10px', padding: '9px 11px' });
        c.innerHTML = '<div style="font-size:11px;color:var(--d-dim)">' + s[0] +
          '</div><div style="margin-top:4px;font-size:15px;font-weight:600;color:var(--d-text);font-variant-numeric:tabular-nums">' + s[1] + '</div>';
        grid.appendChild(c);
      });
      var bars = U.el('div');
      U.css(bars, { display: 'flex', alignItems: 'flex-end', gap: '6px', height: '44px', marginTop: '11px' });
      [42, 60, 34, 78, 52, 90, 66].forEach(function (h) {
        var b = U.el('div');
        U.css(b, { flex: '1 1 0', height: h + '%', background: 'var(--d-accent)', opacity: '.75', borderRadius: '3px 3px 0 0' });
        bars.appendChild(b);
      });
      body.appendChild(grid); body.appendChild(bars);

      box.appendChild(head); box.appendChild(body);
      stage.appendChild(box);

      var h = COLLAPSED, open = false, dragging = false, startY = 0, startH = 0, lastY = 0, lastT = 0, vel = 0, moved = 0;

      function paint(next, animate) {
        h = U.clamp(next, COLLAPSED, EXPANDED);
        box.style.transition = animate && !UIK.isReduced() ? 'height .34s cubic-bezier(.4,0,.2,1)' : 'none';
        box.style.height = h + 'px';
        var p = (h - COLLAPSED) / (EXPANDED - COLLAPSED);
        body.style.opacity = String(U.clamp((p - 0.35) / 0.5, 0, 1));
        head.querySelector('.cv').style.transform = p > 0.5 ? 'rotate(180deg)' : 'rotate(0)';
        head.style.borderBottomColor = p > 0.5 ? 'var(--d-border)' : 'transparent';
      }
      function settle(toOpen) {
        open = toOpen;
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        paint(open ? EXPANDED : COLLAPSED, true);
      }
      settle(false);

      ctx.clean(U.drag(head, {
        onStart: function (e) {
          if (UIK.isReduced()) return;
          dragging = true; moved = 0;
          startY = lastY = e.clientY; startH = h; lastT = performance.now(); vel = 0;
          head.style.cursor = 'grabbing';
        },
        onMove: function (e) {
          if (!dragging) return;
          var dy = e.clientY - startY;
          moved = Math.max(moved, Math.abs(dy));
          paint(startH + dy, false);
          var now = performance.now();
          vel = ((e.clientY - lastY) / Math.max(now - lastT, 8)) * 0.4 + vel * 0.6;
          lastY = e.clientY; lastT = now;
        },
        onEnd: function () {
          if (!dragging) return;
          dragging = false; head.style.cursor = 'grab';
          if (moved < 5) { settle(!open); return; }        // 视为点击
          settle(vel > 0.5 || h > 120);
        }
      }));
      ctx.on(head, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); settle(!open); }
      });
      head.tabIndex = 0;
      head.setAttribute('role', 'button');
      head.setAttribute('aria-expanded', 'false');
      ctx.hint('拖动期间高度直接映射（无过渡），仅松手后弹簧收尾；判定同时看位移与速度');
    }
  });
})();
