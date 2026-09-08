/* 05 折叠组件 · Collapse Components (8) */
(function () {
  var U = UIK.util;
  function panelHeight(el, open) {
    el.style.height = open ? el.scrollHeight + 'px' : '0px';
  }

  /* 1. Accordion */
  UIK.register('collapse', {
    en: 'Accordion', zh: '手风琴',
    desc: '一组可折叠内容，点击一项就地展开，再点收起；同一时刻通常只开一项。',
    hint: '互斥展开：打开一项会自动收起其他项。',
    h: 250,
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      var groups = [
        ['账号与安全', '包含登录密码、两步验证与设备管理，修改后会立即生效。'],
        ['通知设置', '分别控制站内消息、邮件与短信的推送范围与频率。'],
        ['数据权限', '决定当前账号可查看的业务范围与字段级别。']
      ].map(function (g) {
        var item = U.el('div'); U.css(item, { border: '1px solid #2b3348', borderRadius: '10px', marginBottom: '7px', overflow: 'hidden', background: '#161a24' });
        var h = U.el('button'); h.type = 'button';
        U.css(h, {
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent',
          border: 'none', color: '#e6e9f2', padding: '10px 12px', fontSize: '12.5px', cursor: 'pointer'
        });
        h.innerHTML = '<span>' + g[0] + '</span><span class="cv" style="color:#98a1b8;transition:' + (UIK.isReduced() ? 'none' : 'transform .3s') + '">▾</span>';
        var p = U.el('div'); U.css(p, { height: '0', overflow: 'hidden', transition: UIK.isReduced() ? 'none' : 'height .32s cubic-bezier(.4,0,.2,1)' });
        var inner = U.el('div'); U.css(inner, { padding: '0 12px 12px', color: '#98a1b8', fontSize: '11.5px' });
        inner.textContent = g[1];
        p.appendChild(inner); item.appendChild(h); item.appendChild(p); box.appendChild(item);
        return { item: item, h: h, p: p, cv: h.querySelector('.cv'), open: false };
      });
      stage.appendChild(box);
      groups.forEach(function (g) {
        ctx.on(g.h, 'click', function () {
          var willOpen = !g.open;
          groups.forEach(function (o) {
            o.open = false; panelHeight(o.p, false);
            o.item.style.borderColor = '#2b3348';
            o.cv.style.transform = 'rotate(0)';
            o.h.setAttribute('aria-expanded', 'false');
          });
          g.open = willOpen;
          panelHeight(g.p, willOpen);
          g.item.style.borderColor = willOpen ? '#6ea8fe' : '#2b3348';
          g.cv.style.transform = willOpen ? 'rotate(180deg)' : 'rotate(0)';
          g.h.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });
      });
      ctx.hint('与 Collapse 的区别是互斥：同时只开一项');
    }
  });

  /* 2. Collapse */
  UIK.register('collapse', {
    en: 'Collapse', zh: '独立折叠区块',
    desc: '一整块内容单独控制展开与收起，与其他区块互不影响。',
    hint: '两个区块各自独立，可同时展开。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      [['订单信息', '订单编号、创建时间、关联客户与负责人。'], ['付款计划', '分三期回款，首期 30%，验收后付清尾款。']].forEach(function (g) {
        var item = U.el('div'); U.css(item, { border: '1px solid #2b3348', borderRadius: '10px', marginBottom: '8px', background: '#161a24', overflow: 'hidden' });
        var h = U.el('button'); h.type = 'button';
        U.css(h, { width: '100%', display: 'flex', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#e6e9f2', padding: '10px 12px', fontSize: '12.5px', cursor: 'pointer' });
        h.innerHTML = '<span>' + g[0] + '</span><span class="cv" style="color:#98a1b8;transition:' + (UIK.isReduced() ? 'none' : 'transform .3s') + '">▾</span>';
        var p = U.el('div'); U.css(p, { height: '0', overflow: 'hidden', transition: UIK.isReduced() ? 'none' : 'height .32s cubic-bezier(.4,0,.2,1)' });
        var inner = U.el('div'); U.css(inner, { padding: '0 12px 12px', color: '#98a1b8', fontSize: '11.5px' });
        inner.textContent = g[1];
        p.appendChild(inner); item.appendChild(h); item.appendChild(p); box.appendChild(item);
        var open = false;
        ctx.on(h, 'click', function () {
          open = !open; panelHeight(p, open);
          h.querySelector('.cv').style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
          h.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      });
      stage.appendChild(box);
      ctx.hint('非互斥：每项状态独立');
    }
  });

  /* 3. Dropdown */
  UIK.register('collapse', {
    en: 'Dropdown', zh: '下拉展开',
    desc: '点击按钮在下方展开选项列表，完成选择后自动收起。',
    hint: '选中即收起；点击外部或 Esc 也关闭，焦点回到按钮。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { position: 'relative', width: '200px' });
      var btn = U.el('button', 'd-btn', '排序方式：默认 ▾'); btn.type = 'button';
      var menu = U.el('div'); U.css(menu, {
        position: 'absolute', top: '38px', left: '0', right: '0', background: '#1c2130', border: '1px solid #2b3348',
        borderRadius: '10px', overflow: 'hidden', opacity: '0', transform: 'translateY(-6px)', pointerEvents: 'none', zIndex: 6
      });
      UIK.tx(menu, 'opacity .18s,transform .18s');
      ['默认', '创建时间', '金额从高到低', '临近截止'].forEach(function (t) {
        var o = U.el('button'); o.type = 'button';
        U.css(o, { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#e6e9f2', padding: '9px 12px', fontSize: '12px', cursor: 'pointer' });
        o.textContent = t;
        o.addEventListener('mouseenter', function () { o.style.background = '#232b3d'; });
        o.addEventListener('mouseleave', function () { o.style.background = 'transparent'; });
        ctx.on(o, 'click', function () { btn.textContent = '排序方式：' + t + ' ▾'; close(); btn.focus(); });
        menu.appendChild(o);
      });
      box.appendChild(btn); box.appendChild(menu); stage.appendChild(box);
      var open = false;
      function open_() { open = true; menu.style.opacity = '1'; menu.style.transform = 'translateY(0)'; menu.style.pointerEvents = 'auto'; btn.setAttribute('aria-expanded', 'true'); }
      function close() { open = false; menu.style.opacity = '0'; menu.style.transform = 'translateY(-6px)'; menu.style.pointerEvents = 'none'; btn.setAttribute('aria-expanded', 'false'); }
      ctx.on(btn, 'click', function (e) { e.stopPropagation(); open ? close() : open_(); });
      ctx.on(document, 'click', function (e) { if (open && !box.contains(e.target)) close(); });
      ctx.on(document, 'keydown', function (e) { if (open && e.key === 'Escape') close(); });
      ctx.hint('选择后自动收起，focus 回到触发器');
    }
  });

  /* 4. Treeview */
  UIK.register('collapse', {
    en: 'Treeview', zh: '树形展开',
    desc: '展示层级关系：点击父节点展开子项，可继续深入。',
    hint: '点击有子节点的项展开/收起，箭头表示层级状态。',
    h: 240,
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%', fontSize: '12.5px' });
      var data = [
        { t: '客户管理', c: [{ t: '客户列表' }, { t: '跟进记录', c: [{ t: '本周跟进' }, { t: '历史跟进' }] }] },
        { t: '商机管理', c: [{ t: '商机看板' }, { t: '阶段历史' }] },
        { t: '报表中心' }
      ];
      function build(items, depth, host) {
        items.forEach(function (item) {
          var row = U.el('div'); U.css(row, {
            display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 6px', borderRadius: '7px',
            cursor: item.c ? 'pointer' : 'default', color: item.c ? '#e6e9f2' : '#98a1b8', paddingLeft: (6 + depth * 15) + 'px'
          });
          var cv = U.el('span', null, item.c ? '▸' : '·');
          U.css(cv, { color: '#6f7994', display: 'inline-block', transition: UIK.isReduced() ? 'none' : 'transform .25s', width: '10px' });
          row.appendChild(cv); row.appendChild(U.el('span', null, item.t));
          host.appendChild(row);
          if (!item.c) return;
          var wrap = U.el('div'); U.css(wrap, { height: '0', overflow: 'hidden', transition: UIK.isReduced() ? 'none' : 'height .28s cubic-bezier(.4,0,.2,1)' });
          host.appendChild(wrap);
          build(item.c, depth + 1, wrap);
          var open = false;
          ctx.on(row, 'click', function () {
            open = !open;
            wrap.style.height = open ? wrap.scrollHeight + 'px' : '0px';
            cv.style.transform = open ? 'rotate(90deg)' : 'rotate(0)';
            row.setAttribute('aria-expanded', open ? 'true' : 'false');
          });
        });
      }
      build(data, 0, box);
      stage.appendChild(box);
      ctx.hint('层级深度用缩进与箭头表达，可继续下钻');
    }
  });

  /* 5. Expandable Card */
  UIK.register('collapse', {
    en: 'Expandable Card', zh: '可展开卡片',
    desc: '卡片默认显示标题与摘要，点击后在原位展开完整内容。',
    hint: '点击卡片就地展开，不跳转到新页面。',
    mount: function (stage, ctx) {
      var card = U.el('div'); U.css(card, {
        width: '100%', background: '#161a24', border: '1px solid #2b3348', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer'
      });
      var head = U.el('div'); U.css(head, { padding: '12px 14px' });
      head.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;font-weight:600">商机 #2041</span><span style="font-size:11px;color:#6ea8fe">展开 ▾</span></div>' +
        '<div style="font-size:11.5px;color:#98a1b8;margin-top:4px">摘要：市政管网改造 · 预计 320 万 · 当前阶段 L4</div>';
      var body = U.el('div'); U.css(body, { height: '0', overflow: 'hidden', transition: UIK.isReduced() ? 'none' : 'height .34s cubic-bezier(.4,0,.2,1)' });
      var inner = U.el('div'); U.css(inner, { padding: '0 14px 14px', fontSize: '11.5px', color: '#98a1b8' });
      inner.innerHTML = '负责人：张三 · 创建时间：2026-08-12<br>最新跟进：已完成方案评审，等待预算批复。<br>下一步：9 月 10 日前提交报价单。';
      body.appendChild(inner); card.appendChild(head); card.appendChild(body); stage.appendChild(card);
      var open = false;
      ctx.on(card, 'click', function () {
        open = !open; panelHeight(body, open);
        head.querySelector('span:last-child').textContent = open ? '收起 ▴' : '展开 ▾';
      });
      ctx.hint('就地展开，保持列表上下文');
    }
  });

  /* 6. Sidebar */
  UIK.register('collapse', {
    en: 'Sidebar', zh: '侧边栏展开',
    desc: '从窄图标栏展开为完整菜单，适合入口较多又想节省空间的桌面端界面。',
    hint: '点击顶部按钮切换窄栏 / 完整菜单，文字淡入淡出。',
    mount: function (stage, ctx) {
      var wrap = U.el('div'); U.css(wrap, { display: 'flex', width: '100%', height: '176px', gap: '10px' });
      var sb = U.el('div'); U.css(sb, {
        width: '56px', background: '#161a24', border: '1px solid #2b3348', borderRadius: '12px', padding: '10px 0',
        display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden', flex: '0 0 auto'
      });
      UIK.tx(sb, 'width .38s cubic-bezier(.4,0,.2,1)');
      var items = [];
      [['◎', '工作台'], ['▤', '客户'], ['◈', '商机'], ['▣', '项目'], ['⚙', '设置']].forEach(function (p, i) {
        var r = U.el('div'); U.css(r, { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', cursor: 'pointer', color: i === 0 ? '#6ea8fe' : '#98a1b8', whiteSpace: 'nowrap' });
        var ic = U.el('span', null, p[0]); U.css(ic, { width: '16px', textAlign: 'center', flex: '0 0 16px' });
        var tx = U.el('span', null, p[1]); U.css(tx, { fontSize: '12px', opacity: '0', transition: UIK.isReduced() ? 'none' : 'opacity .25s' });
        r.appendChild(ic); r.appendChild(tx); sb.appendChild(r); items.push(tx);
      });
      var main = U.el('div'); U.css(main, {
        flex: '1', background: '#10141d', border: '1px solid #232b3a', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f7994', fontSize: '11.5px'
      });
      main.textContent = '内容区';
      wrap.appendChild(sb); wrap.appendChild(main); stage.appendChild(wrap);
      var toggle = U.el('button', 'd-btn', '展开 / 收起'); toggle.type = 'button';
      U.css(toggle, { marginTop: '8px' });
      stage.appendChild(toggle);
      var open = false;
      ctx.on(toggle, 'click', function () {
        open = !open;
        sb.style.width = open ? '160px' : '56px';
        items.forEach(function (t) { t.style.opacity = open ? '1' : '0'; });
      });
      ctx.hint('宽度 56 → 160，图标位置不动，文字淡入');
    }
  });

  /* 7. Radio Menu */
  UIK.register('collapse', {
    en: 'Radio Menu', zh: '环形菜单展开',
    desc: '点击中心按钮，周围少量快捷操作向四周展开，适合放置少量入口。',
    hint: '点击中心按钮展开四个快捷操作，再点收起。',
    mount: function (stage, ctx) {
      var host = U.el('div'); U.css(host, { position: 'relative', width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
      var hub = U.el('button'); hub.type = 'button';
      U.css(hub, {
        width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 3,
        background: 'linear-gradient(135deg,#6ea8fe,#a78bfa)', color: '#0b0d12', fontSize: '18px', fontWeight: '700'
      });
      hub.textContent = '+';
      host.appendChild(hub);
      var items = ['新建', '导入', '扫描', '分享'].map(function (t, i) {
        var b = U.el('button'); b.type = 'button';
        U.css(b, {
          position: 'absolute', width: '46px', height: '46px', borderRadius: '50%', border: '1px solid #3a4255',
          background: '#1c2130', color: '#e6e9f2', fontSize: '11px', cursor: 'pointer', left: '50%', top: '50%',
          marginLeft: '-23px', marginTop: '-23px', transition: UIK.isReduced() ? 'none' : 'transform .42s cubic-bezier(.34,1.4,.64,1),opacity .3s',
          transform: 'translate(0,0) scale(.4)', opacity: '0'
        });
        b.textContent = t; host.appendChild(b); return b;
      });
      stage.appendChild(host);
      var open = false;
      function layout() {
        items.forEach(function (b, i) {
          var a = (-90 + i * 72) * Math.PI / 180, R = 62;
          b.style.transform = open
            ? 'translate(' + (Math.cos(a) * R) + 'px,' + (Math.sin(a) * R) + 'px) scale(1)'
            : 'translate(0,0) scale(.4)';
          b.style.opacity = open ? '1' : '0';
        });
        hub.style.transform = open ? 'rotate(45deg)' : 'rotate(0)';
      }
      UIK.tx(hub, 'transform .35s cubic-bezier(.34,1.4,.64,1)');
      ctx.on(hub, 'click', function () { open = !open; layout(); });
      ctx.hint('半径 62px，72° 均分；适合少量入口');
    }
  });

  /* 8. Container Transform */
  UIK.register('collapse', {
    en: 'Container Transform', zh: '容器变形展开',
    desc: '小卡片或缩略图逐渐放大过渡到完整详情视图，保持主体连续。',
    hint: '点击卡片放大为详情视图，关闭时缩回原卡片。',
    mount: function (stage, ctx) {
      var host = U.el('div'); U.css(host, { position: 'relative', width: '100%', height: '190px' });
      var card = U.el('div', 'grab'); U.css(card, {
        width: '120px', height: '80px', borderRadius: '12px', background: 'linear-gradient(135deg,#34d399,#6ea8fe)',
        cursor: 'pointer', display: 'flex', alignItems: 'flex-end', padding: '8px', color: '#0b0d12', fontSize: '11.5px', fontWeight: '600'
      });
      card.textContent = '项目概览';
      U.css(card, { position: 'absolute', left: '12px', top: '16px' });
      host.appendChild(card);
      var detail = U.el('div'); U.css(detail, {
        position: 'absolute', left: '12px', top: '16px', width: '120px', height: '80px', borderRadius: '12px',
        background: '#1c2130', border: '1px solid #2b3348', overflow: 'hidden', opacity: '0', pointerEvents: 'none', zIndex: 5
      });
      UIK.tx(detail, 'left .44s cubic-bezier(.3,1,.4,1),top .44s cubic-bezier(.3,1,.4,1),width .44s cubic-bezier(.3,1,.4,1),height .44s cubic-bezier(.3,1,.4,1),opacity .3s,border-radius .44s');
      var hd = U.el('div'); U.css(hd, { height: '46px', background: 'linear-gradient(135deg,#34d399,#6ea8fe)' });
      var bd = U.el('div'); U.css(bd, { padding: '10px 12px', fontSize: '11.5px', color: '#98a1b8', opacity: '0', transition: UIK.isReduced() ? 'none' : 'opacity .3s .16s' });
      bd.innerHTML = '<div style="color:#e6e9f2;font-size:13px;font-weight:600;margin-bottom:4px">项目详情</div>容器从小卡片连续放大到详情视图，主体不跳变。';
      detail.appendChild(hd); detail.appendChild(bd); host.appendChild(detail);
      host.appendChild(card); stage.appendChild(host);
      var open = false;
      function toggle() {
        open = !open;
        if (open) {
          detail.style.left = '0px'; detail.style.top = '0px';
          detail.style.width = '100%'; detail.style.height = '100%';
          detail.style.opacity = '1'; detail.style.pointerEvents = 'auto'; detail.style.borderRadius = '14px';
          bd.style.opacity = '1'; card.style.opacity = '0';
        } else {
          detail.style.left = '12px'; detail.style.top = '16px';
          detail.style.width = '120px'; detail.style.height = '80px';
          detail.style.opacity = '0'; detail.style.pointerEvents = 'none'; detail.style.borderRadius = '12px';
          bd.style.opacity = '0'; card.style.opacity = '1';
        }
      }
      ctx.on(card, 'click', toggle);
      ctx.on(detail, 'click', toggle);
      ctx.hint('源与目标必须一一对应，避免飞向过期坐标');
    }
  });
})();
