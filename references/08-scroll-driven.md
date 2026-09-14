# 08 滚动驱动官网｜Scroll-Driven Official Site

**用途**：构建响应式、可直接上线的网站，用滚动位置驱动产品叙事 —— 开场镜头、横向滚动区段、可反向的爆炸视图。
**适用**：用户想要 Apple 风格的产品页或作品集页，页面视觉由滚动控制。
**不适用**：只要一段渲染视频。视频、静态拼贴、截图序列都不能替代网站本身。

交付物必须是一个能在浏览器里真实交互的页面。

---

## 先定页面故事

写组件之前先确定内容，并给每个区段分配职责：

1. **滚动驱动开场**：介绍一个产品或界面。
2. **横向滚动区段**：用户继续纵向滚动时，可以横向检视一排相关作品、功能或界面。
3. **滚动驱动爆炸视图**：按刻意安排的顺序解释一台实体产品的各个部件。

**只用内容真正需要的 pattern。** 三个都要时，必须是三个视觉上明确不同的区段，且中间有清晰过渡。不要把同一个卡片网格换个颜色就当成三个交互。

## 共享交互规则

- **滚动位置是唯一事实来源。** 用区段的实际起止位置推导归一化进度值，不要用估算或全局滚动比例。
- **用缓动映射**（如 `smoothstep` 或等价的 cubic 缓动）驱动视觉运动。物体运动时文字必须保持可读。
- **反向滚动必须沿同一条路径回到同一个状态。** 不要让页面上滚时跳到新状态。
- **主体必须留在页面的纵向安全区内。** 浏览器视口才是最终布局权威，不是设计稿截图。
- **固定场景用 `position: sticky`**，只在故事讲完后才解除固定。
- **不要给每次滚动更新挂 CSS `transition`。** 那会产生延迟、让物体追着滚动跑。用逐帧同步更新、动画库的 scrub 时间线，或一个小的插值循环。
- **保持物体与其内容的关系。** 屏幕纹理、标签、注释必须跟着它所描述的那个表面一起移动。
- **避免视觉疲劳**：一次有意义的推近或聚焦通常就够了。聚焦之后平移到下一个细节，而不是反复拉远拉近。

## Pattern 1：滚动驱动开场

做一个高区段，里面放一个 sticky 视口。产品在构图中央以闭合、折叠或视觉安静的状态开始。**第一次滚动应该揭示产品，而不是立刻用一个新卡片替换掉 Hero。**

开场通常按这个顺序：

1. 产品进入，或已处于闭合状态。
2. 用户开始滚动时，标题与辅助文案缓出。
3. 产品绕着**真实转轴**（hinge / fold / pivot）打开。
4. 产品移动时，界面或表面内容保持附着在它上面。
5. 产品稳定在打开状态，之后页面才释放进入下一段。

**笔记本例子**：屏幕绕底部铰链旋转，底座保持静止。不要把整台笔记本当成一张平面图整体旋转。没有真正的 3D 模型时，用**分离的屏幕层与底座层**并明确 `transform-origin`，或用已经包含正确透视的预渲染图像序列。

开场进度要与页面透明度解耦。一个可用的模型：

```js
const progress = clamp((scrollY - sectionStart) / (sectionEnd - sectionStart));
const opening = easeInOutCubic(progress);
const titleOpacity = 1 - smoothstep(0.08, 0.32, progress);
const screenAngle = lerp(-8, 96, opening);
```

具体数字取决于内容。真正要守住的约束是：**真实转轴、稳定底座、附着表面、可平滑反向的路径**。

## Pattern 2：横向滚动区段

固定一个视口，让横向轨道从右向左移动。用户继续纵向滚动，内容横向移动，**输入方向不变**。

用真实 DOM 尺寸计算位移：

```js
const distance = track.scrollWidth - viewport.clientWidth;
const progress = clamp((scrollY - sectionStart) / (sectionEnd - sectionStart));
track.style.transform = `translate3d(${-distance * easeInOutCubic(progress)}px, 0, 0)`;
```

- 区段必须保持固定，直到最后一张卡片或界面**完全进入视口**。
- 不要硬编码位移，否则最后一项会被裁掉，或轨道走完后留下一段空白。
- **字体加载、图片加载、resize 之后都要重新计算。**
- 每一项需要可读的层级：序号或分类、标题、简短说明、视觉本体。
- 轨道很长时提供可见的进度指示。
- 卡片宽度要足够检视内容；小屏幕改用**直接触控滚动、分页轮播或普通纵向堆叠**，不要把每张卡硬挤进窄列。

## Pattern 3：滚动驱动爆炸视图

适用于硬件、设备、组件系统，或任何需要解释内部结构的产品。产品保持视觉居中，独立部件按计划顺序分离。

**首选顺序**：

1. 完整产品状态。
2. 外壳先移开。
3. 内部驱动、主板或核心元件露出。
4. 网罩、缓冲、连接器或最后的细节件最后移动。
5. 标签与说明高亮当前部件。
6. 反向滚动让每个部件沿原路径装回。

只有当前层应该获得强烈强调。**不要一次把所有部件散开**，观看者必须始终知道该看哪里。装配状态要在时间线两端都可用，以便双向 scrub。

**素材策略（三选一）**：

- 带独立可寻址节点的真实 3D 模型。
- 每个部件一张透明渲染图或 SVG 图层。
- 浏览器无法产出所需透视或材质时，用预渲染状态序列。

> **诚实性约束**：如果素材只有一张普通产品照片，**不要声称隐藏的内部部件被准确重建**。要么索要合适素材，要么把结果明确标注为"概念可视化"。

用进度窗口，而不是让所有部件响应同一个值：

