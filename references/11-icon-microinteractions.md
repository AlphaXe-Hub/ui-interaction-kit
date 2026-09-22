# 图标交互动效｜Icon Micro-interactions

> 适用场景：App / 小程序 / 网页里，**图标本身**需要在状态变化或用户操作时给出反馈——这才是"动态图标"的真实含义。
> 边界：这里讲的是图标**怎么动**，不是"用哪套图标"。图标美术资源的来源与许可证见本文最后一节。

## 先澄清两件事

**一、没有哪个主流图标库是"自带交互动效"的。**
Iconsax、Lucide、Heroicons、Phosphor、Tabler 都只提供**静态 SVG**。你在宣传视频里看到的"动态图标"，是作者自己给静态图标叠了 CSS/JS 动效。所以要看的是动效模式，不是某个库。

**二、图标文件是美术资源，许可证和代码不是一回事。**
能不能把某个库的图标复制进你的仓库，取决于它的许可证（见文末对照表）。**本 Skill 的 demo 里所有图标都是自绘的基础几何图形**（圆、线、矩形路径），没有复制任何第三方图标库的图形设计；你要用具体某个库，按文末方式自行接入。

## 三条基本规则

1. **动效表达状态，不是装饰。** 每个图标动效都要能回答：它在表达什么状态变化（未选→选中、空闲→加载、有新消息、操作成功）。纯循环播放的图标动效在正式产品里通常是噪音，除了"加载中"这类确实持续的语义。
2. **图标小，动效要短。** 150–400ms 是常见区间；超过 500ms 在一枚 24px 图标上会显得拖沓。位移幅度同理——图标动效的位移一般不超过图标自身尺寸的 1/3。
3. **不改静态形态。** 动效结束后必须回到图标库定义的规范形态（同样的网格、线宽、圆角端点）。不要为了动效把图标改成非标准比例，否则整排图标会对不齐。

### 通用参数起点（需按项目调整，不是行业标准）
- 网格：24×24 `viewBox`
- 线宽：`stroke-width: 1.75`（细体 1.5 / 粗体 2）
- 端点与拐角：`stroke-linecap: round`、`stroke-linejoin: round`
- 颜色：跟随 `currentColor`，不要在路径里写死色值
- 时长：状态切换 180–260ms；一次性反馈 300–420ms
- `prefers-reduced-motion`：直接跳到终态，不留中间态

### 四件必须写清的事
触发方式（点击 / 状态变化 / 进入视口）、**起止形态**（哪个部件从哪到哪）、**是否可重复触发**（连点从当前状态接续，不重播）、**降级形态**（reduced-motion 下显示什么）。

---

## 1. Stroke Drawing｜描边绘制

图标像被"画"出来：路径随时间从起点延伸到终点。常用于加载完成、成功反馈、首屏引导。

**必须保留**
- 用 `stroke-dasharray` + `stroke-dashoffset` 从路径长度过渡到 0；路径长度取真实值（`getTotalLength()`），不要猜固定数字。
- 多段路径要**错峰**（各段起始延迟不同），否则整图标会同时"长出"。
- 与 `fill` 配合时，填充应在描边完成后才出现，不要一起涌上来。
- 只在需要时播放一次；避免每次滚动经过都重播。

```
Animate this icon as a drawn stroke. Measure each path's real length with getTotalLength() and animate stroke-dashoffset from that length to zero, staggering the paths so they draw one after another instead of all at once. Bring in any fill only after the strokes complete. Play it once on the intended trigger rather than every time it scrolls into view, keep the icon's grid, stroke width and round caps unchanged, and render the final state immediately under prefers-reduced-motion.
```

**验收**：路径长度真实测得、绘制连续；多段有先后；结束后 `dashoffset` 归零且不残留；连点不会卡在半笔。

---

## 2. Two-state Morph (Menu ↔ Close)｜双态形变

同一个图标在主/次状态间形变，最典型的是汉堡菜单变关闭。

**必须保留**
- 用**部件变换**实现：三条线的首尾两条 `translate + rotate` 成斜线，中间一条缩放淡出；不要让两条线凭空消失。
- 所有部件共享同一个 `transform-origin`（图标中心），否则会歪。
- 双向都可播：展开态回到收起态要走同一条路径。
- 中途反向点击从当前可见形态接续，不回到起点。

```
Create a two-state morphing icon where a hamburger menu becomes a close button. Move and rotate the top and bottom bars into the two diagonals while the middle bar scales down and fades out, all sharing the same centre transform origin so nothing drifts. Keep the morph reversible along the same path, and when the user clicks again mid-animation continue from the current visible shape instead of restarting. Respect prefers-reduced-motion by switching states instantly.
```

