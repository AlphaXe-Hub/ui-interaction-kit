# 质感组件交互｜Texture Components

> 适用场景：App / 小程序里，靠组件**自身形态**的深浅变化产生层次感与动态感的六种细节。
> 与「高级交互模式」的区别：那 10 种是**流程级**交互（排序、勾选、删除、转场）；这 6 种是**组件级**的形态细节，通常不改变业务状态，只改变同一块内容怎么被看见。

## 共享规则

1. **状态先，动效后。** 勾选、选中、展开这类业务状态立即更新；动效只负责表达，不阻塞后续操作、不等待动画结束才允许下一次输入。
2. **文字与命中区域稳定。** 形变发生在容器轮廓上，正文保持可读；触摸命中区不小于 44×44，且不因为视觉缩放而漂移。
3. **写清四个状态。** 默认态、展开态、**收回路径**（原路返回还是直接消失）、以及快速重复输入时从哪里接续。
4. **不制造第二事实来源。** 填充宽度、托盘高度、图标缩放都是视觉表达，不能反过来当作业务数据的唯一存储。
5. **尊重 `prefers-reduced-motion`。** 改为直接切换或静态呈现，功能不依赖动效。
6. **一个有意义的细节就够。** 不要把这 6 种同时堆在一个组件上。

---

## 1. Overlapping Stack｜重叠排列

一组同类元素不排成一行，而是一个压住一个的小半边，末尾显示剩余数量。点击后依次散开成一整行并显示名称，再次点击收回。

**必须保留**
- 重叠比例一致（常用压住 1/3），最后一个位置放"剩余数量"徽标而不是第 N 个元素。
- 散开**依次**进行：用递增的 `transition-delay` 制造错峰；收回时用递减 delay，沿相反顺序收拢。
- 散开态每个元素显示名称，收起后名称淡出；整体宽度变化不要让容器跳动。
- 计数徽标在收起时可见、散开时隐藏（信息已被展开项取代）。
- 元素数量超过 5 个时不要全部展开，或展开后允许换行。

**Copyable prompt**
```
Create an overlapping stack component for a set of similar items. In the collapsed state the items overlap by one third and a trailing badge shows how many are hidden. Clicking the stack expands the items one by one into a full row with staggered timing and reveals each item's name; clicking again collapses them back to the overlapping state in reverse order. Animate width, margin and label opacity only, keep the container width stable so the surrounding layout does not jump, and make the count badge disappear once expanded. Support mouse, touch and keyboard activation, and jump straight to the expanded state under prefers-reduced-motion.
```

**验收**：收起/展开两个状态都可复现；错峰顺序与收回顺序相反；快速连点不会让元素卡在中间态或错位；展开后名称不截断。

---

## 2. Progress-fill Background｜进度底色

用组件背景的填充宽度表示完成进度。每勾选一项，底色就向前推一截，完成时整个组件会轻微提亮。

**必须保留**
- 填充层是**背景**，在内容之下（`position:absolute` + 内容 `z-index`），不能盖住文字或拦截点击。
- 填充宽度由真实完成比例推导（`done / total`），不是固定步进。
- 每勾选一项平滑前推；**取消勾选要能后退**，不是单调前进。
- 全部完成时给容器一个轻微提亮的结束态（底色或阴影变化一次，不要循环闪烁）。
- 填充色与文字保持足够对比，浅色主题下尤其要检查。

**Copyable prompt**
```
Implement a checklist component whose progress is shown by the fill width of its background. As each item is checked the background fill advances smoothly to the new completion ratio, and unchecking an item moves the fill back. Use a real ratio of completed items to total items rather than a fixed step, keep the fill layer behind the text so labels stay readable and clickable, and give the whole component a subtle brightness lift once everything is complete. Support keyboard toggling and prefers-reduced-motion.
```

**验收**：勾选/取消都连续；比例与真实完成数一致；文字始终可读可点；全部完成时提亮只发生一次。

---

## 3. Horizontal Accordion｜横向手风琴

多个组件并排竖放，平时只露出图标和竖排文字。点击某一条，它会横向展开变宽，露出完整内容，其他条则同步收窄。

**必须保留**
- 收起态**等宽**；展开态建议 2.5–3.5 倍宽度，展开项内容完整可见。
- 同一时刻只有一条展开（手风琴语义）；点击已展开的条是否收起要明确且保持一致。
- 收起态标题用竖排（`writing-mode: vertical-rl`）或截断，不能让文字溢出条外。
- 展开项内容在宽度到位后淡入，避免文字在窄条里先被挤压换行。
- 容器总高固定，展开不改变整块高度。

**Copyable prompt**
```
Build a horizontal accordion: several panels sit side by side as equal-width narrow bars showing only an icon and vertical text. Clicking one panel expands it to roughly three times its width and reveals the full content, while the other panels shrink to make room. Only one panel stays expanded at a time, the container height never changes, and the expanded content fades in after the width transition so text is never squeezed. Keep vertical titles legible when collapsed, and switch to a plain vertical stack on narrow screens. Support keyboard navigation and prefers-reduced-motion.
```

**验收**：各条宽度之和始终等于容器宽度，无溢出；展开内容不截断；连点不同条不会出现两条同时展开；窄屏有替代布局。