```js
const shell  = remap(progress, 0.16, 0.40);
const driver = remap(progress, 0.34, 0.64);
const detail = remap(progress, 0.58, 0.86);
```

每个 `remap` 结果都要**先缓动**再驱动位置、旋转、透明度或缩放。标签放在独立的 UI 层，这样模型运动时标签始终清晰。

## 视觉方向

目标是高端产品站的克制感：

- 先建立一小套 token：背景、文字、弱化文字、强调色、边框、阴影，然后再给区段做样式。
- 大量留白 + 强排版层级。标题、辅助文案、导航、交互提示不能和产品抢注意力。
- 优先一个主导的产品舞台，而不是多个悬浮卡片。
- 网格线、渐变、深度阴影、材质高光只在**帮助理解物体**时才用。
- 主场景变化时，导航与章节标签保持稳定。
- 每个 sticky 场景的底部要设计好，让下一段进入时不出现硬切或莫名的空白。

## 响应式与可访问行为

- 可用阅读空间发生实质变化时，**桌面与移动端分别设计构图**。
- 所有重要内容放在**语义化 HTML** 里，标题有层级，图片有有意义的 alt。
- 任何非纯装饰的控件都要有键盘与指针访问路径。
- 尊重 `prefers-reduced-motion`：产品与文字保持可见，**减少或移除 scrub 运动**，保持阅读顺序。
- WebGL 或重资源加载失败时页面仍要能讲故事，用精心设计的**海报帧或静态状态兜底**。
- 至少在目标手机宽度、更窄的手机宽度、平板宽度、桌面宽度四个尺寸测试，确认产品、标签、横向轨道最后一项都没有被裁切。

## 构建与评审流程

1. 改文件前先检查现有项目、框架、路由结构与素材管线。
2. 确认每台产品的真实内容与素材来源；使用外部素材时保留许可与署名。
3. 每个选定的 pattern 实现为**独立区段**，并带可测量的滚动范围。
4. **先做反向路径，再打磨正向路径。** 一个只能向下播放的滚动交互是不完整的。
5. 跑项目构建，并在浏览器里打开真实路由。
6. 在进度接近 **0 / 0.25 / 0.5 / 0.75 / 1** 处评审，另外还要看区段之间的**精确边界**。
7. 页面开着的时候改变窗口尺寸、素材加载后刷新，并检查 reduced-motion 路径。
8. 报告实际验证过的路由、素材与交互。**不要仅凭源码检查或构建成功就声称完成了浏览器验收。**

## 完成标准

以下全部成立才算可以示人：

- 开场从产品预期的闭合/安静状态开始，并绕正确的转轴打开。
- 标题与注释的淡出或位移不会与产品碰撞。
- 横向区段完整露出每一项，并在正确的时点解除固定。
- 爆炸视图一次只揭示一个可理解的层，反向滚动时能装回。
- 没有主体被裁切、压扁或被挤出移动端安全区。
- 页面有 reduced-motion 行为与可用的静态兜底。
- 真实浏览器路由已在**区段边界**与**反向滚动**时检查过。

汇报时给出：路由、素材来源、交互摘要、响应式行为，以及**实际跑过的检查**。除非用户另外要求渲染视频，否则不要交付纯视频产物。

---

## Copyable prompt（英文，交给 AI 实现）

```
Build a responsive, production-quality scroll-driven official site for [product].
Use the scroll position as the single source of truth and derive a normalized progress
value from each section's real start and end positions.

Sections (keep them visually distinct, with a clear transition between them):
1. Scroll-driven opening: a tall section with a sticky viewport. The product starts closed
   in the center; the title eases out as scrolling begins; the product opens around its real
   hinge with the base stable and the surface content attached; it settles into the open
   state before the section releases.
2. Horizontal scroll section: pin a viewport while a horizontal track travels right to left.
   Compute the distance from track.scrollWidth - viewport.clientWidth, keep the section pinned
   until the last item is fully inside, and recalculate after font loading, image loading and
   resize. On small screens switch to touch scrolling or a vertical stack.
3. Scroll-driven exploded view: keep the product optically centered while independent parts
   separate in a planned order (shell first, then the core component, then the final detail),
   with progress windows per part and labels in a separate UI layer. Reverse scroll must
   reassemble every part along the same path. Only the current layer gets strong emphasis.

Rules: drive visual motion with an easeInOutCubic / smoothstep mapping; never attach a CSS
transition to every scroll update (frame-synced updates or a small interpolation loop only);
keep the subject inside the vertical safe area; keep text readable while the object moves;
avoid repeated zoom in/out — one meaningful focus pass then pan to the next detail.
Add the reverse path before polishing the forward path.

Accessibility and fallback: semantic HTML with meaningful headings and alt text, keyboard and
pointer access for any non-decorative control, reduced-motion keeps the product and text
visible with scrubbed motion removed, and a designed static poster state if WebGL or a heavy
asset fails. Do not claim reconstructed internals unless the assets actually support it.

Verify in a real browser at progress 0 / 0.25 / 0.5 / 0.75 / 1 and at the exact section
boundaries, during reverse scrolling, after resize and asset load, and on the reduced-motion
path. Report the route, asset sources, interactions and checks actually run.
```

## 选型边界

| 情况 | 处理 |
|---|---|
| 用户只要一段视频/动图 | 不适用本分类，视频不能替代网站 |
| 内容量不足以撑起一个滚动区段 | 不要做，减少 pattern 数量 |
| 拿不到可分层素材 | 用 SVG 自绘概念可视化，并**明确标注**，不要假装重建了真实结构 |
| 目标设备以移动端为主 | 横向区段降级为触控滚动/纵向堆叠，开场与爆炸视图降低幅度 |
| 用户开启 reduced-motion | 保留产品与文字、移除 scrub、保留阅读顺序 |
