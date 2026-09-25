/* 13 即时反馈组件 · Instant Feedback Components (6)
   多选筛选标签 / 可删除标签 / 输入联想浮层 / 拨动字号刻度 / 按压倾斜卡片 / 长按变录音条 */
(function () {
  var U = UIK.util;
  var NS = 'http://www.w3.org/2000/svg';

  function tickSvg(size) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('width', size || 13);
    s.setAttribute('height', size || 13);
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '3');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.style.display = 'block';
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M5 12.5l4.4 4.4L19 7.6');
    s.appendChild(p);
    return s;
  }
  var MASK = 'linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)';

  /* 1. Multi-select Filter Chips */
  UIK.register('instant', {
    en: 'Multi-select Filter Chips', zh: '多选筛选标签',
    h: 226,
    desc: '选中标签时对勾从左侧长出、底色铺满、宽度平滑撑开，相邻标签同步让位，筛选按钮上的数字跳动更新。',
    hint: '点几个标签：对勾从左侧长出来、宽度撑开推着邻居让位；筛选按钮数字跳动更新，连点不累积。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' });

      var row = U.el('div');
      U.css(row, { display: 'flex', flexWrap: 'nowrap', gap: '8px', justifyContent: 'center', width: '100%' });

      var labels = ['近一周', '高意向', '已沟通', '有预算', '待跟进'];
      var reps = labels.map(function (text) {
        var chip = U.el('button');
        chip.type = 'button';
        U.css(chip, {
          display: 'inline-flex', alignItems: 'center', flex: '0 0 auto', padding: '7px 12px',
          borderRadius: '999px', border: '1px solid var(--d-border)', background: 'var(--d-panel)',
          color: 'var(--d-text)', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer',
          fontFamily: 'inherit',
          transition: UIK.isReduced() ? 'none'
            : 'background .24s,border-color .24s,color .24s,padding .28s cubic-bezier(.4,0,.2,1)'
        });
        var box = U.el('span');
        U.css(box, {
          display: 'inline-flex', alignItems: 'center', width: '0px', opacity: '0', overflow: 'hidden',
          transition: UIK.isReduced() ? 'none' : 'width .28s cubic-bezier(.34,1.15,.64,1),margin-right .28s cubic-bezier(.34,1.15,.64,1),opacity .16s'
        });
        box.appendChild(tickSvg());
        chip.appendChild(box);
        chip.appendChild(U.el('span', null, text));
        chip.setAttribute('aria-pressed', 'false');
        row.appendChild(chip);
        return { el: chip, tick: box, on: false };
      });
      wrap.appendChild(row);

      var foot = U.el('div');
      U.css(foot, { display: 'flex', alignItems: 'center', gap: '10px' });
      var btn = U.el('button', 'd-btn primary');
      U.css(btn, { fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' });
      var num = U.el('span', null, '0');
      U.css(num, { display: 'inline-block', minWidth: '10px', textAlign: 'center', fontWeight: '700' });
      btn.appendChild(document.createTextNode('筛选 '));
      btn.appendChild(num);
      var read = U.el('span', 'd-val', '未选条件');
      foot.appendChild(btn); foot.appendChild(read);
      wrap.appendChild(foot);
      stage.appendChild(wrap);

      var busy = null;
      function sync() {
        var picked = reps.filter(function (r) { return r.on; });
        num.textContent = String(picked.length);
        read.textContent = picked.length ? '已选：' + picked.map(function (r) { return r.el.textContent.trim(); }).join(' / ') : '未选条件';
        if (UIK.isReduced()) return;
        if (busy) busy.cancel();                    // 连点不累积跳动
        busy = num.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.55)' }, { transform: 'scale(1)' }],
          { duration: 320, easing: 'ease-out' }
        );
      }
      reps.forEach(function (r) {
        ctx.on(r.el, 'click', function () {
          r.on = !r.on;                             // 状态先提交
          r.el.setAttribute('aria-pressed', r.on ? 'true' : 'false');
          r.el.style.background = r.on ? 'var(--d-accent)' : 'var(--d-panel)';
          r.el.style.borderColor = r.on ? 'var(--d-accent)' : 'var(--d-border)';
          r.el.style.color = r.on ? 'var(--d-inv-text)' : 'var(--d-text)';
          r.tick.style.width = r.on ? '13px' : '0px';
          r.tick.style.marginRight = r.on ? '5px' : '0px';
          r.tick.style.opacity = r.on ? '1' : '0';
          sync();                                   // 宽度逐帧过渡 → 邻居自然让位
        });
      });
      sync();
      ctx.hint('对勾从左侧长出（宽度 0 →13px）；宽度逐帧过渡让邻居平滑让位；数字先更新再跳动');
    }
  });

  /* 2. Removable Tag */
  UIK.register('instant', {
    en: 'Removable Tag', zh: '可删除的标签',
    h: 232,
    desc: '点击标签上的叉号后，标签先缩成一个圆点再消失，后面的标签用 FLIP 平滑补位，输入框高度随之收缩。',
    hint: '点标签右侧的 ×：标签缩成圆点后消失，其余标签平滑补位、容器高度收缩；连续删也不错位。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' });

      var field = U.el('div');
      U.css(field, {
        display: 'flex', flexWrap: 'wrap', gap: '7px', alignContent: 'flex-start',
        minHeight: '92px', padding: '10px', borderRadius: '12px',
        border: '1px solid var(--d-border)', background: 'var(--d-chip)'
      });
      var words = ['跟进中', 'A 类客户', '华东区', '复购意向', '本周回访', '需报价', '老客推荐'];
      var tags = words.map(function (w) {
        var t = U.el('span');
        U.css(t, {
          display: 'inline-flex', alignItems: 'center', gap: '6px', flex: '0 0 auto',
          padding: '5px 6px 5px 10px', borderRadius: '999px', background: 'var(--d-panel)',
          border: '1px solid var(--d-border)', fontSize: '11.5px', color: 'var(--d-text)',
          overflow: 'hidden', boxSizing: 'border-box'
        });
        var lb = U.el('span', null, w);
        U.css(lb, { whiteSpace: 'nowrap' });
        var x = U.el('button', null, '×');
        x.type = 'button';
        U.css(x, {
          width: '17px', height: '17px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--d-track)', color: 'var(--d-dim)', fontSize: '12px', lineHeight: '1',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', fontFamily: 'inherit',
          flex: '0 0 auto'
        });
        x.setAttribute('aria-label', '删除 ' + w);
        t.setAttribute('data-tag', '');
        t.appendChild(lb); t.appendChild(x);
        field.appendChild(t);
        return t;
      });
      wrap.appendChild(field);

      var read = U.el('div', 'd-val', '共 ' + words.length + ' 个标签');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      function count() { return field.querySelectorAll('[data-tag]').length; }
      function collapse(tag) {
        if (!tag.isConnected) return;
        var lb = tag.firstElementChild;
        if (UIK.isReduced()) { tag.remove(); refresh(); return; }

        /* 第一段：缩成圆点 */
        tag.style.transition = 'width .22s cubic-bezier(.4,0,.2,1),height .22s cubic-bezier(.4,0,.2,1),padding .22s,margin .22s,opacity .2s';
        lb.style.transition = 'opacity .14s';
        lb.style.opacity = '0';
        tag.style.width = '10px';
        tag.style.height = '10px';
        tag.style.padding = '0';

        ctx.timeout(function () {
          /* 第二段：移除 + FLIP 补位 */
          var others = [];
          field.querySelectorAll('[data-tag]').forEach(function (o) { if (o !== tag) others.push(o); });
          var before = others.map(function (o) { return o.getBoundingClientRect(); });
          var oldH = field.offsetHeight;
          tag.remove();
          others.forEach(function (o, i) {
            var after = o.getBoundingClientRect();
            var dx = before[i].left - after.left, dy = before[i].top - after.top;
            if (!dx && !dy) return;
            o.style.transition = 'none';
            o.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            void o.offsetWidth;
            o.style.transition = 'transform .26s cubic-bezier(.4,0,.2,1)';
            o.style.transform = 'none';
          });
          var newH = field.scrollHeight;
          if (newH !== oldH) {
            field.style.height = oldH + 'px';
            field.style.overflow = 'hidden';
            void field.offsetHeight;
            field.style.transition = 'height .26s cubic-bezier(.4,0,.2,1)';
            field.style.height = newH + 'px';
            ctx.timeout(function () { field.style.height = ''; field.style.overflow = ''; field.style.transition = ''; }, 300);
          }
          refresh();
        }, 230);
      }
      function refresh() { read.textContent = '共 ' + count() + ' 个标签'; }
      tags.forEach(function (t) {
        var x = t.lastElementChild;
        ctx.on(x, 'click', function () { collapse(t); });
      });
      refresh();
      ctx.hint('删除分两段：先缩成 10px 圆点再移除；剩余标签用 FLIP 反向位移起手过渡到 0，容器高度同步收缩');
    }
  });

  /* 3. Suggestion Popover */
  UIK.register('instant', {
    en: 'Suggestion Popover', zh: '输入联想浮层',
    h: 250,
    desc: '在正文里打出首字母（或输入 @）就在光标旁弹出联想列表，随输入实时筛选，选中后以不可编辑的标签插入正文并收起浮层。',
    hint: '在框里输入「@高」或「a」：浮层贴着光标弹出并实时筛选，↑↓ 选择、Enter 或点击插入为标签，Esc 关闭。',
    mount: function (stage, ctx) {
      var DATA = ['高意向客户', '高价值订单', '高优先级', '待跟进', '待回访', '已沟通', '已报价',
        'A 类客户', 'B 类客户', 'Abby', 'Aaron', 'Alice'];

      var wrap = U.el('div');
      U.css(wrap, { width: '100%', position: 'relative' });

      var field = U.el('div');
      U.css(field, {
        minHeight: '96px', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--d-border)',
        background: 'var(--d-chip)', fontSize: '12.5px', lineHeight: '1.9', color: 'var(--d-text)',
        outline: 'none', position: 'relative'
      });
      field.contentEditable = 'true';
      field.spellcheck = false;
      field.textContent = '本周要重点跟进 ';
      wrap.appendChild(field);

      var pop = U.el('div');
      U.css(pop, {
        position: 'absolute', zIndex: 6, minWidth: '150px', maxHeight: '124px', overflowY: 'auto',
        padding: '5px', borderRadius: '10px', border: '1px solid var(--d-border)',
        background: 'var(--d-panel)', boxShadow: 'var(--d-shadow)', display: 'none',
        transition: UIK.isReduced() ? 'none' : 'opacity .12s'
      });
      wrap.appendChild(pop);
      stage.appendChild(wrap);

      var read = U.el('div', 'd-val', '在正文里输入「高」或「a」试试');
      U.css(read, { marginTop: '9px' });
      stage.appendChild(read);

      var hits = [], active = 0, kw = '', triggerLen = 0, anchorRange = null;

      function textBeforeCaret(range) {
        var pre = range.cloneRange();
        pre.selectNodeContents(field);
        pre.setEnd(range.endContainer, range.endOffset);
        return pre.toString();
      }
      function hide() {
        pop.style.display = 'none';
        hits = []; kw = ''; anchorRange = null;
      }
      function place(range) {
        var host = wrap.getBoundingClientRect();
        var r = range.getBoundingClientRect();
        var left = r.left - host.left;
        var top = r.bottom - host.top + 6;
        var over = left + 160 > host.width;
        if (over) left = Math.max(0, host.width - 164);
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
      }
      function render() {
        pop.innerHTML = '';
        if (!hits.length) {
          var empty = U.el('div', null, '没有匹配项');
          U.css(empty, { padding: '8px 9px', fontSize: '11.5px', color: 'var(--d-dim-2)' });
          pop.appendChild(empty);
          return;
        }
        hits.forEach(function (h, i) {
          var it = U.el('div');
          U.css(it, {
            padding: '6px 9px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
            color: i === active ? 'var(--d-inv-text)' : 'var(--d-text)',
            background: i === active ? 'var(--d-accent)' : 'transparent'
          });
          var p = h.toLowerCase().indexOf(kw.toLowerCase());
          if (p >= 0) {
            it.appendChild(document.createTextNode(h.slice(0, p)));
            var mark = U.el('strong', null, h.slice(p, p + kw.length));
            mark.style.color = i === active ? 'var(--d-inv-text)' : 'var(--d-accent)';
            it.appendChild(mark);
            it.appendChild(document.createTextNode(h.slice(p + kw.length)));
          } else {
            it.textContent = h;
          }
          /* mousedown：避免编辑器先失焦导致 Range 失效 */
          it.addEventListener('mousedown', function (e) { e.preventDefault(); pick(i); });
          pop.appendChild(it);
        });
      }
      function scan() {
        var sel = window.getSelection();
        if (!sel.rangeCount) return hide();
        var range = sel.getRangeAt(0);
        if (!field.contains(range.endContainer)) return hide();
        if (!range.collapsed) return hide();
        var tail = textBeforeCaret(range);
        /* 中文连写没有词边界，必须靠触发符 @ 界定；英文词片段自带边界，可直接触发 */
        var at = /@([^\s@]{0,10})$/.exec(tail);
        var word = at ? null : /([A-Za-z][A-Za-z0-9]{0,9})$/.exec(tail);
        if (!at && !word) return hide();
        kw = at ? at[1] : word[1];
        triggerLen = kw.length + (at ? 1 : 0);      // @ 也要一起替换掉
        var low = kw.toLowerCase();
        hits = DATA.filter(function (d) {
          return !low || d.toLowerCase().indexOf(low) >= 0;
        }).slice(0, 6);
        active = 0;
        /* 不缓存 Range：输入后旧的 Range 可能已失效，pick 时重新取光标 */
        anchorRange = range.cloneRange();
        place(range);
        pop.style.display = 'block';
        render();
        read.textContent = !kw
          ? '已输入触发符 @：列出全部候选'
          : (hits.length
            ? '关键词「' + kw + '」命中 ' + hits.length + ' 项'
            : '关键词「' + kw + '」无匹配（仍显示空状态）');
      }
      function pick(i) {
        var item = hits[i];
        if (!item) return;
        var sel = window.getSelection();
        if (!sel.rangeCount) return hide();
        var live = sel.getRangeAt(0);
        if (!field.contains(live.endContainer)) return hide();
        var node = live.endContainer;
        if (node.nodeType !== 3) return hide();       // 只在文本节点内做替换
        var endOff = live.endOffset;
        /* 用插入这一刻的节点真实文本重新解析关键词，
           不信 scan 时缓存的 kw —— 缓存一旦陈旧就会重复插入或漏删 */
        var seg = String(node.textContent).slice(0, endOff);
        var m = /@([^\s@]{0,10})$/.exec(seg) || /([A-Za-z][A-Za-z0-9]{0,9})$/.exec(seg);
        if (!m) return hide();
        var startOff = Math.max(0, endOff - m[0].length);

        var del = document.createRange();
        del.setStart(node, startOff);
        del.setEnd(node, endOff);
        del.deleteContents();

        var tag = U.el('span', null, item);
        tag.contentEditable = 'false';
        U.css(tag, {
          display: 'inline-block', padding: '1px 7px', margin: '0 2px', borderRadius: '6px',
          background: 'var(--d-accent)', color: 'var(--d-inv-text)', fontSize: '11.5px',
          fontWeight: '600', whiteSpace: 'nowrap'
        });
        var ins = document.createRange();
        ins.setStart(node, startOff);
        ins.collapse(true);
        ins.insertNode(tag);
        var after = document.createRange();
        after.setStartAfter(tag);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
        hide();
        read.textContent = '已插入标签：' + item;
        field.focus();
      }
      ctx.on(field, 'input', scan);
      ctx.on(field, 'click', scan);
      ctx.on(field, 'blur', function () { ctx.timeout(hide, 140); });
      ctx.on(field, 'keydown', function (e) {
        if (pop.style.display === 'none') return;
        if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, hits.length - 1); render(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
        else if (e.key === 'Enter') { e.preventDefault(); pick(active); }
        else if (e.key === 'Escape') { e.preventDefault(); hide(); }
      });
      ctx.hint('浮层位置来自光标真实矩形（Range.getBoundingClientRect）；插入用 Range.deleteContents + 不可编辑 span');
    }
  });

  /* 4. Font-size Ruler */
  UIK.register('instant', {
    en: 'Font-size Ruler', zh: '拨动字号刻度',
    h: 258,
    desc: '一排横向字号刻度，当前值居中高亮、两侧渐隐；左右拨动时正文字号实时变化，松手吸附到最近刻度。',
    hint: '左右拖动刻度尺（或按 ←→）：字号实时变化、当前刻度始终居中，松手吸附到整数刻度。',
    mount: function (stage, ctx) {
      var VALUES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 22];
      var TICK = 46;

      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' });

      var preview = U.el('div');
      U.css(preview, {
        height: '78px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '12px', border: '1px solid var(--d-border)', background: 'var(--d-panel)',
        color: 'var(--d-text)', lineHeight: '1.5', padding: '0 14px', textAlign: 'center'
      });
      preview.textContent = '正文字号随刻度实时变化';
      wrap.appendChild(preview);

      var ruler = U.el('div');
      U.css(ruler, {
        position: 'relative', height: '56px', overflow: 'hidden', borderRadius: '10px',
        border: '1px solid var(--d-border)', background: 'var(--d-hole)', cursor: 'grab',
        touchAction: 'none',
        maskImage: MASK, WebkitMaskImage: MASK
      });
      var track = U.el('div');
      U.css(track, {
        position: 'absolute', left: '0', top: '0', height: '100%', display: 'flex', alignItems: 'center',
        willChange: 'transform', transition: 'none'
      });
      var ticks = VALUES.map(function (v) {
        var t = U.el('div', null, String(v));
        U.css(t, {
          width: TICK + 'px', flex: '0 0 auto', textAlign: 'center', fontSize: '12.5px',
          color: 'var(--d-dim-2)', fontVariantNumeric: 'tabular-nums'
        });
        track.appendChild(t);
        return t;
      });
      var caretEl = U.el('div');
      U.css(caretEl, {
        position: 'absolute', left: '50%', top: '4px', width: '1px', height: '48px',
        background: 'var(--d-accent)', opacity: '.55', marginLeft: '-0.5px', pointerEvents: 'none'
      });
      ruler.appendChild(track); ruler.appendChild(caretEl);
      wrap.appendChild(ruler);

      var read = U.el('div', 'd-val', '');
      wrap.appendChild(read);
      stage.appendChild(wrap);

      var idx = 4, pos = 4, dragging = false, startX = 0, startPos = 0;
      function center() { return ruler.clientWidth / 2; }
      function paint() {
        var c = center();
        /* 当前刻度严格居中：整体位移 = 中心 - (当前连续位置 × 刻度宽) - 半个刻度 */
        track.style.transform = 'translateX(' + (c - pos * TICK - TICK / 2) + 'px)';
        var near = Math.round(pos);
        ticks.forEach(function (t, i) {
          var d = Math.abs(i - pos);
          t.style.color = i === near ? 'var(--d-accent)' : 'var(--d-dim-2)';
          t.style.fontWeight = i === near ? '700' : '400';
          t.style.fontSize = (12.5 + Math.max(0, 1 - d) * 3.5) + 'px';
        });
        var v = VALUES[U.clamp(near, 0, VALUES.length - 1)];
        preview.style.fontSize = v + 'px';
        read.textContent = '字号 ' + v + 'px' + (dragging ? ' · 拨动中（跟手）' : ' · 已吸附');
      }
      function setIdx(i, animate) {
        idx = U.clamp(i, 0, VALUES.length - 1);
        pos = idx;
        track.style.transition = animate && !UIK.isReduced()
          ? 'transform .24s cubic-bezier(.34,1.3,.64,1)' : 'none';
        paint();
      }
      ctx.clean(U.drag(ruler, {
        onStart: function (e) { dragging = true; startX = e.clientX; startPos = pos; ruler.style.cursor = 'grabbing'; },
        onMove: function (e) {
          /* 拖动期间连续不吸附，字号实时变化；只有松手才吸附 */
          pos = U.clamp(startPos - (e.clientX - startX) / TICK, 0, VALUES.length - 1);
          track.style.transition = 'none';
          paint();
        },
        onEnd: function () {
          dragging = false; ruler.style.cursor = 'grab';
          setIdx(Math.round(pos), true);
        }
      }));
      ctx.on(ruler, 'keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx(idx - 1, true); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setIdx(idx + 1, true); }
      });
      ruler.tabIndex = 0;
      ruler.setAttribute('role', 'slider');
      ruler.setAttribute('aria-label', '正文字号');
      ctx.on(window, 'resize', paint);
      setIdx(idx, false);
      ctx.hint('当前刻度严格居中（位移由连续位置推导）；拖动跟手不吸附，松手 240ms 吸附；两侧用 mask-image 渐隐');
    }
  });

  /* 5. Press-tilt Card */
  UIK.register('instant', {
    en: 'Press-tilt Card', zh: '按压倾斜卡片',
    h: 238,
    desc: '按压时卡片朝触点方向轻微倾斜并缩小，背后的光斑向触点聚拢，松手沿同一路径弹性复原。',
    hint: '按住卡片（可在按住时移动手指）：倾斜方向跟着触点走、光斑向手指聚拢，松手回弹一次。',
    mount: function (stage, ctx) {
      var wrap = U.el('div');
      U.css(wrap, { position: 'relative', width: '100%', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' });

      var glow = U.el('div');
      U.css(glow, {
        position: 'absolute', width: '150px', height: '150px', borderRadius: '50%',
        background: 'radial-gradient(circle, var(--d-accent) 0%, transparent 68%)',
        opacity: '.5', willChange: 'transform', pointerEvents: 'none'
      });
      wrap.appendChild(glow);

      var card = U.el('div');
      U.css(card, {
        position: 'relative', width: '78%', maxWidth: '258px', padding: '15px 16px', borderRadius: '14px',
        border: '1px solid var(--d-border)', background: 'var(--d-panel)', cursor: 'pointer',
        touchAction: 'none', willChange: 'transform', transformStyle: 'preserve-3d'
      });
      card.innerHTML =
        '<div style="font-size:12.5px;font-weight:600;color:var(--d-text)">按压反馈</div>' +
        '<div style="margin-top:5px;font-size:11.5px;line-height:1.6;color:var(--d-dim)">朝触点方向倾斜并轻微缩小，光斑向手指聚拢</div>';
      wrap.appendChild(card);
      stage.appendChild(wrap);

      var read = U.el('div', 'd-val', '未按压');
      U.css(read, { textAlign: 'center', marginTop: '8px' });
      stage.appendChild(read);

      var MAXT = 8, MAXS = 0.975;
      var rx = new U.Spring(0, 260, 21), ry = new U.Spring(0, 260, 21);
      var sc = new U.Spring(1, 300, 25), gx = new U.Spring(0, 220, 20), gy = new U.Spring(0, 220, 20);
      var pressed = false;

      function setFrom(e) {
        var r = card.getBoundingClientRect();
        var dx = U.clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
        var dy = U.clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
        ry.t = dx * MAXT;
        rx.t = -dy * MAXT;
        sc.t = MAXS;
        gx.t = dx * 20;
        gy.t = dy * 16;
      }
      function rest() {
        rx.t = 0; ry.t = 0; sc.t = 1; gx.t = 0; gy.t = 0;
      }
      ctx.clean(U.drag(card, {
        onStart: function (e) { pressed = true; setFrom(e); },
        onMove: function (e) { if (pressed) setFrom(e); },
        onEnd: function () { pressed = false; rest(); }   // 弹簧自然过冲一次
      }));
      ctx.on(card, 'pointerleave', function () { if (!pressed) rest(); });

      ctx.raf(function (dt) {
        rx.step(dt); ry.step(dt); sc.step(dt); gx.step(dt); gy.step(dt);
        card.style.transform = 'perspective(620px) rotateX(' + rx.v.toFixed(2) + 'deg) rotateY(' +
          ry.v.toFixed(2) + 'deg) scale(' + sc.v.toFixed(4) + ')';
        glow.style.transform = 'translate3d(' + gx.v.toFixed(2) + 'px,' + gy.v.toFixed(2) + 'px,0)';
        read.textContent = pressed
          ? '按压中：倾斜 ' + ry.v.toFixed(1) + '° / ' + rx.v.toFixed(1) + '°，缩放 ' + sc.v.toFixed(3)
          : (Math.abs(rx.v) > 0.1 || Math.abs(ry.v) > 0.1 ? '复原中（弹性）' : '未按压');
      });
      ctx.hint('倾斜由触点相对卡片中心推导、上限 8°；光斑同向位移 20px；松手用弹簧回弹一次');
    }
  });

  /* 6. Hold-to-Record */
  UIK.register('instant', {
    en: 'Hold-to-Record', zh: '长按变录音条',
    h: 246,
    desc: '长按麦克风超过阈值后按钮组横向拉长成录音条并显示实时波形，加号旋转成取消图标，松手复原。',
    hint: '按住麦克风约 0.25 秒进入录音（阈值前松手只是普通点击）；上滑 60px 取消，松手复原。',
    mount: function (stage, ctx) {
      var HOLD = 250, MAXW = 262, MINW = 116;

      var wrap = U.el('div');
      U.css(wrap, { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' });

      var bar = U.el('div');
      U.css(bar, {
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: '9px', width: MINW + 'px', padding: '7px 8px', borderRadius: '999px',
        border: '1px solid var(--d-border)', background: 'var(--d-panel)', overflow: 'hidden',
        transition: UIK.isReduced() ? 'none' : 'width .3s cubic-bezier(.4,0,.2,1)'
      });

      var wave = U.el('div');
      U.css(wave, {
        display: 'flex', alignItems: 'center', gap: '3px', height: '26px', flex: '1 1 auto',
        minWidth: '0', paddingLeft: '8px', opacity: '0',
        transition: UIK.isReduced() ? 'none' : 'opacity .2s'
      });
      var bars = [];
      for (var i = 0; i < 16; i++) {
        var bEl = U.el('div');
        U.css(bEl, {
          flex: '1 1 0', height: '14%', borderRadius: '2px', background: 'var(--d-accent)',
          opacity: '.85', willChange: 'height'
        });
        wave.appendChild(bEl);
        bars.push({ el: bEl, h: 0.14 });
      }
      bar.appendChild(wave);

      var plus = U.el('button');
      plus.type = 'button';
      U.css(plus, {
        width: '32px', height: '32px', flex: '0 0 auto', borderRadius: '50%', border: 'none',
        background: 'var(--d-track)', color: 'var(--d-text)', cursor: 'pointer', padding: '0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: UIK.isReduced() ? 'none' : 'transform .28s cubic-bezier(.34,1.3,.64,1),background .2s'
      });
      var plusSvg = document.createElementNS(NS, 'svg');
      plusSvg.setAttribute('viewBox', '0 0 24 24');
      plusSvg.setAttribute('width', '17'); plusSvg.setAttribute('height', '17');
      plusSvg.setAttribute('fill', 'none'); plusSvg.setAttribute('stroke', 'currentColor');
      plusSvg.setAttribute('stroke-width', '2'); plusSvg.setAttribute('stroke-linecap', 'round');
      plusSvg.innerHTML = '<path d="M6 12h12"/><path d="M12 6v12"/>';
      plus.appendChild(plusSvg);
      plus.setAttribute('aria-label', '更多');
      bar.appendChild(plus);

      var mic = U.el('button');
      mic.type = 'button';
      U.css(mic, {
        width: '42px', height: '42px', flex: '0 0 auto', borderRadius: '50%', border: 'none',
        background: 'var(--d-accent)', color: 'var(--d-inv-text)', cursor: 'pointer', padding: '0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none',
        transition: UIK.isReduced() ? 'none' : 'transform .2s'
      });
      var micSvg = document.createElementNS(NS, 'svg');
      micSvg.setAttribute('viewBox', '0 0 24 24');
      micSvg.setAttribute('width', '20'); micSvg.setAttribute('height', '20');
      micSvg.setAttribute('fill', 'none'); micSvg.setAttribute('stroke', 'currentColor');
      micSvg.setAttribute('stroke-width', '1.9'); micSvg.setAttribute('stroke-linecap', 'round');
      micSvg.innerHTML = '<rect x="9" y="3.2" width="6" height="10" rx="3"/><path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0"/><path d="M12 17.8v2.8"/>';
      mic.appendChild(micSvg);
      mic.setAttribute('aria-label', '按住说话');
      bar.appendChild(mic);
      wrap.appendChild(bar);

      var read = U.el('div', 'd-val', '按住麦克风开始');
      U.css(read, { fontSize: '11.5px', alignSelf: 'flex-start' });
      wrap.appendChild(read);
      stage.appendChild(wrap);

      var holdTimer = null, recording = false, cancelled = false, startY = 0, phase = 0;
      function enterRec() {
        recording = true; cancelled = false;
        bar.style.width = MAXW + 'px';
        wave.style.opacity = '1';
        plus.style.transform = 'rotate(45deg)';       // 加号 → 取消
        plus.style.background = 'var(--d-danger)';
        plusSvg.style.color = '#fff';
        mic.style.transform = 'scale(1.06)';
        read.textContent = '录音中… 上滑取消';
      }
      function exitRec(msg) {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        if (!recording) { read.textContent = msg || '按住麦克风开始'; return; }
        recording = false;
        bar.style.width = MINW + 'px';
        wave.style.opacity = '0';
        plus.style.transform = 'rotate(0deg)';
        plus.style.background = 'var(--d-track)';
        plusSvg.style.color = '';
        mic.style.transform = 'none';
        bars.forEach(function (b) { b.h = 0.14; b.el.style.height = '14%'; });
        read.textContent = msg || '已取消';
      }
      ctx.on(mic, 'pointerdown', function (e) {
        startY = e.clientY;
        if (UIK.isReduced()) { enterRec(); return; }  // 降级：直接进入，不做长按等待
        holdTimer = setTimeout(enterRec, HOLD);
      });
      ctx.on(window, 'pointermove', function (e) {
        if (!recording) return;
        if (startY - e.clientY > 60) { cancelled = true; read.textContent = '松手取消'; }
        else if (cancelled) { cancelled = false; read.textContent = '录音中… 上滑取消'; }
      });
      ctx.on(window, 'pointerup', function () {
        if (!recording) { exitRec('太短了：阈值前松手视为普通点击'); return; }
        exitRec(cancelled ? '已取消（上滑）' : '录音结束 · 已发送');
      });
      ctx.on(window, 'pointercancel', function () { exitRec('已取消'); });
      ctx.on(plus, 'click', function () {
        if (recording) exitRec('已取消');
        read.textContent = '更多操作（未录制）';
      });
      ctx.clean(function () { if (holdTimer) clearTimeout(holdTimer); });

      ctx.raf(function (dt) {
        phase += dt;
        if (!recording) return;
        /* 真实项目这里接 Web Audio 的 AnalyserNode 取真实音量；
           这里用平滑伪随机，静音时贴近中线 */
        bars.forEach(function (b, i) {
          var target = 0.12 + Math.abs(Math.sin(phase * 3.1 + i * 0.7)) * 0.5 + Math.random() * 0.22;
          b.h += (target - b.h) * Math.min(1, dt * 9);
          b.el.style.height = (b.h * 100).toFixed(1) + '%';
        });
      });
      ctx.hint('长按阈值 250ms，阈值前松手算普通点击；麦克风锚定不动、按钮组向左拉长；上滑 60px 取消');
    }
  });
})();
