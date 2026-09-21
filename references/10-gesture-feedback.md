# 手势与反馈｜Gesture & Feedback

> 适用场景：App / 小程序里，用户的**输入方式**（捏合、快速滑动、下拉、拖拽、点选）需要立刻在视觉上得到明确回应，且这个回应本身要有物理感。
> 与相邻分类的边界：「质感动效」是元素跟着输入变形；「高级交互模式」是流程级状态变化；这里强调的是**输入 → 反馈的映射关系**（比例、速度、阈值、阻尼、可逆性）。

## 共享规则

1. **先确定映射关系，再写动画。** 每条都要能回答：输入是什么量（距离／速度／比例／阈值）、反馈是哪个属性、映射是线性还是带阻尼、上限是多少。
2. **视觉反馈 != 业务状态。** 模糊、反色、提亮、吸附都是呈现层；不因为视觉变化去改数据、改选中或删元素。真有状态变化时，状态先提交，动画后跟。
3. **可逆与可打断。** 反向输入要沿同一路径回到同一状态；动画进行中被再次输入时，从**当前可见位置**接续，不回到起点重播。
4. **必须有等价输入。** 捏合、双指、下拉这类手势在桌面和无触屏设备上要有替代（⌘/Ctrl + 滚轮、按钮、键盘、指针拖拽），不能只有触摸才能完成任务。
5. **帧同步。** 滚动/拖动驱动的更新用每帧读取真实值 + 直接写样式；不要给每次更新挂 CSS `transition`（会产生滞后和"追不上"的观感）。
6. **尊重 `prefers-reduced-motion`。** 运动模糊、弧线重排、拉伸这类强动效直接降级为静态或直接切换，功能保留。

---

## 1. Pinch to Zoom Density｜捏合改变内容密度

双指捏合在不同视图间切换，如大图、多列网格和列表文字。

**必须保留**
- 档位要**明确定义**（如大图 1 列 / 网格 3 列 / 文字行），捏合比例映射到档位，并在松手后吸附到最近档位——不是无级缩放图片。
- 切档改变的是**布局与元素尺寸**（重排），不是给整个列表加 `scale()`。图片本身可以随之换裁切方式，但文字必须重新排版保持清晰。
- 跨档过渡期间内容保持可识别，中途反向捏合能回到上一档。
- 触摸与桌面等价输入都要有：双指捏合 / ⌘、Ctrl + 滚轮 / 加减按钮。
- 记住用户上次选择的密度，下次进入沿用。

**Copyable prompt**
```
Add semantic pinch-to-zoom to a grid. Define discrete density levels — large single image, three-column grid, and compact text rows — and map the pinch ratio to those levels instead of scaling the image freely. Switching a level must re-flow the layout and re-measure each cell rather than applying a transform scale to the whole list, and the text must stay crisp and re-laid-out. Provide equivalent inputs for non-touch devices (Ctrl/⌘ + wheel, buttons or +/- keys), snap to the nearest level on release, allow reversing mid-gesture, remember the last chosen density, and switch layouts instantly under prefers-reduced-motion.
```

**验收**：三档都能到达且落位精确；中途反向捏合可回退；桌面用按钮或 Ctrl+滚轮可完成同样操作；文字在任何档位都清晰。

---

## 2. Scroll-driven Progress Animation｜滚动驱动进度动画

将动画进度与页面滚动位置绑定，滚动时动画正向播放，回滚时反向播放。

**必须保留**
- 进度由**容器真实的滚动范围**推导（`scrollTop / (scrollHeight - clientHeight)`），不用全局滚动比例，也不假设页面高度。
- 正向播放与反向倒放是同一条路径；停在滚动过程中的任意位置都是**合法且稳定**的状态，不需要补播到结尾。
- 帧同步更新，不加 CSS `transition`；动画不阻塞滚动。
- 与「滚动驱动官网」的区别：这里绑定的是**区块内一段动画**的进度，不负责整站叙事分段。

**Copyable prompt**
```
Bind this animation's progress to scroll position so it becomes a scroll-triggered, fully reversible animation. Derive progress from the actual scrollable range of its container (scrollTop divided by scrollHeight minus clientHeight) rather than a global page ratio, and let it rest at any intermediate position instead of snapping to the end. Update it frame-synced from the real scroll offset with no CSS transition attached, keep it reversible along the same path, and provide a static state under prefers-reduced-motion.
```

**验收**：慢滚、快滚、反向滚动都连续；停在中间不回弹不补播；容器尺寸变化后进度仍正确。

---

## 3. Velocity-based Motion Blur｜快速滚动拖影

在列表快速滚动时，为内容添加方向模糊，模拟拖影效果，提升运动感知。

**必须保留**
- 模糊强度来自**真实速度**（位置差 ÷ 时间差，并做平滑），不是滚动距离，也不是固定值。
- 方向必须与运动方向一致——用**方向性模糊**（对垂直滚动就是纵向拉伸的模糊核），不要拿各向同性的 `blur()` 冒充运动模糊。
- 设强度上限；速度归零后平滑恢复清晰；**静止时完全不模糊**（长期模糊是噪音，也影响可读性）。
- 只作用于滚动内容层，不作用于固定 UI（吸顶栏、滚动条、操作按钮）。
- `prefers-reduced-motion` 下直接不模糊。