**验收**：两个状态都可复现且可逆；中线不出现"瞬间消失"；快速连点不错位；图标包围盒在各状态下一致。

---

## 3. Play ↔ Pause｜播放暂停切换

媒体类图标的状态切换：三角形与双竖线之间过渡。

**必须保留**
- 位移型交叉：三角 `scale` 收缩淡出、双线展开淡入（或反之），两者有**重叠时间**，不能先空一帧。
- 两个形态的视觉重量要接近（线宽、外接尺寸），否则切换时跳动。
- 状态更新立即提交，动画只是表达。

```
Build a play/pause toggle icon. Cross-fade between the two shapes with overlapping timing: the triangle shrinks and fades as the two bars grow and fade in, so there is never an empty frame between them. Keep both shapes visually equal in weight and outer size so the icon does not appear to jump, commit the media state immediately and let the animation only express it, make the toggle reversible mid-flight, and switch instantly under prefers-reduced-motion.
```

**验收**：切换无空白帧；两形态外接尺寸一致；状态与画面同步；连点稳定。

---

## 4. Like Pop｜点赞回弹

点击收藏/点赞时，图标从描边变填充并弹一下。

**必须保留**
- **填充切换 + 弹簧缩放**两件事同时发生，但填充是状态（立即或短过渡），弹跳是反馈。
- 缩放用弹簧或 overshoot 曲线（约 1.0 → 1.25 → 1.0），不是线性放大。
- 取消点赞要走**更弱**的路径（不弹或轻微回弹），不要同样用力。
- 连续点击不能累积缩放。

```
Implement a like button icon that switches from outline to filled and gives a spring pop when tapped. Animate the scale with an overshoot roughly 1.0 to 1.25 and back rather than a linear zoom, and change the fill as a separate state change, not part of the bounce. Make un-liking use a noticeably weaker motion than liking, prevent repeated taps from accumulating scale, and skip the bounce under prefers-reduced-motion while still switching the fill.
```

**验收**：弹跳是过冲回弹而非线性；取消时更克制；连点不叠加；reduced-motion 下填充仍正确切换。

---

## 5. Bell Ring｜铃铛摇铃

通知类图标的提醒动效。

**必须保留**
- 摆动以**顶部**为轴（`transform-origin: 50% 15%` 左右），角度**衰减**（如 ±12° → ±8° → ±4° → 0），不要等幅摆动。
- 摆动结束后必须精确回到 0°，不能留几度偏差。
- 徽标（未读数）的脉冲与摆动解耦：可独立出现，不要被铃铛角度带着转。
- 不要自动无限循环——那会变成持续干扰。

```
Animate a notification bell icon with a ringing motion. Use the top of the bell as the transform origin and oscillate with decaying amplitude (about 12, 8, 4 degrees, then settle at exactly zero) instead of a constant swing, and keep the unread badge independent so it can pulse on its own without being rotated by the bell. Play it only on the intended trigger rather than looping forever, allow re-triggering from the current angle, and show the resting state under prefers-reduced-motion.
```

**验收**：摆动角度递减、结束精确归零；徽标不被带动；不自动循环；重复触发不叠加角度。

---

## 6. Loading Spin｜旋转加载

可加载图标的旋转语义：刷新、同步、重试。

**必须保留**
- 旋转必须**围绕图标几何中心**（很多图标的路径包围盒中心与网格中心不重合，要显式设 `transform-box: fill-box` 或用网格中心）。
- 一次性动作（刷新）转完整圈后停下并落回标准朝向（0°）；持续动作（加载）才无限循环。
- 若同时表达进度，弧线与进度绑定，不要让弧线空转。
- 加载态必须有出口（超时、失败、完成），不能永远转下去。

```
Make a refresh icon spin for a one-shot action and a loading icon spin continuously, distinguishing the two. Rotate around the icon's true centre rather than its path bounding box, have the one-shot version complete a full turn and settle exactly at its standard orientation before stopping, and bind any progress arc to real progress instead of spinning it idly. Always provide an exit for the continuous state, and freeze to a static state under prefers-reduced-motion.
```

**验收**：旋转中心正确不偏心；一次性动作落回 0°；进度弧与真实进度一致；reduced-motion 下有静止替代。

---

## 7. Fill Wipe｜填充推进

描边图标被填充"灌满"，常见于收藏、星级评分、进度。

**必须保留**
- 填充按**方向推进**（如自下而上），用裁切或渐变遮罩实现，不是整体 `opacity` 淡入。
- 推进量由**真实比例**决定（评分 4/5 就停在 80%），不是固定动画。
- 描边与填充的边界要清晰，避免中间态出现"半透明描边 + 半透明填充"的糊状。
- 反向（降级评分）沿同一路径退回。