---

## 4. Component Tray｜组件托盘

在主组件下方垫一层深灰托盘，默认只露一行小字。点击托盘，它会从主组件下方抽出，露出更多明细，主组件位置保持不动。

**必须保留**
- **主组件不动**：托盘向下生长，主组件的 `top` 不变；不要用整体位移代替。
- 托盘用**次级底色**（比主组件更深/更弱），视觉上明确是"垫在下面"的一层。
- 收起时露出的那一行要有意义（如"共 12 条明细"），否则用户不知道托盘存在。
- 展开指示（箭头/加号）随状态旋转或切换。
- 托盘展开内容有独立滚动上限，不吃掉整页高度。

**Copyable prompt**
```
Add a tray layer underneath a main component. Collapsed, the tray only shows a single line of summary text in a darker secondary background; clicking it draws the tray down out of the main component and reveals detailed rows, while the main component itself does not move at all. Animate only the tray height and the disclosure indicator, cap the tray's expanded height with its own scroll, and make the visible summary line informative. Support click, touch and keyboard, and expand instantly under prefers-reduced-motion.
```

**验收**：展开过程中主组件坐标不变；收起态那一行可读且信息有效；明细超长时托盘内部滚动；连点不抖动。

---

## 5. Proximity-scale Icons｜跟手放大图标

组件里的一排小图标，在手指按住左右划动时，会跟随手指的距离平滑缩放，相邻图标同步让位。

**必须保留**
- 缩放因子来自**指针与图标中心的距离**（归一化后取平滑衰减），不是按索引固定放大。
- 相邻图标按同一衰减曲线**向外让位**，避免放大后互相压住。
- 只有按下/拖动期间激活；松手后平滑恢复，不保留残留位移。
- 触摸与鼠标共用一套 pointer 事件；指针离开或手势取消时确定复位。
- 未激活时保持静态，不要自动循环缩放（那是装饰噪音）。

**Copyable prompt**
```
Create a row of small icons that scale with pointer proximity. While the user presses and moves across the row, each icon scales smoothly based on the distance between the pointer and the icon center, and neighbouring icons shift aside along the same falloff so enlarged icons never overlap. Use one continuous falloff curve instead of a fixed scale per index, activate only during pointer interaction, and smoothly return everything to the resting state on release or pointer cancel. Keep the row's hit areas stable, support touch and mouse via pointer events, and disable the effect under prefers-reduced-motion.
```

**验收**：指针停在两个图标之间时两侧近似对称；快速划过无跳变；松手后全部复位；未交互时完全静止。

---

## 6. Pull-down Summary｜下拉摘要

页面顶部的一行小胶囊，下拉时会展开成一整块完整的统计面板，收起时则缩回一行。

**必须保留**
- **跟手**：拖动期间面板高度直接由位移映射，不做 CSS transition 追赶；松手后才弹簧收尾。
- 松手判定综合**位移与速度**：拖过阈值或快速下甩即展开，否则回弹收起。
- 收起态那一行始终显示关键摘要（如"本周 1,284 次"），不是空白胶囊。
- 展开内容在高度足够后才淡入，避免在窄高度里被压扁。
- 面板展开不能顶掉页面滚动；与页面纵向滚动冲突时明确手势归属。

**Copyable prompt**
```
Build a pull-down summary at the top of a page. Collapsed it is a single row of pills showing key stats; when the user drags it downward the panel height follows the pointer one to one, and on release it either expands into the full statistics panel or springs back to one row depending on distance and release velocity. Only the release is animated — during the drag the height maps directly to the finger with no CSS transition. The collapsed row must always show meaningful numbers, the expanded content fades in only after there is room for it, and the panel must not break page scrolling. Support touch and mouse drag, a click/keyboard fallback, and prefers-reduced-motion.
```

**验收**：拖动跟手无滞后；慢拖未过阈值与快甩都能得到预期结果；中途反向拖动可接管；收起后回到一行胶囊且摘要仍可读。

---

## 选型提示

| 用户想表达的 | 选这个词条 | 不要选 |
|---|---|---|
| "头像太多了挤不下" | Overlapping Stack 重叠排列 | Expanding Tag Selection（那是标签间距，不是重叠堆叠） |
| "让进度看得见" | Progress-fill Background 进度底色 | Progress Bar 加载进度条（那是异步任务，不是完成度） |
| "几个面板想省地方" | Horizontal Accordion 横向手风琴 | Tabs（Tabs 切换内容，不改变各自宽度） |
| "详情要有归属，又不想跳走" | Component Tray 组件托盘 | Drawer（抽屉会遮住原页面） |
| "这一排图标想让它活一点" | Proximity-scale Icons 跟手放大图标 | Center-focus Scaling（那是滚动中心聚焦） |
| "顶部只留一行，需要时展开" | Pull-down Summary 下拉摘要 | Bottom Sheet（从底部来，不是顶部下拉） |

这 6 个效果都**不改变业务数据**：展开、缩放、填充都只是同一份数据的另一种呈现；只有进度底色的勾选和折叠组件的开合会同步状态，且状态必须先于动画提交。
