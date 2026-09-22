/* 12 图标交互动效 · Icon Micro-interactions (8)
   描边绘制 / 双态形变 / 播放暂停 / 点赞回弹 / 铃铛摇铃 / 旋转加载 / 填充推进 / 跟随指针
   所有图标均为自绘基础几何图形（24 网格、stroke 1.75、round 端点），未复制任何第三方图标库的图形设计 */
(function () {
  var U = UIK.util;
  var NS = 'http://www.w3.org/2000/svg';
  var seq = 0;

  /* 统一的图标壳：24 网格 / 1.75 线宽 / round 端点，颜色走 currentColor */
  function mkSvg(inner, size) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('width', size || 54);
    s.setAttribute('height', size || 54);
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.75');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.style.color = 'var(--d-text)';
    s.style.overflow = 'visible';
    s.style.display = 'block';
    if (inner) s.innerHTML = inner;
    return s;
  }
  /* transform-origin 用 fill-box，避免路径包围盒中心与网格中心不重合导致偏心 */
  var ORIGIN = 'transform-box:fill-box;transform-origin:center';

  function shell(stage, ctx, gap) {
    var box = U.el('div');
    U.css(box, {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: (gap || 18) + 'px', height: '104px'
    });
    stage.appendChild(box);
    return box;
  }

  /* 1. Stroke Drawing */
  UIK.register('icon', {
    en: 'Stroke Drawing', zh: '描边绘制',
    h: 214,
    desc: '图标像被画出来：路径从起点延伸到终点，多段路径错峰绘制，填充在描边完成后才出现。',
    hint: '点击重播：路径长度用 getTotalLength() 真实测量，圆环与对勾错峰绘制。',
    mount: function (stage, ctx) {
      var holder = U.el('div');
      U.css(holder, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' });
      var svg = mkSvg('<circle class="c1" cx="12" cy="12" r="8.6"/>' +
        '<path class="p1" d="M8.1 12.4l2.8 2.8 5.2-5.9"/>', 56);
      svg.style.color = 'var(--d-accent)';
      holder.appendChild(svg);
      var btn = U.el('button', 'd-btn primary', '重播绘制');
      U.css(btn, { fontSize: '12px' });
      holder.appendChild(btn);
      stage.appendChild(holder);

      var segs = [svg.querySelector('.c1'), svg.querySelector('.p1')];
      var lens = segs.map(function (s) { return s.getTotalLength(); });
      segs.forEach(function (s, i) {
        s.style.strokeDasharray = lens[i];
        s.style.strokeDashoffset = lens[i];
      });

      function play() {
        if (UIK.isReduced()) {
          segs.forEach(function (s) { s.style.transition = 'none'; s.style.strokeDashoffset = '0'; });
          return;
        }
        segs.forEach(function (s, i) {
          s.style.transition = 'none';
          s.style.strokeDashoffset = lens[i];
        });
        void svg.getBoundingClientRect();          // 强制回流，让下面的 transition 生效
        segs.forEach(function (s, i) {
          s.style.transition = 'stroke-dashoffset .58s cubic-bezier(.4,0,.2,1) ' + (i * 230) + 'ms';
          s.style.strokeDashoffset = '0';
        });
      }
      ctx.on(btn, 'click', play);
      ctx.on(svg, 'click', play);
      U.css(svg, { cursor: 'pointer' });
      play();
      ctx.hint('路径长度真实测得（' + Math.round(lens[0]) + ' / ' + Math.round(lens[1]) + '）；两段错峰 230ms');
    }
  });

  /* 2. Two-state Morph */
  UIK.register('icon', {
    en: 'Two-state Morph', zh: '双态形变',
    h: 200,
    desc: '同一图标的两个状态互相形变：三条线首尾位移旋转成斜线、中线缩放淡出，双向同路径可逆。',
    hint: '点击图标：汉堡变关闭再变回来；首尾两条线位移+旋转，中线缩放淡出，不凭空消失。',
    mount: function (stage, ctx) {
      var box = shell(stage, ctx);
      var svg = mkSvg('<path class="t" d="M4 7h16"/>' +
        '<path class="m" d="M4 12h16"/>' +
        '<path class="b" d="M4 17h16"/>', 54);
      U.css(svg, { cursor: 'pointer' });
      box.appendChild(svg);

      var t = svg.querySelector('.t'), m = svg.querySelector('.m'), b = svg.querySelector('.b');
      [t, m, b].forEach(function (el) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = 'center';
        UIK.tx(el, 'transform .3s cubic-bezier(.34,1.25,.64,1),opacity .22s');
      });

      var open = false;
      function toggle() {
        open = !open;
        t.style.transform = open ? 'translateY(5px) rotate(45deg)' : 'none';
        b.style.transform = open ? 'translateY(-5px) rotate(-45deg)' : 'none';
        m.style.transform = open ? 'scaleX(0)' : 'none';
        m.style.opacity = open ? '0' : '1';
        svg.setAttribute('aria-label', open ? '关闭' : '菜单');
      }
      ctx.on(svg, 'click', toggle);
      ctx.on(window, 'keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === svg) { e.preventDefault(); toggle(); }
      });
      svg.setAttribute('tabindex', '0');
      svg.setAttribute('role', 'button');
      ctx.hint('两态共享图标中心的 transform-origin；中线不瞬间消失，中途反向点击从当前形态接续');
    }
  });

  /* 3. Play <-> Pause */
  UIK.register('icon', {
    en: 'Play / Pause Toggle', zh: '播放暂停切换',
    h: 200,
    desc: '媒体图标在两个形态间切换：三角收缩淡出、双线展开淡入，两者有时间重叠，不出现空白帧。',
    hint: '点击图标切换：两个形态交叉过渡有重叠时段，外接尺寸与视觉重量保持一致，不跳。',
    mount: function (stage, ctx) {
      var box = shell(stage, ctx);
      var svg = mkSvg('<path class="play" d="M8.6 6.4 18 12l-9.4 5.6Z" fill="currentColor" stroke="none"/>' +
        '<g class="pause"><path d="M9.6 7.2v9.6"/><path d="M14.4 7.2v9.6"/></g>', 54);
      U.css(svg, { cursor: 'pointer' });
      box.appendChild(svg);

      var play = svg.querySelector('.play'), pause = svg.querySelector('.pause');
      [play, pause].forEach(function (el) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = 'center';
        UIK.tx(el, 'transform .26s cubic-bezier(.4,0,.2,1),opacity .26s cubic-bezier(.4,0,.2,1)');
      });
      pause.style.opacity = '0';
      pause.style.transform = 'scale(.6)';

      var playing = false;
      function toggle() {
        playing = !playing;
        play.style.opacity = playing ? '0' : '1';
        play.style.transform = playing ? 'scale(.55)' : 'scale(1)';
        pause.style.opacity = playing ? '1' : '0';
        pause.style.transform = playing ? 'scale(1)' : 'scale(.6)';
      }
      ctx.on(svg, 'click', toggle);
      ctx.hint('两形态交叉过渡（无空白帧）；状态立即提交，动画只做表达，连点从当前形态接续');
    }
  });

  /* 4. Like Pop */
  UIK.register('icon', {
    en: 'Like Pop', zh: '点赞回弹',
    h: 208,
    desc: '点赞时图标由描边变填充并弹一下；取消时走更弱的路径，连续点击不累积缩放。',
    hint: '点击心形：填充作为状态切换，弹跳是过冲回弹（1 → 1.26 → 0.95 → 1）；取消时明显更克制。',
    mount: function (stage, ctx) {
      var holder = U.el('div');
      U.css(holder, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' });
      var svg = mkSvg('<path class="h" d="M12 20.4s-7.3-4.5-7.3-9.5a4.2 4.2 0 0 1 7.3-2.8 4.2 4.2 0 0 1 7.3 2.8c0 5-7.3 9.5-7.3 9.5Z"/>', 56);
      U.css(svg, { cursor: 'pointer' });
      holder.appendChild(svg);
      var read = U.el('div', 'd-val', '未点赞');
      holder.appendChild(read);
      stage.appendChild(holder);

      var h = svg.querySelector('.h');
      h.style.transformBox = 'fill-box';
      h.style.transformOrigin = 'center';
      h.style.fill = 'transparent';
      UIK.tx(h, 'fill .2s,stroke .2s');

      var liked = false, busy = null;
      function toggle() {
        liked = !liked;
        h.style.fill = liked ? 'var(--d-danger)' : 'transparent';
        h.style.stroke = liked ? 'var(--d-danger)' : 'currentColor';
        read.textContent = liked ? '已点赞' : '未点赞';
        if (UIK.isReduced()) return;
        if (busy) busy.cancel();                    // 连点不累积缩放
        busy = h.animate(
          liked
            ? [{ transform: 'scale(1)' }, { transform: 'scale(1.26)' }, { transform: 'scale(.95)' }, { transform: 'scale(1)' }]
            : [{ transform: 'scale(1)' }, { transform: 'scale(.93)' }, { transform: 'scale(1)' }],
          { duration: liked ? 480 : 220, easing: 'ease-out' }
        );
      }
      ctx.on(svg, 'click', toggle);
      ctx.hint('填充是状态、弹跳是反馈，二者分开；取消动画刻意弱于点赞（220ms vs 480ms）');
    }
  });

  /* 5. Bell Ring */
  UIK.register('icon', {
    en: 'Bell Ring', zh: '铃铛摇铃',
    h: 208,
    desc: '通知图标的提醒动效：以铃铛顶部为轴、角度递减摆动并精确归零，徽标脉冲与摆动解耦。',
    hint: '点击铃铛：摆动角度逐次衰减并回到精确 0°；未读徽标独立脉冲，不被铃铛角度带着转。',
    mount: function (stage, ctx) {
      var box = shell(stage, ctx);
      var wrap = U.el('div');
      U.css(wrap, { position: 'relative', cursor: 'pointer' });
      var svg = mkSvg('<g class="bell" style="transform-box:fill-box;transform-origin:50% 0">' +
        '<path d="M12 3.9a5.4 5.4 0 0 0-5.4 5.4v3.1l-1.3 2.9h13.4l-1.3-2.9V9.3A5.4 5.4 0 0 0 12 3.9Z"/>' +
        '<path d="M10.2 18.3a1.9 1.9 0 0 0 3.6 0"/></g>', 54);
      wrap.appendChild(svg);
      var badge = U.el('div', null, '3');
      U.css(badge, {
        position: 'absolute', top: '-2px', right: '-4px', minWidth: '16px', height: '16px',
        padding: '0 4px', borderRadius: '999px', background: 'var(--d-danger)', color: '#fff',
        fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transformOrigin: 'center', lineHeight: '1'
      });
      wrap.appendChild(badge);
      box.appendChild(wrap);

      var bell = svg.querySelector('.bell');
      function ring() {
        if (UIK.isReduced()) return;
        bell.animate([
          { transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(10deg)' },
          { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-2deg)' },
          { transform: 'rotate(0deg)' }
        ], { duration: 900, easing: 'ease-out' });
      }
      function pulse() {
        badge.animate([
          { transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }
        ], { duration: 420, easing: 'ease-out' });
      }
      ctx.on(wrap, 'click', function () { ring(); pulse(); });
      ctx.hint('摆动以铃铛顶部为轴、角度递减（12→10→7→5→2→0）；徽标脉冲独立，不会被角度带偏');
    }
  });

  /* 6. Loading Spin */
  UIK.register('icon', {
    en: 'Loading Spin', zh: '旋转加载',
    h: 224,
    desc: '旋转语义：刷新类图标转完整圈后落回标准朝向，加载类才无限循环，并始终留出口。',
    hint: '点图标 = 刷新一次（转整圈后精确回到 0°且弧线回填）；点按钮 = 持续加载，可随时停。',
    mount: function (stage, ctx) {
      var holder = U.el('div');
      U.css(holder, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '13px' });
      var svg = mkSvg('<path class="arc" d="M20 12a8 8 0 1 1-2.35-5.66"/>' +
        '<path d="M20 3.6v4.4h-4.4"/>', 54);
      svg.style.color = 'var(--d-accent)';
      U.css(svg, { cursor: 'pointer' });
      holder.appendChild(svg);
      var btn = U.el('button', 'd-btn', '持续加载');
      U.css(btn, { fontSize: '12px' });
      holder.appendChild(btn);
      stage.appendChild(holder);

      var arc = svg.querySelector('.arc');
      var alen = arc.getTotalLength();
      arc.style.strokeDasharray = alen;
      arc.style.strokeDashoffset = '0';

      var spin = null;
      function once() {
        if (UIK.isReduced()) return;
        if (spin) { spin.cancel(); spin = null; btn.textContent = '持续加载'; }
        /* 一次性：转整圈并精确停回标准朝向 */
        svg.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
          { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });
        arc.style.transition = 'none';
        arc.style.strokeDashoffset = alen;
        void svg.getBoundingClientRect();
        arc.style.transition = 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)';
        arc.style.strokeDashoffset = '0';
      }
      function toggleLoop() {
        if (spin) {
          spin.cancel(); spin = null; btn.textContent = '持续加载';
          svg.style.transform = 'none';
          return;
        }
        if (UIK.isReduced()) { btn.textContent = '已停（减少动效）'; return; }
        spin = svg.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
          { duration: 900, iterations: Infinity });
        btn.textContent = '停止';
      }
      ctx.on(svg, 'click', once);
      ctx.on(btn, 'click', toggleLoop);
      ctx.hint('旋转围绕图标真实中心；一次性动作落回 0°，持续态可随时停（reduced-motion 不旋转）');
    }
  });

  /* 7. Fill Wipe */
  UIK.register('icon', {
    en: 'Fill Wipe', zh: '填充推进',
    h: 216,
    desc: '描边图标被自下而上填充推进，推进量由真实数值决定（评分 4/5 就停在 80%），可反向退回。',
    hint: '点击星星或按 +/−：填充按真实比例自下而上推进，停点与数值一致；减少动效时直接跳到终态。',
    mount: function (stage, ctx) {
      var uid = 'fw' + (seq++);
      var D = 'M12 3.4l2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9Z';
      var holder = U.el('div');
      U.css(holder, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' });
      var svg = mkSvg(
        '<defs><clipPath id="' + uid + '"><rect class="clip" x="-1" y="25" width="26" height="0"/></clipPath></defs>' +
        '<path d="' + D + '" stroke="currentColor" fill="none"/>' +
        '<path d="' + D + '" stroke="none" fill="var(--d-warn)" clip-path="url(#' + uid + ')"/>', 54);
      U.css(svg, { cursor: 'pointer' });
      holder.appendChild(svg);

      var bar = U.el('div', 'd-row');
      U.css(bar, { alignItems: 'center', gap: '8px' });
      var read = U.el('span', 'd-val', '');
      var minus = U.el('button', 'd-btn', '−');
      var plus = U.el('button', 'd-btn', '+');
      U.css(minus, { fontSize: '12px' }); U.css(plus, { fontSize: '12px' });
      bar.appendChild(minus); bar.appendChild(read); bar.appendChild(plus);
      holder.appendChild(bar);
      stage.appendChild(holder);

      var clip = svg.querySelector('.clip');
      var value = 3, MAXV = 5;
      clip.style.transition = UIK.isReduced() ? 'none' : 'y .34s cubic-bezier(.4,0,.2,1),height .34s cubic-bezier(.4,0,.2,1)';
      function paint() {
        var p = value / MAXV;
        var h = 25 * p;                       // 自下而上推进：y 从底边往上移
        clip.setAttribute('y', String(25 - h));
        clip.setAttribute('height', String(h));
        read.textContent = value + ' / ' + MAXV + '（填充 ' + Math.round(p * 100) + '%）';
      }
      function set(v) { value = U.clamp(v, 0, MAXV); paint(); }
      ctx.on(minus, 'click', function () { set(value - 1); });
      ctx.on(plus, 'click', function () { set(value + 1); });
      ctx.on(svg, 'click', function () { set(value >= MAXV ? 0 : value + 1); });
      paint();
      ctx.hint('推进方向自下而上、用 clipPath 裁切而非整体 opacity；停点与真实数值严格对应');
    }
  });

  /* 8. Follow Cursor */
  UIK.register('icon', {
    en: 'Follow Cursor', zh: '图标跟随指针',
    h: 224,
    desc: '图标内部元素跟随指针方向：瞳孔在眼眶内移动并限位，离开后回中位，不越界、不抖。',
    hint: '在区域内移动指针：瞳孔朝指针方向偏移并限制在眼眶内，离开后带阻尼回中；触摸设备点击也可用。',
    mount: function (stage, ctx) {
      var holder = U.el('div');
      U.css(holder, { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' });
      var pad = U.el('div');
      U.css(pad, {
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '104px',
        borderRadius: '10px', border: '1px dashed var(--d-border)', cursor: 'crosshair', touchAction: 'none'
      });
      var svg = mkSvg('<path d="M2.6 12S6.2 6.2 12 6.2 21.4 12 21.4 12 17.8 17.8 12 17.8 2.6 12 2.6 12Z"/>' +
        '<circle class="pupil" cx="12" cy="12" r="3.1" fill="currentColor" stroke="none"/>', 58);
      svg.style.color = 'var(--d-text)';
      pad.appendChild(svg);
      holder.appendChild(pad);
      var read = U.el('div', 'd-val', '瞳孔回中');
      holder.appendChild(read);
      stage.appendChild(holder);

      var pupil = svg.querySelector('.pupil');
      var MAX = 3.6;                                 // 限位：瞳孔不许跑出眼眶
      var tx = 0, ty = 0, cx = 0, cy = 0;

      function setFrom(clientX, clientY) {
        var r = svg.getBoundingClientRect();
        var dx = (clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (clientY - (r.top + r.height / 2)) / (r.height / 2);
        var len = Math.hypot(dx, dy) || 1;
        if (len > 1) { dx /= len; dy /= len; len = 1; }
        tx = dx * MAX * len;
        ty = dy * MAX * len;
      }
      ctx.clean(U.drag(pad, {
        onStart: function (e) { setFrom(e.clientX, e.clientY); },
        onMove: function (e) { setFrom(e.clientX, e.clientY); },
        onEnd: function () { tx = 0; ty = 0; }
      }));
      ctx.on(pad, 'pointerleave', function () { tx = 0; ty = 0; });

      ctx.raf(function (dt) {
        var k = 1 - Math.exp(-dt * 11);             // 阻尼跟随，离开后平滑回中
        cx += (tx - cx) * k;
        cy += (ty - cy) * k;
        pupil.setAttribute('cx', String(12 + cx));
        pupil.setAttribute('cy', String(12 + cy));
        read.textContent = (Math.abs(cx) < 0.15 && Math.abs(cy) < 0.15)
          ? '瞳孔回中'
          : '偏移 ' + cx.toFixed(1) + ', ' + cy.toFixed(1) + '（限位 ±' + MAX + '）';
      });
      ctx.hint('位移用 transform/属性而非重算布局，且限制在眼眶内（±3.6）；指针离开带阻尼回中');
    }
  });
})();