```
Implement a fill-wipe icon where the outline fills up progressively, for example a rating or bookmark icon filling bottom to top using a clip or gradient mask rather than a plain opacity fade. Drive the amount by the real value (four out of five stops at eighty percent) instead of a fixed animation, keep the boundary between outline and fill crisp so intermediate states do not look muddy, and reverse along the same path when the value decreases. Keep the final filled state crisp and skip the wipe under prefers-reduced-motion.
```

**验收**：推进方向明确；停点与真实数值一致；中间态不糊；可反向。

---

## 8. Follow Cursor｜图标跟随

图标内部元素（眼睛瞳孔、箭头指向）跟随指针或陀螺仪方向。

**必须保留**
- 位移要**限制在图标内部**（如瞳孔只在眼眶内移动），设最大偏移，不能跑出图形外。
- 指针离开后回中位，带回弹但不振荡。
- 用 `transform` 而非改路径，保证 60fps；别在每帧重算布局。
- 移动端不默认开启，触摸交互下改为按压/陀螺仪，并尊重"减少动态效果"。

```
Make an icon follow the pointer, for example the pupil of an eye icon tracking the cursor. Normalise the pointer position relative to the icon centre, clamp the movement so the inner element stays inside its container shape, and return to the neutral position with a damped settle when the pointer leaves. Animate with transforms only, never recompute layout per frame, provide a touch-friendly alternative instead of assuming hover, and keep the icon static under prefers-reduced-motion.
```

**验收**：内部元素不越界；离开可回中且不过冲；快速移动不抖动；触摸设备有替代方式。

---

## 第三方图标库：许可证对照与接入方式

**能不能把图标文件复制进你的仓库，取决于许可证，不取决于"它免费下载"。** 下表按"能否随项目再分发图标文件"排序，接入前请以各库当前官方说明为准。

| 图标库 | 许可证 | 能否随项目分发图标文件 | 接入方式 |
|---|---|---|---|
| **Iconsax** | 自定义（Free / Premium 两档） | **❌ 禁止再分发松散图标**（原文：*Redistribution (Loose Icons): FORBIDDEN! Neither loose nor in packs*）。允许"作为代码的一部分集成"并保留 notice；若项目本身是 UI Kit / 模板 / 框架这类数字物品，**必须署名 Iconsax** | 用官方包（`iconsax-react` / `iconsax-vue` / `vue-iconsax` 等）作为**依赖**安装；或在官网下载后按项目的依赖管理方式引入，不要复制进源码树再对外分发 |
| Lucide | ISC | ✅ 可以 | `npm i lucide` / `lucide-react` |
| Heroicons | MIT | ✅ 可以 | `npm i @heroicons/react` |
| Phosphor Icons | MIT | ✅ 可以 | `npm i @phosphor-icons/react` |
| Tabler Icons | MIT | ✅ 可以 | `npm i @tabler/icons` |
| Font Awesome Free | 图标 CC BY 4.0 / 字体 SIL OFL / 代码 MIT | ✅ 可以，**要求署名** | `npm i @fortawesome/free-solid-svg-icons` |

**判断口径**：许可证里出现 "no redistribution" / "may not redistribute the icons" / "as part of an application" 这类措辞时，**不要**把 SVG 复制进你的公开仓库，改成装依赖或在构建期拉取。反过来 ISC / MIT 的库可以放心内联。

**本 Skill 的选择**：demo 里的图标全部是自绘几何图形，因此本仓库（MIT）不携带任何第三方图标资源。你若要换成 Iconsax 等库的图标，把 demo 里的内联 `<svg>` 替换成对应库的组件即可——动效逻辑（`stroke-dashoffset`、`transform`、弹簧）与具体图形无关。

## 选型提示

| 用户想表达的 | 选这个词条 | 不要选 |
|---|---|---|
| "加载完成要有反馈" | Stroke Drawing 描边绘制 | Spinner（那是等待中，不是完成） |
| "菜单按钮点开要变叉" | Two-state Morph 双态形变 | 两个图标直接切换（会闪） |
| "播放器按钮要能切换" | Play ↔ Pause 播放暂停切换 | 换图标（会跳） |
| "点赞要有弹一下" | Like Pop 点赞回弹 | Ripple Feedback（那是开关组的涟漪） |
| "有新消息提醒一下" | Bell Ring 铃铛摇铃 | Toast（那是操作反馈文案） |
| "刷新要转一下" | Loading Spin 旋转加载 | Progress Bar（有确定进度时用进度条） |
| "评分要一格一格填" | Fill Wipe 填充推进 | 直接切整数（丢了过程） |
| "图标要看着鼠标" | Follow Cursor 图标跟随 | Layered Parallax（那是卡片分层） |
