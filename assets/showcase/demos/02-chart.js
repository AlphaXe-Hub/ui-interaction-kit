/* 02 图表交互 · Chart Interaction (7) */
(function () {
  var U = UIK.util, NS = 'http://www.w3.org/2000/svg';
  function E(tag, a, p) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) {
      // SVG 的 presentation attribute 不解析 var()，必须走 CSS 属性
      if ((k === 'fill' || k === 'stroke') && String(a[k]).indexOf('var(') === 0) e.style[k] = a[k];
      else e.setAttribute(k, a[k]);
    }
    if (p) p.appendChild(e);
    return e;
  }
  var LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  var SERIES = [
    { name: '销售额', color: 'var(--d-accent)', values: [42, 55, 48, 70, 66, 82, 74, 90, 86, 95, 88, 102] },
    { name: '回款额', color: 'var(--d-accent-2)', values: [28, 34, 40, 38, 52, 58, 55, 64, 70, 68, 76, 80] }
  ];

  function mkChart(host, cfg) {
    var W = 320, H = cfg.h || 168, pad = { l: 30, r: 10, t: 14, b: 24 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var svg = E('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, preserveAspectRatio: 'xMidYMid meet' });
    host.appendChild(svg);
    var api = {
      svg: svg, W: W, H: H, pad: pad, iw: iw, ih: ih, labels: cfg.labels, series: cfg.series,
      type: cfg.type || 'line', dom: { i0: 0, i1: cfg.labels.length - 1 }, vis: cfg.series.map(function () { return true; }),
      showDots: cfg.showDots !== false
    };
    api.xAt = function (i) {
      var n = api.dom.i1 - api.dom.i0 + 1;
      return pad.l + (n === 1 ? iw / 2 : (i - api.dom.i0) * iw / (n - 1));
    };
    api.yAt = function (v) { return pad.t + ih - (v / api.yMax) * ih; };
    api.toLocal = function (e) {
      var r = svg.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H);
      return { x: (e.clientX - r.left - (r.width - W * s) / 2) / s, y: (e.clientY - r.top - (r.height - H * s) / 2) / s };
    };
    api.nearest = function (lx, ly) {
      var best = null, bd = 1e9;
      api.series.forEach(function (s, si) {
        if (!api.vis[si]) return;
        for (var i = api.dom.i0; i <= api.dom.i1; i++) {
          var x = api.xAt(i), y = api.yAt(s.values[i]);
          var d = Math.abs(x - lx) + (ly == null ? 0 : Math.abs(y - ly) * 0.35);
          if (d < bd) { bd = d; best = { i: i, si: si, x: x, y: y, v: s.values[i], s: s }; }
        }
      });
      return best;
    };
    api.clear = function () { while (svg.firstChild) svg.removeChild(svg.firstChild); };
    api.draw = function () {
      api.clear();
      var max = 0;
      api.series.forEach(function (s, si) {
        if (!api.vis[si]) return;
        for (var i = api.dom.i0; i <= api.dom.i1; i++) max = Math.max(max, s.values[i]);
      });
      api.yMax = Math.ceil((max || 1) * 1.18 / 10) * 10 || 10;
      for (var g = 0; g <= 4; g++) {
        var y = pad.t + ih * g / 4;
        E('line', { x1: pad.l, y1: y, x2: pad.l + iw, y2: y, stroke: 'var(--d-track)', 'stroke-width': 1 }, svg);
        var t = E('text', { x: pad.l - 6, y: y + 3.5, fill: 'var(--d-dim-2)', 'font-size': 9, 'text-anchor': 'end' }, svg);
        t.textContent = Math.round(api.yMax * (1 - g / 4));
      }
      var step = Math.max(1, Math.ceil((api.dom.i1 - api.dom.i0 + 1) / 6));
      for (var i = api.dom.i0; i <= api.dom.i1; i += step) {
        var tx = E('text', { x: api.xAt(i), y: H - 7, fill: 'var(--d-dim-2)', 'font-size': 9, 'text-anchor': 'middle' }, svg);
        tx.textContent = api.labels[i];
      }
      // 命中层放在最底层：空白处由它接收事件，柱子/折线在上层可点击
      api.overlay = E('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: 'transparent', style: 'cursor:crosshair' }, svg);
      var g2 = E('g', null, svg);
      api.g = g2;
      if (api.type === 'bar') {
        var n = api.dom.i1 - api.dom.i0 + 1, bw = Math.min(20, iw / n * 0.6);
        for (var k = api.dom.i0; k <= api.dom.i1; k++) {
          api.series.forEach(function (s, si) {
            if (!api.vis[si]) return;
            var y = api.yAt(s.values[k]);
            var r = E('rect', {
              x: api.xAt(k) - bw / 2, y: y, width: bw, height: Math.max(pad.t + ih - y, 1),
              rx: 3, fill: s.color, opacity: .85, 'data-i': k
            }, g2);
            r.style.cursor = 'pointer';
          });
        }
      } else {
        api.series.forEach(function (s, si) {
          if (!api.vis[si]) return;
          var d = '';
          for (var i = api.dom.i0; i <= api.dom.i1; i++) d += (i === api.dom.i0 ? 'M' : 'L') + api.xAt(i) + ' ' + api.yAt(s.values[i]);
          E('path', { d: d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g2);
          if (api.showDots) for (var j = api.dom.i0; j <= api.dom.i1; j++)
            E('circle', { cx: api.xAt(j), cy: api.yAt(s.values[j]), r: 2.6, fill: 'var(--d-hole)', stroke: s.color, 'stroke-width': 1.6 }, g2);
        });
      }
      if (api.onDraw) api.onDraw();
    };
    api.draw();
    return api;
  }

  function stageRow(stage) { var d = U.el('div'); U.css(d, { width: '100%' }); stage.appendChild(d); return d; }
  function note(host, text) { var n = U.el('div', 'd-val'); n.style.marginTop = '6px'; n.textContent = text; host.appendChild(n); return n; }

  /* 1. Brush Selection */
  UIK.register('chart', {
    en: 'Brush Selection', zh: '框选',
    desc: '用户在图表上横向拖动选择时间或数据范围，选区外降饱和，可反向与清除。',
    hint: '在图上横向拖出选区；松手后显示区间，双击清除选区。',
    mount: function (stage, ctx) {
      var host = stageRow(stage), c = mkChart(host, { labels: LABELS, series: SERIES });
      var info = note(host, '未选择区间');
      var sel = null, drawing = false, x0 = 0;
      var rect = E('rect', { y: c.pad.t, height: c.ih, fill: 'rgba(110,168,254,.16)', stroke: 'var(--d-accent)', 'stroke-width': 1, opacity: 0 }, c.svg);
      ctx.on(c.svg, 'pointerdown', function (e) { drawing = true; x0 = c.toLocal(e).x; c.svg.setPointerCapture && c.svg.setPointerCapture(e.pointerId); });
      ctx.on(c.svg, 'pointermove', function (e) {
        if (!drawing) return;
        var x = U.clamp(c.toLocal(e).x, c.pad.l, c.pad.l + c.iw);
        var a = Math.min(x0, x), b = Math.max(x0, x);
        rect.setAttribute('x', a); rect.setAttribute('width', b - a); rect.setAttribute('opacity', 1);
      });
      ctx.on(c.svg, 'pointerup', function (e) {
        if (!drawing) return; drawing = false;
        var x = U.clamp(c.toLocal(e).x, c.pad.l, c.pad.l + c.iw);
        var a = Math.min(x0, x), b = Math.max(x0, x);
        if (b - a < 6) { rect.setAttribute('opacity', 0); info.textContent = '未选择区间'; return; }
        var i0 = Math.round((a - c.pad.l) / c.iw * (LABELS.length - 1)), i1 = Math.round((b - c.pad.l) / c.iw * (LABELS.length - 1));
        info.textContent = '已选：' + LABELS[i0] + ' – ' + LABELS[i1] + '（' + (i1 - i0 + 1) + ' 个月）';
      });
      ctx.on(c.svg, 'dblclick', function () { rect.setAttribute('opacity', 0); info.textContent = '未选择区间'; });
      ctx.hint('选区只影响视觉突出，不改变源数据');
    }
  });

  /* 2. Crosshair */
  UIK.register('chart', {
    en: 'Crosshair', zh: '十字线',
    desc: '指针位置生成垂直与水平参考线，并在轴上显示对应刻度，用于对齐数据点读数。',
    hint: '在图上移动指针；离开图表即消失。',
    mount: function (stage, ctx) {
      var host = stageRow(stage), c = mkChart(host, { labels: LABELS, series: SERIES });
      var vl = E('line', { stroke: 'var(--d-accent)', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, c.svg);
      var hl = E('line', { stroke: 'var(--d-accent)', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, c.svg);
      var bx = E('text', { y: c.H - 7, fill: 'var(--d-panel)', 'font-size': 9, 'text-anchor': 'middle', opacity: 0 }, c.svg);
      var bxr = E('rect', { y: c.H - 17, height: 12, rx: 3, fill: 'var(--d-accent)', opacity: 0 }, c.svg);
      var byr = E('rect', { x: 2, width: c.pad.l - 4, height: 12, rx: 3, fill: 'var(--d-accent-2)', opacity: 0 }, c.svg);
      var by = E('text', { x: c.pad.l - 6, fill: 'var(--d-panel)', 'font-size': 9, 'text-anchor': 'end', opacity: 0 }, c.svg);
      note(host, '悬停对齐读值');
      ctx.on(c.svg, 'pointermove', function (e) {
        var p = c.toLocal(e); p.x = U.clamp(p.x, c.pad.l, c.pad.l + c.iw); p.y = U.clamp(p.y, c.pad.t, c.pad.t + c.ih);
        var i = Math.round((p.x - c.pad.l) / c.iw * (LABELS.length - 1));
        var x = c.xAt(i), v = Math.round(c.yMax * (1 - (p.y - c.pad.t) / c.ih));
        vl.setAttribute('x1', x); vl.setAttribute('x2', x); vl.setAttribute('y1', c.pad.t); vl.setAttribute('y2', c.pad.t + c.ih); vl.setAttribute('opacity', .8);
        hl.setAttribute('x1', c.pad.l); hl.setAttribute('x2', c.pad.l + c.iw); hl.setAttribute('y1', p.y); hl.setAttribute('y2', p.y); hl.setAttribute('opacity', .45);
        bx.textContent = LABELS[i]; bx.setAttribute('x', x); bx.setAttribute('opacity', 1);
        bxr.setAttribute('x', x - 15); bxr.setAttribute('width', 30); bxr.setAttribute('opacity', 1);
        by.textContent = v; by.setAttribute('y', p.y + 3.5); by.setAttribute('opacity', 1);
        byr.setAttribute('y', p.y - 6); byr.setAttribute('opacity', 1);
      });
      ctx.on(c.svg, 'pointerleave', function () {
        [vl, hl, bx, bxr, by, byr].forEach(function (n) { n.setAttribute('opacity', 0); });
      });
      ctx.hint('竖线对齐最近数据点，横线读 Y 值');
    }
  });

  /* 3. Data Point Highlight */
  UIK.register('chart', {
    en: 'Data Point Highlight', zh: '数据点高亮',
    desc: '强调特定或重要的数据点：条件触发的最大值脉冲，加上指针最近点放大。',
    hint: '峰值点自动脉冲；移动指针时最近点放大，其余保持常态。',
    mount: function (stage, ctx) {
      var host = stageRow(stage), c = mkChart(host, { labels: LABELS, series: SERIES });
      var peak = E('circle', { r: 5, fill: 'none', stroke: 'var(--d-warn)', 'stroke-width': 2, opacity: .9 }, c.svg);
      var hover = E('circle', { r: 6, fill: 'var(--d-accent)', opacity: 0 }, c.svg);
      var info = note(host, '');
      var mi = 0, mv = -1;
      SERIES[0].values.forEach(function (v, i) { if (v > mv) { mv = v; mi = i; } });
      peak.setAttribute('cx', c.xAt(mi)); peak.setAttribute('cy', c.yAt(mv));
      info.textContent = '峰值：' + LABELS[mi] + ' 销售额 ' + mv + ' 万';
      ctx.on(c.svg, 'pointermove', function (e) {
        var p = c.toLocal(e), n = c.nearest(p.x, p.y);
        if (!n) return;
        hover.setAttribute('cx', n.x); hover.setAttribute('cy', n.y);
        hover.setAttribute('fill', n.s.color); hover.setAttribute('opacity', .95);
      });
      ctx.on(c.svg, 'pointerleave', function () { hover.setAttribute('opacity', 0); });
      if (!UIK.isReduced()) {
        ctx.raf(function (dt, now) {
          var k = 1 + Math.sin(now / 320) * 0.28;
          peak.setAttribute('r', (5 * k).toFixed(2));
          peak.setAttribute('opacity', (0.9 - (k - 1) * 1.1).toFixed(2));
        });
      }
      ctx.hint('高亮点不遮挡邻近点，也不改变数据含义');
    }
  });

  /* 4. Tooltip */
  UIK.register('chart', {
    en: 'Tooltip', zh: '数据提示框',
    desc: '查看某个数据点的详细信息：跟随最近点、边缘自动翻转、触摸设备用点击触发。',
    hint: '悬停或点击图上任意位置；提示框靠近边缘会翻转，不越出容器。',
    mount: function (stage, ctx) {
      var host = stageRow(stage); U.css(host, { position: 'relative' });
      var c = mkChart(host, { labels: LABELS, series: SERIES });
      var tip = U.el('div'); U.css(tip, {
        position: 'absolute', pointerEvents: 'none', background: 'var(--d-panel)', border: '1px solid var(--d-border)',
        borderRadius: '8px', padding: '6px 9px', fontSize: '11.5px', color: 'var(--d-text)', opacity: 0,
        transition: 'opacity .12s', whiteSpace: 'nowrap', zIndex: 5, boxShadow: '0 8px 20px rgba(0,0,0,.4)'
      });
      host.appendChild(tip);
      note(host, '桌面悬停 · 移动端点按');
      function show(e) {
        var p = c.toLocal(e);
        var rows = [], title = '';
        var i = U.clamp(Math.round((p.x - c.pad.l) / c.iw * (LABELS.length - 1)), 0, LABELS.length - 1);
        title = LABELS[i];
        SERIES.forEach(function (s, si) { if (c.vis[si]) rows.push('<div style="color:' + s.color + '">● ' + s.name + ' ' + s.values[i] + ' 万</div>'); });
        tip.innerHTML = '<div style="font-weight:600;margin-bottom:2px">' + title + '</div>' + rows.join('');
        var r = host.getBoundingClientRect();
        var lx = e.clientX - r.left + 12, ly = e.clientY - r.top - 10;
        tip.style.opacity = 1;
        var tw = tip.offsetWidth;
        if (lx + tw > r.width - 4) lx = e.clientX - r.left - tw - 12;
        tip.style.left = Math.max(2, lx) + 'px';
        tip.style.top = Math.max(2, ly) + 'px';
      }
      ctx.on(c.svg, 'pointermove', show);
      ctx.on(c.svg, 'pointerdown', show);
      ctx.on(c.svg, 'pointerleave', function () { tip.style.opacity = 0; });
      ctx.hint('内容更新无闪烁，指针离开即隐藏');
    }
  });

  /* 5. Legend Filter */
  UIK.register('chart', {
    en: 'Legend Filter', zh: '图例筛选',
    desc: '通过图例显示或隐藏数据系列，用于比较不同系列；至少保留一条系列可读。',
    hint: '点击图例切换显示；隐藏后 Y 轴会重算，全部隐藏时给出空状态。',
    mount: function (stage, ctx) {
      var host = stageRow(stage), c = mkChart(host, { labels: LABELS, series: SERIES });
      var row = U.el('div', 'd-row'); U.css(row, { marginTop: '8px', justifyContent: 'center' });
      var info = note(host, '当前显示 2 / 2 系列');
      SERIES.forEach(function (s, si) {
        var b = U.el('button'); b.type = 'button';
        U.css(b, {
          display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--d-chip)', border: '1px solid var(--d-border)',
          color: 'var(--d-text)', borderRadius: '999px', padding: '4px 11px', fontSize: '11.5px', cursor: 'pointer'
        });
        b.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:' + s.color + ';display:inline-block"></span>' + s.name;
        b.onclick = function () {
          var on = c.vis.filter(Boolean).length;
          if (c.vis[si] && on === 1) { info.textContent = '至少保留一条系列'; return; }
          c.vis[si] = !c.vis[si];
          b.style.opacity = c.vis[si] ? 1 : .42;
          b.style.borderColor = c.vis[si] ? s.color : 'var(--d-border)';
          c.draw();
          info.textContent = '当前显示 ' + c.vis.filter(Boolean).length + ' / 2 系列';
        };
        row.appendChild(b);
      });
      host.appendChild(row);
      ctx.hint('筛选只改变可见性，不修改源数据');
    }
  });

  /* 6. Zoom */
  UIK.register('chart', {
    en: 'Zoom', zh: '图表缩放',
    desc: '覆盖较大范围时查看局部趋势：滚轮或按钮缩放 X 轴区间，并提供重置入口。',
    hint: '滚轮缩放 / 按钮 ± / 双击重置；最小保留 3 个数据点。',
    mount: function (stage, ctx) {
      var host = stageRow(stage), c = mkChart(host, { labels: LABELS, series: SERIES, showDots: true });
      var row = U.el('div', 'd-row'); U.css(row, { marginTop: '8px', justifyContent: 'center' });
      var info = note(host, '区间：1月 – 12月');
      var min = 3, i0 = 0, i1 = LABELS.length - 1;
      function apply() {
        c.dom.i0 = i0; c.dom.i1 = i1; c.draw();
        info.textContent = '区间：' + LABELS[i0] + ' – ' + LABELS[i1] + '（' + (i1 - i0 + 1) + ' 点）';
      }
      function zoomAt(center, factor) {
        var span = i1 - i0 + 1, ns = U.clamp(Math.round(span * factor), min, LABELS.length);
        var ci = U.clamp(Math.round(center), 0, LABELS.length - 1);
        var r = Math.round((ci - i0) / Math.max(span - 1, 1) * (ns - 1));
        i0 = U.clamp(ci - r, 0, LABELS.length - ns); i1 = i0 + ns - 1; apply();
      }
      ctx.on(c.svg, 'wheel', function (e) {
        e.preventDefault();
        var p = c.toLocal(e), t = (p.x - c.pad.l) / c.iw * (LABELS.length - 1);
        zoomAt(t, e.deltaY > 0 ? 1.25 : 0.8);
      }, { passive: false });
      var minus = U.el('button', 'd-btn', '缩小 −'); var plus = U.el('button', 'd-btn', '放大 +'); var reset = U.el('button', 'd-btn', '重置');
      [minus, plus, reset].forEach(function (b) { b.type = 'button'; row.appendChild(b); });
      ctx.on(minus, 'click', function () { zoomAt((i0 + i1) / 2, 1.4); });
      ctx.on(plus, 'click', function () { zoomAt((i0 + i1) / 2, 0.7); });
      ctx.on(reset, 'click', function () { i0 = 0; i1 = LABELS.length - 1; apply(); });
      ctx.on(c.svg, 'dblclick', function () { i0 = 0; i1 = LABELS.length - 1; apply(); });
      host.appendChild(row);
      ctx.hint('缩放后标签自动抽稀，始终有重置入口');
    }
  });

  /* 7. Drill Down */
  UIK.register('chart', {
    en: 'Drill Down', zh: '数据下钻',
    desc: '从汇总数据进入更详细层级：点击数据元素下钻，用面包屑逐级返回。',
    hint: '点击柱子进入该月的周明细，点击面包屑返回上一层。',
    mount: function (stage, ctx) {
      var host = stageRow(stage);
      var WEEKS = LABELS.map(function (_, i) { return [0.2 + (i % 4) * 0.06, 0.28 - (i % 3) * 0.04, 0.22 + (i % 5) * 0.05, 0.3 - (i % 2) * 0.07].map(function (f) { return Math.round(SERIES[0].values[i] * f); }); });
      var level = 0, month = 0;
      var crumb = U.el('div', 'd-val'); U.css(crumb, { marginBottom: '6px', color: 'var(--d-dim)' });
      host.appendChild(crumb);
      var chartHost = U.el('div'); host.appendChild(chartHost);
      var c = null;

      function render() {
        if (c) { chartHost.innerHTML = ''; }
        if (level === 0) {
          crumb.textContent = '年度汇总 ›';
          c = mkChart(chartHost, { labels: LABELS, series: [SERIES[0]], type: 'bar' });
        } else {
          crumb.innerHTML = '<span style="cursor:pointer;color:var(--d-accent)" id="up">年度汇总</span> › ' + LABELS[month] + ' 周明细 ›';
          c = mkChart(chartHost, { labels: ['第1周', '第2周', '第3周', '第4周'], series: [{ name: '销售额', color: 'var(--d-ok)', values: WEEKS[month] }], type: 'bar' });
          var up = document.getElementById('up');
          if (up) up.onclick = function () { level = 0; render(); };
        }
        c.g.addEventListener('click', function (e) {
          if (level !== 0 || !e.target.getAttribute) return;
          var i = e.target.getAttribute('data-i');
          if (i != null) { month = +i; level = 1; render(); }
        });
      }
      render();
      ctx.clean(function () { chartHost.innerHTML = ''; });
      ctx.hint('下钻保留层级路径，返回后回到汇总视图');
    }
  });
})();
