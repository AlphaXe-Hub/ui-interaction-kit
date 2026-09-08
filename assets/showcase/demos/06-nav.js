/* 06 导航组件 · Navigation (7) */
(function () {
  var U = UIK.util;

  /* 1. Tabs */
  UIK.register('nav', {
    en: 'Tabs', zh: '标签页',
    desc: '在同一页面内切换多组并列内容；选中态用下划线或背景指示，面板随之切换。',
    hint: '点击或使用左右方向键切换；aria-selected 与面板保持同步。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      var bar = U.el('div'); U.css(bar, { display: 'flex', gap: '4px', borderBottom: '1px solid var(--d-border)' });
      bar.setAttribute('role', 'tablist');
      var tabs = ['基本信息', '跟进记录 (12)', '附件 (3)'].map(function (t, i) {
        var b = U.el('button'); b.type = 'button';
        U.css(b, {
          background: 'transparent', border: 'none', color: 'var(--d-dim)', padding: '8px 12px', fontSize: '12.5px',
          cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: '-1px'
        });
        b.textContent = t; b.setAttribute('role', 'tab');
        bar.appendChild(b); return b;
      });
      var panel = U.el('div'); U.css(panel, { padding: '14px 4px', fontSize: '12px', color: 'var(--d-dim)', minHeight: '74px' });
      box.appendChild(bar); box.appendChild(panel); stage.appendChild(box);
      var contents = ['客户名称、所属行业、联系人与地址等基础字段。', '最近一次跟进：方案已发送，等待客户内部评审。', '报价单.pdf、需求确认函.docx、现场照片.zip'];
      var cur = 0;
      function go(i) {
        cur = i;
        tabs.forEach(function (b, k) {
          b.style.color = k === i ? 'var(--d-text)' : 'var(--d-dim)';
          b.style.borderBottomColor = k === i ? 'var(--d-accent)' : 'transparent';
          b.setAttribute('aria-selected', k === i ? 'true' : 'false');
        });
        panel.textContent = contents[i];
        panel.setAttribute('role', 'tabpanel');
      }
      tabs.forEach(function (b, i) {
        ctx.on(b, 'click', function () { go(i); });
        ctx.on(b, 'keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
          if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
          if (n != null) { go(n); tabs[n].focus(); }
        });
      });
      go(0);
      ctx.hint('同页切换，不跳转路由');
    }
  });

  /* 2. Segment Control */
  UIK.register('nav', {
    en: 'Segment Control', zh: '分段控件',
    desc: '在两三个视图之间紧凑切换，滑块背景跟随选中项，文字与命中区域稳定。',
    hint: '选项超过 4 个时应改用 Tabs 或下拉。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' });
      var seg = U.el('div'); U.css(seg, { position: 'relative', display: 'flex', background: 'var(--d-chip)', border: '1px solid var(--d-border)', borderRadius: '10px', padding: '3px' });
      var slider = U.el('div'); U.css(slider, {
        position: 'absolute', top: '3px', bottom: '3px', left: '3px', width: '0',
        background: 'var(--d-track)', borderRadius: '8px', transition: UIK.isReduced() ? 'none' : 'left .3s cubic-bezier(.4,0,.2,1),width .3s cubic-bezier(.4,0,.2,1)'
      });
      seg.appendChild(slider);
      var btns = ['日', '周', '月'].map(function (t, i) {
        var b = U.el('button'); b.type = 'button';
        U.css(b, { position: 'relative', zIndex: 1, background: 'transparent', border: 'none', color: 'var(--d-dim)', padding: '7px 18px', fontSize: '12.5px', cursor: 'pointer', minHeight: '34px' });
        b.textContent = t; seg.appendChild(b); return b;
      });
      var view = U.el('div'); U.css(view, { fontSize: '12px', color: 'var(--d-dim)' });
      box.appendChild(seg); box.appendChild(view); stage.appendChild(box);
      var texts = ['今日新增 12 条', '本周新增 68 条', '本月新增 302 条'];
      btns.forEach(function (b, i) {
        ctx.on(b, 'click', function () {
          btns.forEach(function (o, k) { o.style.color = k === i ? 'var(--d-text)' : 'var(--d-dim)'; });
          slider.style.left = b.offsetLeft + 'px';
          slider.style.width = b.offsetWidth + 'px';
          view.textContent = texts[i];
        });
      });
      setTimeout(function () { btns[0].click(); }, 30);
      ctx.hint('滑块按真实按钮位置与宽度计算');
    }
  });

  /* 3. Breadcrumb */
  UIK.register('nav', {
    en: 'Breadcrumb', zh: '面包屑',
    desc: '显示当前位置在层级中的路径并支持返回上级；末项为当前页不可点击。',
    hint: '点击中间层级返回；层级过深时中间折叠为省略号。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      var path = ['首页', '客户管理', '客户详情'];
      var nav = U.el('nav'); U.css(nav, { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', fontSize: '12.5px' });
      nav.setAttribute('aria-label', '面包屑');
      function render() {
        nav.innerHTML = '';
        path.forEach(function (p, i) {
          if (i > 0) { var s = U.el('span'); s.textContent = '/'; U.css(s, { color: 'var(--d-border)' }); nav.appendChild(s); }
          if (i === path.length - 1) {
            var cur = U.el('span'); cur.textContent = p; U.css(cur, { color: 'var(--d-text)' });
            cur.setAttribute('aria-current', 'page'); nav.appendChild(cur);
          } else {
            var a = U.el('a', null, p); U.css(a, { color: 'var(--d-accent)', cursor: 'pointer', textDecoration: 'none' });
            ctx.on(a, 'click', function () { path = path.slice(0, i + 1); render(); });
            nav.appendChild(a);
          }
        });
      }
      render();
      var deep = U.el('button', 'd-btn', '模拟进入下一层'); deep.type = 'button';
      U.css(deep, { marginTop: '12px' });
      ctx.on(deep, 'click', function () { var n = ['跟进记录', '项目列表', '商机看板', '报表中心']; path.push(n[path.length % n.length]); render(); });
      box.appendChild(nav); box.appendChild(deep); stage.appendChild(box);
      ctx.hint('末项不可点击，中间层可回溯');
    }
  });

  /* 4. Pagination */
  UIK.register('nav', {
    en: 'Pagination', zh: '分页',
    desc: '内容过多无法单页显示时用页码前后翻页，含首页/末页、省略与禁用态。',
    hint: '点击页码切换；首尾页时上一页/下一页禁用。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' });
      var info = U.el('div', 'd-val', ''); box.appendChild(info);
      var row = U.el('div', 'd-row'); U.css(row, { justifyContent: 'center' }); box.appendChild(row);
      stage.appendChild(box);
      var total = 8, cur = 1;
      function render() {
        row.innerHTML = '';
        function btn(label, page, disabled, active) {
          var b = U.el('button'); b.type = 'button';
          U.css(b, {
            minWidth: '30px', height: '30px', padding: '0 7px', fontSize: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
            background: active ? 'var(--d-accent)' : 'var(--d-panel-2)', color: active ? 'var(--d-panel)' : (disabled ? 'var(--d-dim-2)' : 'var(--d-text)'),
            border: '1px solid ' + (active ? 'var(--d-accent)' : 'var(--d-border)'), borderRadius: '8px', opacity: disabled ? .55 : 1
          });
          b.textContent = label; b.disabled = !!disabled;
          row.appendChild(b);
          return b;
        }
        var prev = btn('‹', cur - 1, cur === 1);
        ctx.on(prev, 'click', function () { if (cur > 1) { cur--; render(); } });
        for (var i = 1; i <= total; i++) {
          if (i > 2 && i < cur - 1) { btn('…', null, true); i = cur - 2; continue; }
          if (i < total - 1 && i > cur + 1) { btn('…', null, true); i = total - 1; continue; }
          (function (p) { var b = btn(String(p), p, false, p === cur); ctx.on(b, 'click', function () { cur = p; render(); }); })(i);
        }
        var next = btn('›', cur + 1, cur === total);
        ctx.on(next, 'click', function () { if (cur < total) { cur++; render(); } });
        info.textContent = '第 ' + cur + ' / ' + total + ' 页 · 共 ' + (total * 10) + ' 条';
      }
      render();
      ctx.hint('页码省略、禁用态清晰，键盘可达');
    }
  });

  /* 5. Stepper */
  UIK.register('nav', {
    en: 'Stepper', zh: '步骤条',
    desc: '把流程拆成多个步骤展示进度；完成、当前、未开始状态清晰区分。',
    hint: '点击「下一步」推进，可点击已完成步骤回看。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      var line = U.el('div'); U.css(line, { position: 'relative', display: 'flex', justifyContent: 'space-between' });
      var track = U.el('div'); U.css(track, { position: 'absolute', left: '6%', right: '6%', top: '11px', height: '2px', background: 'var(--d-border)' });
      var fill = U.el('div'); U.css(fill, { position: 'absolute', left: '0', top: '0', height: '100%', width: '0', background: 'var(--d-accent)', transition: UIK.isReduced() ? 'none' : 'width .35s cubic-bezier(.4,0,.2,1)' });
      track.appendChild(fill); line.appendChild(track);
      var steps = ['提交申请', '部门审批', '财务复核', '完成'].map(function (t, i) {
        var s = U.el('div'); U.css(s, { position: 'relative', textAlign: 'center', flex: '1', fontSize: '11px', color: 'var(--d-dim-2)', zIndex: 1 });
        var c = U.el('div'); U.css(c, {
          width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 6px', background: 'var(--d-panel)',
          border: '1.5px solid var(--d-border)', color: 'var(--d-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', transition: UIK.isReduced() ? 'none' : 'background .25s,border-color .25s,color .25s,transform .3s'
        });
        c.textContent = i + 1;
        s.appendChild(c); s.appendChild(U.el('div', null, t));
        s.style.cursor = 'pointer';
        line.appendChild(s);
        return { node: s, c: c };
      });
      box.appendChild(line);
      var bar = U.el('div', 'd-row'); U.css(bar, { marginTop: '14px' });
      var next = U.el('button', 'd-btn primary', '下一步'); next.type = 'button';
      var info = U.el('span', 'd-val', '步骤 1 / 4');
      bar.appendChild(next); bar.appendChild(info); box.appendChild(bar); stage.appendChild(box);
      var cur = 0;
      function sync() {
        steps.forEach(function (s, i) {
          var done = i < cur, active = i === cur;
          s.c.style.background = done ? 'var(--d-ok)' : (active ? 'var(--d-accent)' : 'var(--d-panel)');
          s.c.style.borderColor = done ? 'var(--d-ok)' : (active ? 'var(--d-accent)' : 'var(--d-border)');
          s.c.style.color = (done || active) ? 'var(--d-panel)' : 'var(--d-dim)';
          s.c.textContent = done ? '✓' : (i + 1);
          s.c.style.transform = active ? 'scale(1.15)' : 'scale(1)';
          s.node.style.color = active ? 'var(--d-text)' : 'var(--d-dim-2)';
        });
        fill.style.width = (cur / 3 * 88) + '%';
        info.textContent = '步骤 ' + (cur + 1) + ' / 4';
      }
      ctx.on(next, 'click', function () { if (cur < 3) { cur++; sync(); } });
      steps.forEach(function (s, i) { ctx.on(s.node, 'click', function () { if (i <= cur) { cur = i; sync(); } }); });
      sync();
      ctx.hint('允许回看已完成的步骤');
    }
  });

  /* 6. Sidebar Navigation */
  UIK.register('nav', {
    en: 'Sidebar', zh: '侧边导航',
    desc: '主要功能入口固定在左侧并持续高亮当前页面，适合栏目较多的后台系统。',
    hint: '点击菜单项切换高亮；可折叠为图标栏。',
    mount: function (stage, ctx) {
      var wrap = U.el('div'); U.css(wrap, { display: 'flex', width: '100%', height: '176px', gap: '10px' });
      var sb = U.el('nav'); U.css(sb, {
        width: '148px', flex: '0 0 auto', background: 'var(--d-panel-2)', border: '1px solid var(--d-border)', borderRadius: '12px',
        padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden'
      });
      UIK.tx(sb, 'width .35s cubic-bezier(.4,0,.2,1)');
      var items = [['◎', '工作台'], ['▤', '客户管理'], ['◈', '商机管理'], ['▣', '项目管理'], ['▦', '知识库'], ['⚙', '系统设置']].map(function (p, i) {
        var a = U.el('button'); a.type = 'button';
        U.css(a, {
          display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', background: 'transparent', border: 'none',
          color: 'var(--d-dim)', fontSize: '12.5px', cursor: 'pointer', borderRadius: '9px', whiteSpace: 'nowrap', textAlign: 'left'
        });
        var ic = U.el('span', null, p[0]); U.css(ic, { width: '16px', flex: '0 0 16px', textAlign: 'center' });
        var tx = U.el('span', null, p[1]); U.css(tx, { transition: UIK.isReduced() ? 'none' : 'opacity .2s' });
        a.appendChild(ic); a.appendChild(tx); sb.appendChild(a);
        return { a: a, tx: tx };
      });
      var main = U.el('div'); U.css(main, {
        flex: '1', background: 'var(--d-hole)', border: '1px solid var(--d-track)', borderRadius: '12px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--d-dim)', fontSize: '12px'
      });
      main.textContent = '内容区：客户管理';
      wrap.appendChild(sb); wrap.appendChild(main); stage.appendChild(wrap);
      var btn = U.el('button', 'd-btn', '折叠为图标栏'); btn.type = 'button'; U.css(btn, { marginTop: '8px' }); stage.appendChild(btn);
      var cur = 1, collapsed = false;
      function sync() {
        items.forEach(function (it, i) {
          var on = i === cur;
          it.a.style.background = on ? 'var(--d-track)' : 'transparent';
          it.a.style.color = on ? 'var(--d-accent)' : 'var(--d-dim)';
          it.a.setAttribute('aria-current', on ? 'page' : 'false');
        });
      }
      items.forEach(function (it, i) {
        ctx.on(it.a, 'click', function () { cur = i; sync(); main.textContent = '内容区：' + it.tx.textContent; });
      });
      ctx.on(btn, 'click', function () {
        collapsed = !collapsed;
        sb.style.width = collapsed ? '48px' : '148px';
        items.forEach(function (it) { it.tx.style.opacity = collapsed ? '0' : '1'; });
        btn.textContent = collapsed ? '展开完整菜单' : '折叠为图标栏';
      });
      sync();
      ctx.hint('当前项持续高亮，滚动位置保持');
    }
  });

  /* 7. Bottom Navigation */
  UIK.register('nav', {
    en: 'Bottom Navigation', zh: '底部导航',
    desc: '3–5 个最常用入口固定在底部，方便单手操作；选中项图标与文字同时变化。',
    hint: '点击切换主页面，带徽标的项数字不遮挡图标。',
    mount: function (stage, ctx) {
      var phone = U.el('div'); U.css(phone, {
        width: '196px', height: '188px', borderRadius: '18px', border: '1px solid var(--d-border)', background: 'var(--d-hole)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      });
      var body = U.el('div'); U.css(body, {
        flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--d-dim)', fontSize: '12px'
      });
      body.textContent = '首页';
      var bar = U.el('nav'); U.css(bar, {
        display: 'flex', borderTop: '1px solid var(--d-track)', background: 'var(--d-panel-2)', padding: '6px 0 8px'
      });
      var items = [['◎', '首页', 0], ['▤', '客户', 0], ['◈', '商机', 3], ['☺', '我的', 0]].map(function (p, i) {
        var b = U.el('button'); b.type = 'button';
        U.css(b, {
          flex: '1', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '3px', color: 'var(--d-dim-2)', fontSize: '10.5px', cursor: 'pointer', position: 'relative', padding: '4px 0', minHeight: '44px'
        });
        var ic = U.el('span', null, p[0]); U.css(ic, { fontSize: '15px', transition: UIK.isReduced() ? 'none' : 'transform .25s' });
        var tx = U.el('span', null, p[1]);
        b.appendChild(ic); b.appendChild(tx);
        if (p[2]) {
          var badge = U.el('span'); U.css(badge, {
            position: 'absolute', top: '0', left: '50%', marginLeft: '4px', minWidth: '15px', height: '15px',
            borderRadius: '8px', background: 'var(--d-danger)', color: '#fff', fontSize: '9.5px', lineHeight: '15px', textAlign: 'center', padding: '0 4px'
          });
          badge.textContent = p[2]; b.appendChild(badge);
        }
        bar.appendChild(b);
        return { b: b, ic: ic, name: p[1] };
      });
      phone.appendChild(body); phone.appendChild(bar); stage.appendChild(phone);
      items.forEach(function (it, i) {
        ctx.on(it.b, 'click', function () {
          items.forEach(function (o, k) {
            o.b.style.color = k === i ? 'var(--d-accent)' : 'var(--d-dim-2)';
            o.ic.style.transform = k === i ? 'translateY(-2px) scale(1.12)' : 'none';
            o.b.setAttribute('aria-current', k === i ? 'page' : 'false');
          });
          body.textContent = it.name;
        });
      });
      items[0].b.style.color = 'var(--d-accent)';
      ctx.hint('3–5 项，徽标不遮挡图标，命中区 ≥44px');
    }
  });
})();