**Copyable prompt**
```
Add velocity-based motion blur to a scrolling list. Compute the real scroll velocity from the position delta over the elapsed time, smooth it, and drive a directional blur whose axis matches the scroll direction — use an anisotropic blur kernel (for vertical scrolling, a vertically stretched blur) rather than a uniform blur, since uniform blur is not motion blur. Cap the strength, decay it smoothly back to zero when scrolling stops so stationary content is perfectly sharp, apply it only to the scrolling content layer and never to pinned UI such as headers or scrollbars, and disable the effect entirely under prefers-reduced-motion.
```

**验收**：快滑有明显拖影、慢滑几乎无；停止后 1–2 帧内恢复清晰；静止内容永不模糊；吸顶栏不受影响。

---

## 4. Rubber-band Header Stretch｜下拉拉伸顶部图片

当内容滚动到顶部后继续下拉，触发头部图片的拉伸放大，并让覆盖的文字同步淡出。

**必须保留**
- 只在 `scrollTop === 0` 且**继续下拉**时触发；上滑或已离开顶部时完全不介入。
- 放大作用于**图片本身**（`scale` + `transform-origin: top`），不是把整页往下推。
- 覆盖文字随下拉距离**同步淡出**，不是阈值一到就消失；上滑时同路径淡回。
- 阻尼：下拉越深越"费力"（位移映射为非线性），松手后带回弹收尾。
- 不劫持页面滚动；与浏览器原生 overscroll 行为冲突时，宁可让出控制权，也不要出现顶部空白缝。

**Copyable prompt**
```
Implement a rubber-band stretch on a header image. Only when the container is already at the top and the user keeps pulling down, scale the image itself from a top transform origin by the pull distance, and fade the overlaid text out in proportion to that distance. Make the pull non-linear so it gets progressively harder, spring back to rest on release, and never leave a blank gap at the top. Do not hijack normal page scrolling, reverse the same path when pulling up, and keep the plain scroll behaviour for touch, mouse drag and keyboard, with an instant state under prefers-reduced-motion.
```

**验收**：只在顶部下拉时触发；文字淡出与下拉距离成比例；松手回弹无残留位移；不产生顶部空缝；非顶部滚动完全不受影响。

---

## 5. Snap to Guides｜拖拽元素自动吸附

在画布上拖拽元素时，当它靠近参考线时自动吸附对齐，并显示辅助线和轻微的位置顿挫以提供视觉反馈。

**必须保留**
- 吸附要有**进入 / 退出两个阈值（迟滞）**，避免在边界来回抖动。
- 吸附是视觉位置向目标平滑混合，不是每帧直接把坐标传送过去；拖动期间仍要跟手。
- 对齐线在接近时出现、离开时消失，并明确显示当前吸附到哪条线（水平 / 垂直可分别吸附）。
- 吸附发生的那一帧给**一次**轻微顿挫（短促的回弹或缩放脉冲），不要持续抖动。
- 松手后才提交最终位置；移出吸附范围或取消手势后恢复正常控制。不隐藏真实坐标——吸附值应当可被读出。

**Copyable prompt**
```
Add snapping to guides while dragging an element on a canvas. Detect the distance to each guide and, once inside an enter threshold, snap to it and show the alignment line; use a separate, larger exit threshold so the snap does not flicker at the boundary. Blend the visual position toward the snapped target instead of teleporting coordinates, keep the drag following the pointer otherwise, and fire a single short recoil when a snap engages rather than continuous shaking. Show the alignment line only while a guide is active, commit the final position on release, restore free control when the pointer leaves the snap range, and support touch, mouse and keyboard nudging.
```

**验收**：靠近两条线时不会来回跳；吸附瞬间有反馈但不抖；离开阈值后恢复跟手；松手落位与显示的辅助线一致。

---

## 6. Arc Grid Reflow｜网格重排走弧线

当网格列数发生变化时（如从 2 列变为 3 列），让每个元素沿弧线移动到新位置，相邻元素的动画时间错开，营造自然的重排感。

**必须保留**
- 路径是**弧线**（二次贝塞尔或等效曲线），不是直线平移；控制点方向与移动方向垂直。
- 相邻项**错峰出发**（按索引给递增延迟），形成"依次游过去"的观感；错峰总量要小于总时长，避免最后一项明显迟到。
- 位置与尺寸**同步插值**，不要先改尺寸再移动。
- 快速连续切换列数时，从**当前中间位置**接续，不回到起点重播。
- 动画结束必须精确落到布局位置（不能有 1px 残留），结束后清掉临时定位。

**Copyable prompt**
```
Animate grid reflow along an arc when the column count changes. For every item, move it from its old position to its new one along a quadratic bezier curve instead of a straight line, with the control point offset perpendicular to the travel direction, and stagger the starts so items appear to travel one after another. Interpolate position and size together, keep the total stagger shorter than the duration, and make the animation continuous so a repeated column change resumes from the current mid-flight position instead of restarting. Land exactly on the final layout position with no residual offset, and switch layout instantly under prefers-reduced-motion.
```

