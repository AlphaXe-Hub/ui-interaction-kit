/* 04 展开动画 · Expand Animations (7) */
(function () {
  var U = UIK.util;
  function stageBox(stage) { var b = U.el('div'); U.css(b, { position: 'relative', width: '100%', height: '176px', display: 'flex', alignItems: 'center', justifyContent: 'center' }); stage.appendChild(b); return b; }
  function toggleBtn(host, a, b, fn) {
    var btn = U.el('button', 'd-btn', a); btn.type = 'button';
    U.css(btn, { position: 'absolute', left: '0', bottom: '0' });
    var on = false;
    btn.addEventListener('click', function () { on = !on; fn(on); btn.textContent = on ? b : a; });
    host.appendChild(btn);
    return btn;
  }

  /* 1. Circle to Pill */
  UIK.register('expand', {
    en: 'Circle to Pill', zh: '圆点变胶囊',
    desc: '从小圆形入口横向展开成胶囊型，承载即时状态或简短信息。',
    hint: '起点：56px 圆形；终点：220px 胶囊并出现文字。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var el = U.el('button'); el.type = 'button';
      U.css(el, {
        width: '56px', height: '56px', borderRadius: '28px', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg,#6ea8fe,#a78bfa)', color: '#0b0d12', fontWeight: '600',
        fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
      });
      UIK.tx(el, 'width .42s cubic-bezier(.34,1.4,.64,1),border-radius .42s,background .3s');
      el.textContent = '✓';
      host.appendChild(el);
      toggleBtn(host, '展开为胶囊', '收起为圆点', function (on) {
        el.style.width = on ? '220px' : '56px';
        el.style.borderRadius = on ? '28px' : '28px';
        setTimeout(function () { el.textContent = on ? '✓ 已保存草稿' : '✓'; }, UIK.isReduced() ? 0 : 160);
      });
      ctx.hint('尺寸 + 内容同时变化，圆角保持一致');
    }
  });

  /* 2. Pill to Card */
  UIK.register('expand', {
    en: 'Pill to Card', zh: '胶囊变信息卡',
    desc: '先显示紧凑状态条，展开后变成完整信息卡，承载更多内容与操作。',
    hint: '从 220×36 胶囊展开为 260×150 信息卡。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var el = U.el('div'); U.css(el, {
        width: '220px', height: '36px', borderRadius: '18px', background: '#1c2130', border: '1px solid #2b3348',
        overflow: 'hidden', cursor: 'pointer', position: 'relative'
      });
      UIK.tx(el, 'width .42s cubic-bezier(.3,1.2,.5,1),height .42s cubic-bezier(.3,1.2,.5,1),border-radius .42s');
      var line = U.el('div'); U.css(line, { display: 'flex', alignItems: 'center', height: '36px', padding: '0 14px', fontSize: '12px', color: '#98a1b8' });
      line.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#4ade80;margin-right:8px"></span>同步已完成 · 查看细节';
      var body = U.el('div'); U.css(body, { padding: '10px 14px', opacity: '0', transition: UIK.isReduced() ? 'none' : 'opacity .3s .1s' });
      body.innerHTML = '<div style="font-size:13px;font-weight:600;margin-bottom:4px">同步详情</div>' +
        '<div style="font-size:11.5px;color:#98a1b8">共 128 条记录，失败 2 条。展开后显示完整信息与操作按钮。</div>' +
        '<div style="margin-top:10px;display:flex;gap:8px"><button class="d-btn" style="font-size:11.5px">重试失败项</button><button class="d-btn" style="font-size:11.5px">查看日志</button></div>';
      el.appendChild(line); el.appendChild(body); host.appendChild(el);
      toggleBtn(host, '展开为信息卡', '收起为胶囊', function (on) {
        el.style.width = on ? '260px' : '220px';
        el.style.height = on ? '150px' : '36px';
        el.style.borderRadius = on ? '14px' : '18px';
        body.style.opacity = on ? '1' : '0';
      });
      ctx.hint('内容在展开后才出现，收起时先淡出');
    }
  });

  /* 3. Compact to Expand */
  UIK.register('expand', {
    en: 'Compact to Expand', zh: '紧凑态展开',
    desc: '同一功能先以紧凑形态出现，需要时展开成完整面板，节省初始空间。',
    hint: '紧凑工具条 → 完整控制面板。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var el = U.el('div'); U.css(el, {
        background: '#1c2130', border: '1px solid #2b3348', borderRadius: '22px', overflow: 'hidden', width: '196px'
      });
      UIK.tx(el, 'height .4s cubic-bezier(.3,1.1,.5,1),border-radius .4s');
      el.style.height = '40px';
      var bar = U.el('div'); U.css(bar, { display: 'flex', alignItems: 'center', gap: '10px', height: '40px', padding: '0 14px', fontSize: '12px', color: '#98a1b8' });
      bar.innerHTML = '<span>播放控制</span><span style="margin-left:auto">⌄</span>';
      var p = U.el('div'); U.css(p, { padding: '4px 14px 14px', opacity: '0', transition: UIK.isReduced() ? 'none' : 'opacity .25s .12s' });
      p.innerHTML = '<input type="range" style="width:100%;accent-color:#6ea8fe">' +
        '<div style="display:flex;gap:8px;margin-top:10px"><button class="d-btn" style="font-size:11.5px">上一首</button><button class="d-btn" style="font-size:11.5px">下一首</button></div>' +
        '<label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:11.5px;color:#98a1b8"><input type="checkbox" checked> 循环播放</label>';
      el.appendChild(bar); el.appendChild(p); host.appendChild(el);
      toggleBtn(host, '展开控制面板', '收起为工具条', function (on) {
        el.style.height = on ? '150px' : '40px';
        el.style.borderRadius = on ? '14px' : '22px';
        p.style.opacity = on ? '1' : '0';
      });
      ctx.hint('节省初始空间，展开后仍在同一位置');
    }
  });

  /* 4. Corner Radius Morph */
  UIK.register('expand', {
    en: 'Corner Radius Morph', zh: '圆角形态过渡',
    desc: '尺寸基本不变，主要通过圆角变化完成形态过渡，例如从卡片变成弹窗。',
    hint: '宽高不变，圆角 28px → 6px，同时阴影与内边距轻微变化。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var el = U.el('div'); U.css(el, {
        width: '220px', height: '130px', background: '#1c2130', border: '1px solid #2b3348',
        borderRadius: '28px', padding: '14px', boxShadow: '0 6px 18px rgba(0,0,0,.3)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      });
      UIK.tx(el, 'border-radius .45s cubic-bezier(.4,0,.2,1),box-shadow .45s,background .45s');
      el.innerHTML = '<div style="font-size:13px;font-weight:600">形态过渡</div><div style="font-size:11.5px;color:#98a1b8">尺寸不变，只改圆角与阴影</div>';
      host.appendChild(el);
      toggleBtn(host, '变为弹窗形态', '变回卡片形态', function (on) {
        el.style.borderRadius = on ? '6px' : '28px';
        el.style.boxShadow = on ? '0 22px 50px rgba(0,0,0,.6)' : '0 6px 18px rgba(0,0,0,.3)';
        el.style.background = on ? '#202639' : '#1c2130';
      });
      ctx.hint('适合卡片与弹窗之间的细微形态切换');
    }
  });

  /* 5. Size Morph */
  UIK.register('expand', {
    en: 'Size Morph', zh: '尺寸变形',
    desc: '通过改变容器宽高让小组件变成大模块，用于展示更详细内容。',
    hint: '90×90 小组件 → 270×160 大模块，内部内容随尺寸显现。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var el = U.el('div'); U.css(el, {
        width: '90px', height: '90px', borderRadius: '16px', overflow: 'hidden',
        background: 'linear-gradient(160deg,#2a3348,#1b2233)', border: '1px solid #2b3348', padding: '12px'
      });
      UIK.tx(el, 'width .45s cubic-bezier(.3,1.1,.5,1),height .45s cubic-bezier(.3,1.1,.5,1)');
      el.innerHTML = '<div style="font-size:12px;font-weight:600">概览</div>';
      var more = U.el('div'); U.css(more, { marginTop: '8px', opacity: '0', transition: UIK.isReduced() ? 'none' : 'opacity .3s .15s', fontSize: '11.5px', color: '#98a1b8' });
      more.textContent = '展开后显示趋势、明细与操作入口。尺寸变化是这次过渡的主属性。';
      el.appendChild(more); host.appendChild(el);
      toggleBtn(host, '放大为大模块', '收起为小组件', function (on) {
        el.style.width = on ? '270px' : '90px';
        el.style.height = on ? '160px' : '90px';
        more.style.opacity = on ? '1' : '0';
      });
      ctx.hint('主属性是宽高，内容作为辅助');
    }
  });

  /* 6. Content Reflow */
  UIK.register('expand', {
    en: 'Content Reflow', zh: '内容重排',
    desc: '容器展开后内部内容重新排列，从压缩布局变为完整布局。',
    hint: '内部元素从单行压缩态重排为多行完整布局。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var el = U.el('div'); U.css(el, {
        width: '260px', background: '#1c2130', border: '1px solid #2b3348', borderRadius: '12px', padding: '10px',
        display: 'flex', gap: '8px', alignItems: 'center', overflow: 'hidden'
      });
      UIK.tx(el, 'height .42s cubic-bezier(.3,1.1,.5,1),flex-wrap .1s');
      el.style.height = '46px'; el.style.flexWrap = 'nowrap';
      var chips = ['需求', '设计', '开发', '测试', '上线', '验收'].map(function (t, i) {
        var c = U.el('span'); U.css(c, {
          fontSize: '11px', color: '#98a1b8', background: '#121724', border: '1px solid #2b3348',
          borderRadius: '999px', padding: '4px 9px', whiteSpace: 'nowrap', transition: UIK.isReduced() ? 'none' : 'font-size .3s,padding .3s'
        });
        c.textContent = t; el.appendChild(c); return c;
      });
      host.appendChild(el);
      toggleBtn(host, '展开并重排', '收起为单行', function (on) {
        el.style.flexWrap = on ? 'wrap' : 'nowrap';
        el.style.height = on ? '112px' : '46px';
        chips.forEach(function (c) { c.style.fontSize = on ? '12px' : '11px'; c.style.padding = on ? '6px 12px' : '4px 9px'; });
      });
      ctx.hint('容器与内部元素同时变化，顺序保持不变');
    }
  });

  /* 7. Reverse Collapse */
  UIK.register('expand', {
    en: 'Reverse Collapse', zh: '反向收回',
    desc: '展开完成后沿原路径回到初始入口，而不是直接消失，强调动画连贯性。',
    hint: '再次点击会从展开态沿同一条路径收回到入口按钮。',
    mount: function (stage, ctx) {
      var host = stageBox(stage);
      var origin = U.el('button', 'd-btn primary', '打开面板'); origin.type = 'button';
      U.css(origin, { position: 'absolute', right: '0', bottom: '26px' });
      host.appendChild(origin);
      var panel = U.el('div'); U.css(panel, {
        position: 'absolute', left: '0', bottom: '26px', width: '190px', height: '0', overflow: 'hidden',
        background: '#1c2130', border: '1px solid #2b3348', borderRadius: '12px', opacity: '0',
        transformOrigin: 'bottom right'
      });
      UIK.tx(panel, 'height .4s cubic-bezier(.4,0,.2,1),opacity .3s,transform .4s cubic-bezier(.4,0,.2,1)');
      panel.style.transform = 'scale(.86) translateY(8px)';
      panel.innerHTML = '<div style="padding:12px;font-size:11.5px;color:#98a1b8">沿原路径收回：高度、缩放与透明度同时回到起点。</div>';
      host.appendChild(panel);
      var open = false;
      ctx.on(origin, 'click', function () {
        open = !open;
        origin.textContent = open ? '沿原路径收回' : '打开面板';
        panel.style.height = open ? '78px' : '0px';
        panel.style.opacity = open ? '1' : '0';
        panel.style.transform = open ? 'scale(1) translateY(0)' : 'scale(.86) translateY(8px)';
      });
      ctx.hint('收回与展开共用同一条运动路径');
    }
  });
})();
