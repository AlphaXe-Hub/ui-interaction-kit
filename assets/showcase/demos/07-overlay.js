/* 07 弹窗组件 · Overlays (7) */
(function () {
  var U = UIK.util;
  function host(stage) { var h = U.el('div'); U.css(h, { position: 'relative', width: '100%', height: '182px', display: 'flex', alignItems: 'center', justifyContent: 'center' }); stage.appendChild(h); return h; }
  function overlay(parent) {
    var o = U.el('div'); U.css(o, { position: 'absolute', inset: '0', background: 'rgba(6,8,12,.6)', opacity: '0', pointerEvents: 'none', zIndex: 8 });
    UIK.tx(o, 'opacity .25s');
    parent.appendChild(o); return o;
  }

  /* 1. Tooltip */
  UIK.register('overlay', {
    en: 'Tooltip', zh: '文字提示',
    desc: '悬停或键盘聚焦时为图标、按钮提供简短说明；内容极少，不放复杂操作，触摸设备用点击替代。',
    hint: '悬停或 Tab 聚焦按钮；触摸设备改为点击切换显示。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn', '导出报表'); btn.type = 'button';
      var tip = U.el('div'); U.css(tip, {
        position: 'absolute', bottom: 'calc(50% + 26px)', left: '50%', transform: 'translateX(-50%) translateY(4px)',
        background: '#0b0d12', border: '1px solid #3a4255', color: '#e6e9f2', fontSize: '11.5px', padding: '5px 9px',
        borderRadius: '7px', whiteSpace: 'nowrap', opacity: '0', pointerEvents: 'none', zIndex: 9,
        boxShadow: '0 6px 16px rgba(0,0,0,.5)'
      });
      UIK.tx(tip, 'opacity .16s,transform .16s');
      tip.textContent = '导出当前筛选结果为 Excel';
      var arrow = U.el('div'); U.css(arrow, { position: 'absolute', bottom: '-4px', left: '50%', marginLeft: '-4px', width: '8px', height: '8px', background: '#0b0d12', borderRight: '1px solid #3a4255', borderBottom: '1px solid #3a4255', transform: 'rotate(45deg)' });
      tip.appendChild(arrow);
      h.appendChild(btn); h.appendChild(tip);
      function show(on) { tip.style.opacity = on ? '1' : '0'; tip.style.transform = 'translateX(-50%) translateY(' + (on ? '0' : '4px') + ')'; }
      ctx.on(btn, 'mouseenter', function () { show(true); });
      ctx.on(btn, 'mouseleave', function () { show(false); });
      ctx.on(btn, 'focus', function () { show(true); });
      ctx.on(btn, 'blur', function () { show(false); });
      ctx.on(btn, 'click', function () { show(tip.style.opacity !== '1'); });
      ctx.hint('不获取焦点，内容保持一句话');
    }
  });

  /* 2. Popover */
  UIK.register('overlay', {
    en: 'Popover', zh: '气泡卡片',
    desc: '点击触发，承载比 Tooltip 更丰富的补充信息，可包含按钮；点击外部或 Esc 关闭。',
    hint: '点击头像卡片展开，再点外部或 Esc 关闭。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn', '查看成员'); btn.type = 'button';
      var pop = U.el('div'); U.css(pop, {
        position: 'absolute', top: 'calc(50% - 14px)', left: '50%', transform: 'translateX(-50%) translateY(-6px) scale(.97)',
        width: '210px', background: '#1c2130', border: '1px solid #3a4255', borderRadius: '11px', padding: '12px',
        opacity: '0', pointerEvents: 'none', zIndex: 9, boxShadow: '0 14px 34px rgba(0,0,0,.55)'
      });
      UIK.tx(pop, 'opacity .2s,transform .2s');
      pop.innerHTML = '<div style="display:flex;gap:9px;align-items:center"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6ea8fe,#a78bfa)"></div>' +
        '<div><div style="font-size:12.5px;font-weight:600">张三月</div><div style="font-size:11px;color:#98a1b8">销售一部 · 负责人</div></div></div>' +
        '<div style="font-size:11.5px;color:#98a1b8;margin:9px 0 10px">负责华东区重点客户，当前跟进 7 个商机。</div>' +
        '<div style="display:flex;gap:8px"><button class="d-btn" style="font-size:11.5px">发消息</button><button class="d-btn" style="font-size:11.5px">查看档案</button></div>';
      h.appendChild(btn); h.appendChild(pop);
      var open = false;
      function set(on) {
        open = on;
        pop.style.opacity = on ? '1' : '0';
        pop.style.transform = 'translateX(-50%) translateY(' + (on ? '0' : '-6px') + ') scale(' + (on ? '1' : '.97') + ')';
        pop.style.pointerEvents = on ? 'auto' : 'none';
        btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      }
      ctx.on(btn, 'click', function (e) { e.stopPropagation(); set(!open); });
      ctx.on(document, 'click', function (e) { if (open && !pop.contains(e.target) && e.target !== btn) set(false); });
      ctx.on(document, 'keydown', function (e) { if (open && e.key === 'Escape') { set(false); btn.focus(); } });
      ctx.hint('可含操作按钮，但不阻断页面');
    }
  });

  /* 3. Dropdown Menu */
  UIK.register('overlay', {
    en: 'Dropdown Menu', zh: '下拉菜单',
    desc: '点击展开一组操作或选项，选择后立即收起并把结果回填到触发器。',
    hint: '选择任一操作，菜单收起并把结果写到按钮上。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn', '更多操作 ▾'); btn.type = 'button';
      var menu = U.el('div'); U.css(menu, {
        position: 'absolute', top: 'calc(50% + 20px)', left: '50%', transform: 'translateX(-50%) translateY(-6px)',
        minWidth: '150px', background: '#1c2130', border: '1px solid #3a4255', borderRadius: '10px', overflow: 'hidden',
        opacity: '0', pointerEvents: 'none', zIndex: 9
      });
      UIK.tx(menu, 'opacity .18s,transform .18s');
      ['编辑资料', '复制链接', '导出 PDF', '删除记录'].forEach(function (t, i) {
        var o = U.el('button'); o.type = 'button';
        U.css(o, {
          display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
          color: i === 3 ? '#f87171' : '#e6e9f2', padding: '9px 12px', fontSize: '12px', cursor: 'pointer'
        });
        o.textContent = t;
        ctx.on(o, 'mouseenter', function () { o.style.background = '#232b3d'; });
        ctx.on(o, 'mouseleave', function () { o.style.background = 'transparent'; });
        ctx.on(o, 'click', function () { btn.textContent = t + ' ▾'; set(false); btn.focus(); });
        menu.appendChild(o);
      });
      h.appendChild(btn); h.appendChild(menu);
      var open = false;
      function set(on) {
        open = on; menu.style.opacity = on ? '1' : '0';
        menu.style.transform = 'translateX(-50%) translateY(' + (on ? '0' : '-6px') + ')';
        menu.style.pointerEvents = on ? 'auto' : 'none';
      }
      ctx.on(btn, 'click', function (e) { e.stopPropagation(); set(!open); });
      ctx.on(document, 'click', function (e) { if (open && !menu.contains(e.target)) set(false); });
      ctx.on(document, 'keydown', function (e) { if (open && e.key === 'Escape') set(false); });
      ctx.hint('选择即收起，焦点回到触发器');
    }
  });

  /* 4. Drawer */
  UIK.register('overlay', {
    en: 'Drawer', zh: '抽屉',
    desc: '从侧边滑入展示详情或编辑内容，保留原页面可见，不遮挡主内容区。',
    hint: '点击按钮从右侧滑入，遮罩可关闭。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn primary', '打开详情抽屉'); btn.type = 'button';
      h.appendChild(btn);
      var ov = overlay(h);
      var dr = U.el('div'); U.css(dr, {
        position: 'absolute', top: '0', right: '0', bottom: '0', width: '200px', background: '#1c2130',
        borderLeft: '1px solid #3a4255', transform: 'translateX(100%)', zIndex: 9, padding: '14px',
        display: 'flex', flexDirection: 'column'
      });
      UIK.tx(dr, 'transform .36s cubic-bezier(.4,0,.2,1)');
      dr.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="font-size:13px;font-weight:600">客户详情</span><button class="d-btn" id="dx" style="padding:2px 8px">✕</button></div>' +
        '<div style="font-size:11.5px;color:#98a1b8">原页面仍然可见，抽屉只占据右侧空间，适合边看边编辑。</div>' +
        '<div style="margin-top:auto;display:flex;gap:8px"><button class="d-btn primary" style="font-size:11.5px">保存</button><button class="d-btn" style="font-size:11.5px">取消</button></div>';
      h.appendChild(dr);
      var open = false;
      function set(on) {
        open = on;
        dr.style.transform = on ? 'translateX(0)' : 'translateX(100%)';
        ov.style.opacity = on ? '1' : '0';
        ov.style.pointerEvents = on ? 'auto' : 'none';
      }
      ctx.on(btn, 'click', function () { set(true); });
      ctx.on(ov, 'click', function () { set(false); });
      ctx.on(dr.querySelector('#dx'), 'click', function () { set(false); });
      ctx.on(document, 'keydown', function (e) { if (open && e.key === 'Escape') set(false); });
      ctx.hint('不阻断原页面，Esc 可关闭');
    }
  });

  /* 5. Bottom Sheet */
  UIK.register('overlay', {
    en: 'Bottom Sheet', zh: '底部面板',
    desc: '移动端常用，把操作放在拇指易触达的位置；支持下拉手势关闭。',
    hint: '点击按钮从底部展开，可下拉面板顶部把手关闭。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn primary', '打开底部面板'); btn.type = 'button';
      h.appendChild(btn);
      var ov = overlay(h);
      var sheet = U.el('div'); U.css(sheet, {
        position: 'absolute', left: '8px', right: '8px', bottom: '0', background: '#1c2130',
        border: '1px solid #3a4255', borderBottom: 'none', borderRadius: '14px 14px 0 0', padding: '8px 14px 14px',
        transform: 'translateY(105%)', zIndex: 9
      });
      UIK.tx(sheet, 'transform .38s cubic-bezier(.4,0,.2,1)');
      var grip = U.el('div'); U.css(grip, { width: '38px', height: '4px', borderRadius: '2px', background: '#3a4255', margin: '0 auto 10px', cursor: 'grab', touchAction: 'none' });
      sheet.appendChild(grip);
      var content = U.el('div'); U.css(content, { fontSize: '11.5px', color: '#98a1b8' });
      content.innerHTML = '把操作放在屏幕底部，拇指即可触达。<br>向下拖动把手或点击遮罩关闭。';
      sheet.appendChild(content);
      var actions = U.el('div'); U.css(actions, { display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '12px' });
      ['拍照上传', '从相册选择', '从文件选择'].forEach(function (t) {
        var b = U.el('button', 'd-btn', t); b.type = 'button'; b.style.width = '100%';
        ctx.on(b, 'click', function () { set(false); });
        actions.appendChild(b);
      });
      sheet.appendChild(actions); h.appendChild(sheet);
      var open = false;
      function set(on) {
        open = on;
        sheet.style.transform = 'translateY(' + (on ? '0' : '105%') + ')';
        ov.style.opacity = on ? '1' : '0';
        ov.style.pointerEvents = on ? 'auto' : 'none';
      }
      ctx.on(btn, 'click', function () { set(true); });
      ctx.on(ov, 'click', function () { set(false); });
      ctx.on(document, 'keydown', function (e) { if (open && e.key === 'Escape') set(false); });
      var startY = 0;
      ctx.clean(U.drag(grip, {
        onStart: function (e) { startY = e.clientY; UIK.tx(sheet, 'none'); },
        onMove: function (e) { var dy = Math.max(0, e.clientY - startY); sheet.style.transform = 'translateY(' + dy + 'px)'; },
        onEnd: function (e) {
          UIK.tx(sheet, 'transform .38s cubic-bezier(.4,0,.2,1)');
          if (e.clientY - startY > 50) set(false); else sheet.style.transform = 'translateY(0)';
        }
      }));
      ctx.hint('下拉 50px 触发关闭');
    }
  });

  /* 6. Modal */
  UIK.register('overlay', {
    en: 'Modal', zh: '模态框',
    desc: '居中显示并带遮罩，要求用户确认或做出决定；打开时阻断原页面操作，关闭后恢复焦点。',
    hint: '打开后只能用按钮或 Esc 关闭，焦点保持在弹窗内。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn', '删除该商机'); btn.type = 'button';
      h.appendChild(btn);
      var ov = overlay(h);
      var modal = U.el('div'); U.css(modal, {
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) scale(.94)',
        width: '230px', background: '#1c2130', border: '1px solid #3a4255', borderRadius: '13px', padding: '16px',
        opacity: '0', pointerEvents: 'none', zIndex: 10
      });
      UIK.tx(modal, 'opacity .2s,transform .28s cubic-bezier(.34,1.3,.64,1)');
      modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = '<div style="font-size:13.5px;font-weight:600;margin-bottom:6px">确认删除？</div>' +
        '<div style="font-size:11.5px;color:#98a1b8;margin-bottom:14px">删除后该商机的跟进记录将一并移除，且不可恢复。</div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="d-btn" id="mc">取消</button><button class="d-btn" id="mo" style="background:#f87171;color:#0b0d12;border-color:transparent;font-weight:600">确认删除</button></div>';
      h.appendChild(modal);
      var open = false, lastFocus = null;
      function set(on) {
        open = on;
        modal.style.opacity = on ? '1' : '0';
        modal.style.transform = 'translate(-50%,-50%) scale(' + (on ? '1' : '.94') + ')';
        modal.style.pointerEvents = on ? 'auto' : 'none';
        ov.style.opacity = on ? '1' : '0';
        ov.style.pointerEvents = on ? 'auto' : 'none';
        if (on) { lastFocus = document.activeElement; var c = modal.querySelector('#mc'); if (c) c.focus(); }
        else if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
      ctx.on(btn, 'click', function () { set(true); });
      ctx.on(modal.querySelector('#mc'), 'click', function () { set(false); });
      ctx.on(modal.querySelector('#mo'), 'click', function () { set(false); btn.textContent = '已删除'; btn.disabled = true; });
      ctx.on(document, 'keydown', function (e) { if (open && e.key === 'Escape') set(false); });
      ctx.on(ov, 'click', function () { set(false); });
      ctx.hint('焦点陷阱 + Esc + 关闭后焦点回到触发器');
    }
  });

  /* 7. Toast（补充） */
  UIK.register('overlay', {
    en: 'Toast', zh: '轻提示',
    desc: '操作后的简短反馈：自动消失，不获取焦点、不阻断当前流程，多条时堆叠。',
    hint: '连续点击触发多条提示，2.5 秒后自动消失。',
    mount: function (stage, ctx) {
      var h = host(stage);
      var btn = U.el('button', 'd-btn primary', '保存修改'); btn.type = 'button';
      h.appendChild(btn);
      var stack = U.el('div'); U.css(stack, {
        position: 'absolute', left: '50%', bottom: '8px', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', gap: '7px', alignItems: 'center', zIndex: 9
      });
      h.appendChild(stack);
      var n = 0;
      function toast(msg) {
        n++;
        var t = U.el('div'); U.css(t, {
          background: '#1c2130', border: '1px solid #3a4255', color: '#e6e9f2', fontSize: '11.5px',
          padding: '8px 13px', borderRadius: '9px', boxShadow: '0 8px 20px rgba(0,0,0,.45)',
          opacity: '0', transform: 'translateY(8px)', whiteSpace: 'nowrap', pointerEvents: 'none'
        });
        UIK.tx(t, 'opacity .22s,transform .22s');
        t.textContent = msg;
        t.setAttribute('role', 'status');
        stack.appendChild(t);
        requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
        var timer = setTimeout(function () {
          t.style.opacity = '0'; t.style.transform = 'translateY(6px)';
          setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
        }, 2500);
        ctx.clean(function () { clearTimeout(timer); });
      }
      ctx.on(btn, 'click', function () { toast('已保存第 ' + n + ' 次修改'); });
      ctx.hint('不获取焦点，重要结果不能只用 Toast 表达');
    }
  });
})();