**验收**：路径肉眼可辨为弧线；错峰自然、不整体齐动；连续快速切换不跳回起点；结束位置与静态布局完全一致。

---

## 7. Adaptive Contrast Overlay｜悬浮元素自动反色

悬浮在图片上的文字或按钮，会根据背后图像区域的明暗度，自动计算并切换为深色或浅色，确保文字与背景的对比度。

**必须保留**
- 采样的是**元素背后那块区域**的亮度，不是整张图的平均值，也不是写死的颜色。
- 深 / 浅之间**连续过渡**（交叉淡化或插值），滚动过程中不做硬切。
- 在临界亮度附近加**滞回**，避免来回闪烁。
- 对比度不足时优先保可读性——宁可加一层半透明底衬或文字阴影，也不要为了"纯反色"牺牲可读。
- 跨域图片读不到像素时要有兜底（同源图、服务端预计算、或自绘背景）；不要假设一定能读 canvas。
- 性能：不要在滚动中对每个元素逐像素读 canvas；用**预计算的亮度带**、降采样或分块平均。

**Copyable prompt**
```
Make floating elements (text and buttons) adapt their colour to what is behind them. Sample the brightness of the image region actually beneath each element — not a whole-image average — and cross-fade continuously between a light and a dark variant as the user scrolls, with no hard switch. Add hysteresis around the threshold so the colour does not flicker, and guarantee readability by adding a subtle backing scrim or text shadow when contrast would otherwise be too low. Keep the sampling cheap by using a precomputed brightness map or downsampled tiles rather than per-pixel canvas reads during scroll, provide a fallback for cross-origin images, and keep the plain readable state under prefers-reduced-motion.
```

**验收**：亮区文字自动变深、暗区变浅；跨过临界点不闪烁；滚动中过渡连续；采样成本不随滚动帧上升。

---

## 8. Focus Mode Selection｜选中项突出显示

在相册或列表选择场景中，选中的项目会放大提亮，而同层级的其他项目则降低饱和度、轻微缩小和模糊，以此引导用户注意力。

**必须保留**
- 选中项**放大 + 提亮**；同级未选中项**降饱和 + 轻微缩小 + 轻微模糊**，三者同时发生。
- 未选中项必须仍然**可读、可点击**：模糊要克制（建议 ≤ 2px），缩小幅度建议 ≤ 10%，命中区域不随视觉缩放漂移。
- 焦点跟随**最后一次**有效选择；快速连续点选时不残留中间态，不出现两项同时"选中"。
- 键盘可操作且有可见焦点；`prefers-reduced-motion` 下用即时切换。
- 降级是视觉层：不改变未选中项的数据状态，也不因为模糊而降低其对比度到不可读。

**Copyable prompt**
```
Implement a focus mode for a selection grid: the selected item scales up and brightens, while other items in the same level lose saturation, shrink slightly and blur a little, so attention stays on the current choice. Keep unselected items readable and tappable — cap the blur, keep the shrink small, and never shrink the hit area. Follow the last valid selection so rapid consecutive taps do not leave a half-applied state, support keyboard selection with a visible focus ring, and switch states instantly under prefers-reduced-motion.
```

**验收**：选中与未选中差异一眼可辨；未选中项仍清晰可点；连点不抖不错位；键盘可完整操作。

---

## 选型提示

| 用户想表达的 | 选这个词条 | 不要选 |
|---|---|---|
| "想在一屏里看更多或更少" | Pinch to Zoom Density 捏合改变密度 | Zoom（那是看局部趋势，不重排布局） |
| "这段动画跟着滚动走" | Scroll-driven Progress Animation 滚动驱动进度 | 滚动驱动官网（那是整站叙事） |
| "滑快点要有速度感" | Velocity-based Motion Blur 快速滚动拖影 | Shimmer（那是加载态高光） |
| "顶部图拉一下会变大" | Rubber-band Header Stretch 下拉拉伸顶部图片 | Shared-element Image Expansion（那是缩略图到全屏） |
| "拖拽时想对齐" | Snap to Guides 拖拽自动吸附 | Magnetic Attraction（那是向元素吸附，不是参考线） |
| "换列数时别那么生硬" | Arc Grid Reflow 网格重排走弧线 | Drag-to-Reorder（那是用户拖，不是布局变化） |
| "字压在图上看不清" | Adaptive Contrast Overlay 悬浮元素自动反色 | 靠加阴影硬撑（治标，且亮暗两侧不能同时成立） |
| "想让用户盯住选中项" | Focus Mode Selection 选中项突出显示 | Center-focus Scaling（那是滚动中心，不影响其他项） |

这 8 个词条里有 6 个**纯属呈现层**（捏合密度、拖影、拉伸、吸附、弧线重排、反色）；只有「网格重排走弧线」的列数切换和「选中项突出」的选择会带状态，且状态必须先于动画提交。
