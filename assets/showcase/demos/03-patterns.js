/* 03 App 高级交互模式 · Interaction Patterns (10) */
(function () {
  var U = UIK.util;

  /* 1. Radial Theme Transition */
  UIK.register('patterns', {
    en: 'Radial Theme Transition', zh: '圆形主题切换',
    desc: '以真实点击位置为圆心，用圆形遮罩揭示另一套主题：半径覆盖最远角落，两层不缩放。',
    hint: '在不同位置点击切换按钮，观察圆心变化；减少动效时改为直接切换。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, {
        position: 'relative', width: '100%', height: '168px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--d-border)'
      });
      function layer(bg, fg, title, sub) {
        var l = U.el('div'); U.css(l, {
          position: 'absolute', inset: '0', background: bg, color: fg, padding: '16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px'
        });
        l.innerHTML = '<div style="font-size:15px;font-weight:600">' + title + '</div><div style="font-size:11.5px;opacity:.75">' + sub + '</div>';
        return l;
      }
      var light = layer('#f2f4f8', '#10131b', '浅色主题', '底层：始终保持在原位');
      var dark = layer('#1b2233', '#f2f4f8', '深色主题', '上层：只被圆形遮罩裁切');
      U.css(dark, { clipPath: 'circle(0px at 50% 50%)' });
      box.appendChild(light); box.appendChild(dark);
      var btn = U.el('button', 'd-btn primary', '切换主题');
      U.css(btn, { position: 'absolute', right: '12px', bottom: '12px', zIndex: 3 });
      box.appendChild(btn); stage.appendChild(box);

      var darkOn = false;
      ctx.on(btn, 'click', function (e) {
        darkOn = !darkOn;
        var r = box.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var R = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
        UIK.tx(dark, 'clip-path .55s cubic-bezier(.4,0,.2,1)');
        dark.style.clipPath = 'circle(' + (darkOn ? R : 0) + 'px at ' + x + 'px ' + y + 'px)';
      });
      ctx.hint('两层尺寸位置一致，只裁切上层');
    }
  });

  /* 2. Drag-to-Reorder */
  UIK.register('patterns', {
    en: 'Drag-to-Reorder', zh: '拖拽排序',
    desc: '拖动项脱离列表流，逐帧计算落点索引，其他项形成空槽并各自追赶新位置。',
    hint: '按住任一行上下拖动；中途停下时布局也停在当前状态。',
    mount: function (stage, ctx) {
      var list = U.el('div'); U.css(list, { position: 'relative', width: '100%', height: '176px' });
      var items = ['需求调研', '方案设计', '开发实现', '验收上线'].map(function (t, i) {
        var r = U.el('div', 'grab'); U.css(r, {
          position: 'absolute', left: '0', right: '0', height: '36px', background: 'var(--d-panel)', border: '1px solid var(--d-border)',
          borderRadius: '9px', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '12.5px',
          willChange: 'transform', touchAction: 'none'
        });
        r.innerHTML = '<span style="color:var(--d-dim-2);margin-right:8px">≡</span>' + t;
        r._i = i; r._y = i * 42;
        r.style.transform = 'translateY(' + r._y + 'px)';
        list.appendChild(r); return r;
      });
      stage.appendChild(list);
      var H = 42, dragging = null, startY = 0, target = 0;
      var TX = 'transform .38s cubic-bezier(.34,1.42,.64,1),border-color .2s,box-shadow .2s';
      items.forEach(function (r) {
        r.style.willChange = 'transform';
        UIK.tx(r, TX);
        ctx.clean(U.drag(r, {
          onStart: function (e) {
            dragging = r; startY = e.clientY; r._base = r._y;
            r.style.transition = 'none';            // 拖动项跟手，不加动画
            r.style.zIndex = 5; r.style.borderColor = 'var(--d-accent)';
            r.style.boxShadow = '0 10px 24px rgba(0,0,0,.35)';
          },
          onMove: function (e) {
            var dy = e.clientY - startY;
            r._y = U.clamp(r._base + dy, -6, (items.length - 1) * H + 6);
            r.style.transform = 'translateY(' + r._y + 'px)';
            target = U.clamp(Math.round(r._y / H), 0, items.length - 1);
            var from = r._i;
            items.forEach(function (o) {
              if (o === r) return;
              var oi = o._i, ni = oi;
              if (from < target && oi > from && oi <= target) ni = oi - 1;
              else if (from > target && oi < from && oi >= target) ni = oi + 1;
              if (ni !== oi) { o._i = ni; }
              o.style.transform = 'translateY(' + (o._i * H) + 'px)';
            });
            r._i = target;
          },
          onEnd: function () {
            UIK.tx(r, TX);                          // 恢复动画，平滑吸附到槽位
            r.style.zIndex = 1; r.style.borderColor = 'var(--d-border)';
            r.style.boxShadow = 'none';
            r._y = r._i * H; r.style.transform = 'translateY(' + r._y + 'px)';
            dragging = null;
          }
        }));
      });
      ctx.hint('每项独立追赶目标位置，松手吸附到槽位');
    }
  });

  /* 3. Staggered Bulk Selection */
  UIK.register('patterns', {
    en: 'Staggered Bulk Selection', zh: '批量勾选',
    desc: '状态立即更新，勾选视觉从第一项开始错峰出现并带轻微弹性，动画不阻塞继续操作。',
    hint: '点击全选 / 取消全选；状态是立即变化的，错峰只发生在视觉上。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      var rows = ['客户档案 A', '客户档案 B', '客户档案 C', '客户档案 D'].map(function (t) {
        var r = U.el('div'); U.css(r, {
          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', border: '1px solid var(--d-border)',
          borderRadius: '9px', background: 'var(--d-panel-2)', marginBottom: '7px', fontSize: '12.5px'
        });
        var chk = U.el('div'); U.css(chk, {
          width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid var(--d-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--d-inv-text)', fontSize: '11px',
          transition: UIK.isReduced() ? 'none' : 'transform .28s cubic-bezier(.34,1.56,.64,1),background .18s,border-color .18s'
        });
        chk.style.transform = 'scale(0)';
        r.appendChild(chk); r.appendChild(U.el('span', null, t));
        box.appendChild(r); return { row: r, chk: chk };
      });
      var bar = U.el('div', 'd-row'); U.css(bar, { marginTop: '6px' });
      var btn = U.el('button', 'd-btn primary', '全选'); btn.type = 'button';
      var info = U.el('span', 'd-val', '未选中');
      bar.appendChild(btn); bar.appendChild(info); box.appendChild(bar);
      stage.appendChild(box);

      var all = false;
      ctx.on(btn, 'click', function () {
        all = !all; info.textContent = all ? '已选中 4 项（状态立即生效）' : '未选中';
        btn.textContent = all ? '取消全选' : '全选';
        rows.forEach(function (r, i) {
          if (UIK.isReduced()) { r.chk.style.transform = all ? 'scale(1)' : 'scale(0)'; set(r, all); return; }
          if (all) {
            setTimeout(function () { r.chk.style.transform = 'scale(1.25)'; set(r, true); setTimeout(function () { r.chk.style.transform = 'scale(1)'; }, 150); }, i * 70);
          } else {
            setTimeout(function () { r.chk.style.transform = 'scale(0)'; set(r, false); }, i * 45);
          }
        });
      });
      function set(r, on) {
        r.chk.style.background = on ? 'var(--d-ok)' : 'transparent';
        r.chk.style.borderColor = on ? 'var(--d-ok)' : 'var(--d-border)';
        r.chk.textContent = on ? '✓' : '';
      }
      ctx.hint('错峰 70ms；真实状态在点击瞬间已更新');
    }
  });

  /* 4. Velocity-Based Slider Snap */
  UIK.register('patterns', {
    en: 'Velocity-Based Slider Snap', zh: '滑杆惯性吸附',
    desc: '记录释放速度，松手后允许短距离冲过，再用弹簧回到最近有效刻度，最终值限制在合法范围。',
    hint: '快速甩动滑块再松手：会先冲过再回吸到最近刻度。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%', padding: '18px 4px 6px', position: 'relative' });
      var track = U.el('div'); U.css(track, { position: 'relative', height: '6px', background: 'var(--d-track)', borderRadius: '3px' });
      var fill = U.el('div'); U.css(fill, { position: 'absolute', left: '0', top: '0', bottom: '0', width: '0', background: 'var(--d-accent)', borderRadius: '3px' });
      var thumb = U.el('div', 'grab'); U.css(thumb, {
        position: 'absolute', top: '50%', left: '0', width: '22px', height: '22px', marginTop: '-11px', marginLeft: '-11px',
        borderRadius: '50%', background: 'var(--d-text)', border: '2px solid var(--d-accent)', boxShadow: '0 3px 10px rgba(0,0,0,.4)', touchAction: 'none'
      });
      track.appendChild(fill); track.appendChild(thumb); box.appendChild(track);
      var ticks = U.el('div'); U.css(ticks, { display: 'flex', justifyContent: 'space-between', marginTop: '10px' });
      [0, 25, 50, 75, 100].forEach(function (v) {
        var t = U.el('span', 'd-val', v + '%'); ticks.appendChild(t);
      });
      box.appendChild(ticks);
      var val = U.el('div', 'd-val'); U.css(val, { marginTop: '6px', color: 'var(--d-accent)' }); val.textContent = '目标值 0%';
      box.appendChild(val); stage.appendChild(box);

      var W = track.clientWidth || 280, x = 0, vel = 0, last = null, drag = false;
      var sp = new U.Spring(0, 190, 17);
      ctx.on(window, 'resize', function () { W = track.clientWidth || W; });
      ctx.clean(U.drag(thumb, {
        onStart: function (e) { drag = true; last = { x: e.clientX, t: performance.now() }; vel = 0; },
        onMove: function (e) {
          var r = track.getBoundingClientRect();
          var nx = U.clamp(e.clientX - r.left, 0, W);
          var now = performance.now();
          vel = ((nx - x) / Math.max(now - last.t, 8)) * 0.4 + vel * 0.6;
          x = nx; last = { x: e.clientX, t: now };
          sp.t = x; sp.v = x;
          paint();
        },
        onEnd: function () {
          drag = false;
          var tick = Math.round(x / W * 4) * (W / 4);
          sp.v = x; sp.vel = vel * 1000 * 0.35;   // 释放速度 → 过冲
          sp.t = tick;
        }
      }));
      function paint() {
        thumb.style.left = sp.v + 'px';
        fill.style.width = sp.v + 'px';
        val.textContent = '目标值 ' + Math.round(U.clamp(sp.v / W, 0, 1) * 100) + '%';
      }
      ctx.raf(function (dt) { sp.step(dt); paint(); });
      paint();
      ctx.hint('过冲量来自释放速度，最终值被 clamp 到 0–100%');
    }
  });

  /* 5. Animated Text Disclosure */
  UIK.register('patterns', {
    en: 'Animated Text Disclosure', zh: '文本展开',
    desc: '按真实内容高度连续过渡：从当前高度到测量高度，箭头旋转 180°，布局不跳动。',
    hint: '点击标题展开/收起；高度按内容实测，收起时回到折叠高度。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%', background: 'var(--d-panel-2)', border: '1px solid var(--d-border)', borderRadius: '11px', overflow: 'hidden' });
      var head = U.el('button'); head.type = 'button';
      U.css(head, {
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent',
        border: 'none', color: 'var(--d-text)', padding: '11px 13px', fontSize: '13px', cursor: 'pointer'
      });
      head.innerHTML = '<span>服务条款说明</span><span id="cv" style="display:inline-block;transition:' + (UIK.isReduced() ? 'none' : 'transform .3s') + ';color:var(--d-dim)">▾</span>';
      var body = U.el('div'); U.css(body, {
        height: '0', overflow: 'hidden', transition: UIK.isReduced() ? 'none' : 'height .34s cubic-bezier(.4,0,.2,1)'
      });
      var inner = U.el('div'); U.css(inner, { padding: '0 13px 12px', color: 'var(--d-dim)', fontSize: '12px' });
      inner.textContent = '容器高度来自内容实测值（scrollHeight），而不是写死的数值；收起时从当前高度回到折叠高度，文字不会突然出现，也不会造成下方内容跳动。展开状态通过 aria-expanded 暴露给辅助技术。';
      body.appendChild(inner); box.appendChild(head); box.appendChild(body);
      stage.appendChild(box);
      var open = false, cv = head.querySelector('#cv');
      ctx.on(head, 'click', function () {
        open = !open;
        body.style.height = open ? inner.scrollHeight + 'px' : '0px';
        cv.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      ctx.hint('height 用实测值过渡，避免 auto 直接切换');
    }
  });

  /* 6. Spring Stepper Progress */
  UIK.register('patterns', {
    en: 'Spring Stepper Progress', zh: '步骤条回弹',
    desc: '完成一步后进度段略微超过目标再回弹；完成、当前、未开始状态清晰，动画不改变真实步骤。',
    hint: '点击「完成当前步骤」；进度条会先过冲再回到准确位置。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%' });
      var track = U.el('div'); U.css(track, { position: 'relative', height: '6px', background: 'var(--d-track)', borderRadius: '3px' });
      var fill = U.el('div'); U.css(fill, { position: 'absolute', left: '0', top: '0', bottom: '0', width: '0', background: 'var(--d-accent)', borderRadius: '3px' });
      track.appendChild(fill); box.appendChild(track);
      var dots = U.el('div'); U.css(dots, { display: 'flex', justifyContent: 'space-between', marginTop: '12px' });
      var steps = ['基本信息', '资质材料', '合同签署', '完成'].map(function (t, i) {
        var d = U.el('div'); U.css(d, { textAlign: 'center', flex: '1', fontSize: '11px', color: 'var(--d-dim-2)' });
        var c = U.el('div'); U.css(c, {
          width: '20px', height: '20px', borderRadius: '50%', margin: '0 auto 5px', background: 'var(--d-panel)',
          border: '1.5px solid var(--d-border)', color: 'var(--d-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', transition: UIK.isReduced() ? 'none' : 'background .25s,border-color .25s,color .25s,transform .3s cubic-bezier(.34,1.56,.64,1)'
        });
        c.textContent = i + 1;
        d.appendChild(c); d.appendChild(U.el('div', null, t)); dots.appendChild(d);
        return { node: d, circle: c };
      });
      box.appendChild(dots);
      var bar = U.el('div', 'd-row'); U.css(bar, { marginTop: '12px' });
      var next = U.el('button', 'd-btn primary', '完成当前步骤'); next.type = 'button';
      var reset = U.el('button', 'd-btn', '重置'); reset.type = 'button';
      var info = U.el('span', 'd-val', '当前 1 / 4');
      bar.appendChild(next); bar.appendChild(reset); bar.appendChild(info); box.appendChild(bar);
      stage.appendChild(box);

      var cur = 0, sp = new U.Spring(0, 210, 15);
      function sync() {
        steps.forEach(function (s, i) {
          var done = i < cur, active = i === cur;
          s.circle.style.background = done ? 'var(--d-ok)' : (active ? 'var(--d-accent)' : 'var(--d-panel)');
          s.circle.style.borderColor = done ? 'var(--d-ok)' : (active ? 'var(--d-accent)' : 'var(--d-border)');
          s.circle.style.color = (done || active) ? 'var(--d-panel)' : 'var(--d-dim)';
          s.node.style.color = active ? 'var(--d-text)' : 'var(--d-dim-2)';
          s.circle.style.transform = active ? 'scale(1.18)' : 'scale(1)';
        });
        info.textContent = '当前 ' + (cur + 1) + ' / 4';
      }
      ctx.on(next, 'click', function () { if (cur < 3) { cur++; sp.t = cur / 3 * 100; sync(); } });
      ctx.on(reset, 'click', function () { cur = 0; sp.t = 0; sync(); });
      ctx.raf(function (dt) { sp.step(dt); fill.style.width = U.clamp(sp.v, 0, 106) + '%'; });
      sync();
      ctx.hint('过冲只是视觉，步骤状态在点击时已确定');
    }
  });

  /* 7. Ripple Feedback for Related Switches */
  UIK.register('patterns', {
    en: 'Ripple Feedback for Related Switches', zh: '开关联动反馈',
    desc: '同组开关中切换一个，邻近开关只产生涟漪或轻微位移，真实开关状态不变。',
    hint: '切换任一开关；邻近开关会抖动，但它们的 on/off 状态不会变。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { width: '100%', display: 'flex', flexDirection: 'column', gap: '9px' });
      var items = [];
      ['消息推送', '邮件通知', '短信提醒'].forEach(function (t, i) {
        var row = U.el('div'); U.css(row, {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px',
          background: 'var(--d-panel-2)', border: '1px solid var(--d-border)', borderRadius: '10px', fontSize: '12.5px',
          position: 'relative', overflow: 'hidden', transition: UIK.isReduced() ? 'none' : 'transform .35s cubic-bezier(.34,1.56,.64,1)'
        });
        row.appendChild(U.el('span', null, t));
        var sw = U.el('button'); sw.type = 'button';
        U.css(sw, {
          width: '40px', height: '22px', borderRadius: '999px', background: 'var(--d-border)', border: 'none', position: 'relative',
          cursor: 'pointer', transition: UIK.isReduced() ? 'none' : 'background .22s', flex: '0 0 auto'
        });
        var knob = U.el('span'); U.css(knob, {
          position: 'absolute', top: '3px', left: '3px', width: '16px', height: '16px', borderRadius: '50%',
          background: 'var(--d-text)', transition: UIK.isReduced() ? 'none' : 'left .24s cubic-bezier(.34,1.56,.64,1)'
        });
        sw.appendChild(knob); row.appendChild(sw); box.appendChild(row);
        items.push({ row: row, sw: sw, knob: knob, on: false, i: i });
      });
      var info = U.el('div', 'd-val'); U.css(info, { marginTop: '8px' }); info.textContent = '状态：关 / 关 / 关';
      box.appendChild(info); stage.appendChild(box);

      items.forEach(function (it) {
        ctx.on(it.sw, 'click', function () {
          it.on = !it.on;
          it.sw.style.background = it.on ? 'var(--d-ok)' : 'var(--d-border)';
          it.knob.style.left = it.on ? '21px' : '3px';
          items.forEach(function (o) {
            if (o === it || UIK.isReduced()) return;
            var d = Math.abs(o.i - it.i);
            var amp = d === 1 ? 5 : 2.5;
            o.row.style.transform = 'translateX(' + amp + 'px)';
            setTimeout(function () { o.row.style.transform = 'translateX(' + (-amp * 0.5) + 'px)'; }, 90);
            setTimeout(function () { o.row.style.transform = 'translateX(0)'; }, 190);
          });
          info.textContent = '状态：' + items.map(function (o) { return o.on ? '开' : '关'; }).join(' / ');
        });
      });
      ctx.hint('涟漪纯属视觉反馈，邻近开关状态不变');
    }
  });

  /* 8. Curved Card Deletion */
  UIK.register('patterns', {
    en: 'Curved Card Deletion', zh: '卡片曲线删除',
    desc: '滑过删除阈值后，卡片沿曲线飞向回收区并逐渐缩小、旋转、变淡；动画结束才移除数据。',
    hint: '向左拖动卡片越过阈值松手即删除；未达阈值会回到原位，可重置列表。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, { position: 'relative', width: '100%', height: '176px' });
      var bin = U.el('div'); U.css(bin, {
        position: 'absolute', right: '6px', top: '6px', color: 'var(--d-danger)', fontSize: '11px'
      }); bin.textContent = '回收区';
      box.appendChild(bin);
      var names = ['待办 A', '待办 B', '待办 C'];
      function addCard(name, idx) {
        var c = U.el('div', 'grab'); U.css(c, {
          position: 'absolute', left: '0', right: '0', top: (idx * 50) + 'px', height: '42px', background: 'var(--d-panel)',
          border: '1px solid var(--d-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 12px',
          fontSize: '12.5px', touchAction: 'none', willChange: 'transform'
        });
        c.textContent = name;
        box.appendChild(c);
        var x0 = 0, dragging = false;
        ctx.clean(U.drag(c, {
          onStart: function (e) { if (c._gone) return; dragging = true; x0 = e.clientX; },
          onMove: function (e) {
            if (!dragging || c._gone) return;
            var dx = Math.min(e.clientX - x0, 0);
            c.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx * 0.02) + 'deg)';
            c.style.opacity = String(U.clamp(1 + dx / 260, .3, 1));
            c._dx = dx;
          },
          onEnd: function () {
            if (!dragging || c._gone) return; dragging = false;
            var dx = c._dx || 0;
            if (dx < -110) flyOut(c);
            else { UIK.tx(c, 'transform .34s cubic-bezier(.34,1.56,.64,1),opacity .3s'); c.style.transform = 'translateX(0)'; c.style.opacity = '1'; }
          }
        }));
        return c;
      }
      function flyOut(c) {
        c._gone = true;
        var r = c.getBoundingClientRect(), br = box.getBoundingClientRect();
        var sx = c._dx, sy = 0, ex = br.width - 40, ey = -r.top + br.top - 30;
        UIK.tx(c, 'transform .46s cubic-bezier(.4,0,.6,1),opacity .46s');
        c.style.transform = 'translate(' + ex + 'px,' + ey + 'px) scale(.55) rotate(-16deg)';
        c.style.opacity = '0';
        setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 480);
      }
      names.forEach(function (n, i) { addCard(n, i); });
      var reset = U.el('button', 'd-btn', '重置列表'); reset.type = 'button';
      U.css(reset, { position: 'absolute', left: '0', bottom: '-4px' });
      box.appendChild(reset); stage.appendChild(box);
      ctx.on(reset, 'click', function () {
        Array.prototype.slice.call(box.querySelectorAll('.grab')).forEach(function (n) { n.remove(); });
        names.forEach(function (n, i) { addCard(n, i); });
      });
      ctx.hint('阈值 110px；删除动画结束后才从列表移除');
    }
  });

  /* 9. Stacked Card Scroll */
  UIK.register('patterns', {
    en: 'Stacked Card Scroll', zh: '卡片堆叠滚动',
    desc: '顶部卡片到达边界后固定，后续卡片上移并压成一摞；压缩、缩放与层级由后方卡片数量决定。',
    hint: '向上滚动列表；前面的卡片会被压成堆叠，不会突然消失。',
    mount: function (stage, ctx) {
      var sc = U.el('div'); U.css(sc, {
        width: '100%', height: '200px', overflowY: 'auto', overflowX: 'hidden', position: 'relative', paddingBottom: '10px'
      });
      var cards = [];
      ['第 1 条记录', '第 2 条记录', '第 3 条记录', '第 4 条记录', '第 5 条记录', '第 6 条记录'].forEach(function (t, i) {
        var c = U.el('div'); U.css(c, {
          position: 'sticky', top: '0', height: '92px', marginBottom: '10px', borderRadius: '12px',
          background: 'var(--d-panel)', border: '1px solid var(--d-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', color: 'var(--d-text)',
          transformOrigin: 'center top', willChange: 'transform'
        });
        c.textContent = t; sc.appendChild(c); cards.push(c);
      });
      stage.appendChild(sc);
      var dirty = true;
      ctx.on(sc, 'scroll', function () { dirty = true; }, { passive: true });
      var STICK = 0, STEP = 10, SHRINK = 0.05;
      function apply() {
        dirty = false;
        var top = sc.scrollTop;
        cards.forEach(function (c, i) {
          var start = i * (92 + 10);
          var passed = U.clamp((top - start) / (92 + 10), 0, 3);
          var y = -passed * STEP;
          var s = Math.max(1 - passed * SHRINK, 0.8);
          c.style.transform = 'translateY(' + y + 'px) scale(' + s + ')';
          c.style.opacity = String(Math.max(1 - passed * 0.18, 0.35));
          c.style.zIndex = String(10 + i);
        });
      }
      ctx.raf(function () { if (dirty) apply(); });
      ctx.hint('越多卡片上移，前面的压缩越深（每层 -5% / -10px）');
    }
  });

  /* 10. Expanding Tag Selection */
  UIK.register('patterns', {
    en: 'Expanding Tag Selection', zh: '标签挤开',
    desc: '选中标签稍微放大，邻近标签平滑向两侧让位；不重叠、不跳动，小屏自动换行。',
    hint: '点击标签；周围标签通过间距平滑让位，顺序保持不变。',
    mount: function (stage, ctx) {
      var box = U.el('div'); U.css(box, {
        width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'
      });
      var tags = ['全部', '进行中', '待跟进', '已成交', '已关闭', '高优先级', '本月新增'].map(function (t, i) {
        var b = U.el('button'); b.type = 'button';
        U.css(b, {
          background: 'var(--d-panel-2)', border: '1px solid var(--d-border)', color: 'var(--d-dim)', borderRadius: '999px',
          padding: '7px 12px', fontSize: '12px', cursor: 'pointer', minHeight: '34px',
          transition: UIK.isReduced() ? 'none' : 'transform .28s cubic-bezier(.34,1.56,.64,1),margin .28s cubic-bezier(.4,0,.2,1),background .2s,color .2s,border-color .2s'
        });
        b.textContent = t; box.appendChild(b); return b;
      });
      stage.appendChild(box);
      var cur = -1;
      tags.forEach(function (b, i) {
        ctx.on(b, 'click', function () {
          cur = cur === i ? -1 : i;
          tags.forEach(function (o, k) {
            var on = k === cur;
            o.style.background = on ? 'var(--d-accent)' : 'var(--d-panel-2)';
            o.style.color = on ? 'var(--d-panel)' : 'var(--d-dim)';
            o.style.borderColor = on ? 'var(--d-accent)' : 'var(--d-border)';
            o.style.transform = on ? 'scale(1.12)' : 'scale(1)';
            o.style.marginLeft = (k === cur + 1 || (on && k > 0)) ? '10px' : '0px';
            o.style.marginRight = (k === cur - 1) ? '10px' : '0px';
          });
        });
      });
      ctx.hint('用间距让位而不是绝对定位，换行也稳定');
    }
  });
})();
