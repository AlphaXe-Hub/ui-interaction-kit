# 即时反馈组件｜Instant Feedback Components

> 适用场景：App / 小程序里，用户**手指刚落下**就要看到回应的控件——筛选、输入、刻度、按压、长按。
> 与相邻分类的边界：「手势与反馈」（11）讲的是输入量到反馈的**映射数学**（速度、比例、阈值）；这里讲的是**控件本身的反馈形态**：反馈从哪长出来、周围怎么让位、松手回到哪、中途取消怎么办。

## 共享规则

1. **反馈延迟要小于 100ms。** 手指落下到视觉变化之间超过 100ms 就会被感知为"卡"。做法是**按下立即改样式**（哪怕只是一个底色或 1px 位移），把弹簧和回弹留给松手之后。
2. **反馈要有方向。** 从触点、从选中侧、从按下方向长出来。对勾从左侧长、光斑朝手指聚拢、卡片朝触点倾斜——方向对了才会有"直接"的手感。方向错了再顺滑也是装饰。
3. **状态先提交，动画后跟。** 选中数、字号、录音是否开始这类真实状态立即更新；动画负责表达。不要等动画结束才允许下一步操作。
4. **周围元素要让位，不能跳。** 宽度变化、标签增删、行数变化都会影响邻居——要么用布局动画，要么用 FLIP 把"跳变"转换成位移过渡。让位有延迟或瞬移，前面的细节就白做了。
5. **可取消、可反向、可重复。** 长按要能在阈值前松手取消；拖动要能反向；连点不能累积形变。中途打断时从**当前可见状态**接续。
6. **`prefers-reduced-motion` 下保留反馈但去掉运动**：改为即时切换 + 轻微颜色变化，核心功能不受影响。

### 通用参数起点（按项目调整）
- 按压反馈：`scale 0.97–0.98`、倾斜 ≤ 8°、180–260ms 回弹
- 宽度/尺寸变化：220–320ms，`cubic-bezier(.4,0,.2,1)` 或带轻微过冲
- 长按阈值：200–300ms（再长会被当作无响应）
- 吸附：进入 40% 刻度间距时吸附，松手后 180–240ms 落位

---

## 1. Multi-select Filter Chips｜多选筛选标签

一排标签中，选中的标签会从左侧长出对勾，底色铺满并平滑撑开宽度，旁边的标签同步让位，同时筛选按钮上的数字会跳动更新。

**必须保留**
- 对勾**从左侧长出来**（宽度 0 → 图标宽度 + 透明度淡入），不是整体淡入。
- 底色**铺满**（背景色从当前位置扩散或直接过渡到实心），不要只改文字颜色。
- 宽度**平滑撑开**，相邻标签跟着让位（用布局过渡或 FLIP），不要让它们瞬移。
- 计数先更新，**数字跳动**是表达；快速连点不能累积跳动或出现中间数。
- 选中是真实的筛选状态，动画不阻塞继续点下一个标签。

```
Build a row of multi-select filter chips. When a chip is selected, grow a checkmark out of its left edge (width from zero plus a fade), fill the background solid, and smoothly expand the chip's width so its neighbours shift aside instead of jumping. Update the filter count immediately and express it with a single pop on the button's number — never stack pops on rapid taps. Keep each chip's hit area stable while its visual width changes, keep the selected state reversible, and switch instantly under prefers-reduced-motion.
```

**验收**：对勾确实从左侧长出；邻居是平滑让位而非瞬移；数字与实际选中数一致且连点不叠加；命中区不随宽度变化漂移。

---

## 2. Removable Tag｜可删除的标签

输入框内的已选标签，点击删除叉号后，标签会先缩成一个圆点再消失，后面的标签依次平滑补位，输入框高度也随之收缩。

**必须保留**
- 删除路径是**先收缩成圆点，再消失**（两段），不要直接 `opacity: 0` 抹掉。
- 后续标签**平滑补位**：需要 FLIP（先记录位置 → 删除 → 用反向位移起手 → 过渡到 0），否则会瞬移。
- 容器高度收放也要过渡：先固定当前高度，改完内容再过渡到新高度，不要让它突然弹一下。
- 快速连续删除多个时，每个标签各自接续当前状态，不能因为抢动画而错位。
- 删除是不可逆操作时提供撤销或至少不要误触（叉号命中区要够大且与标签本体分开）。

```
Build a tag input with removable chips. Tapping a chip's remove control should first shrink the chip into a small dot and then fade it out, while the remaining chips slide smoothly into place — use FLIP (record positions, delete, apply the inverted offset, then animate to zero) so they do not jump. Animate the container's height from its previous value to the new measured height instead of snapping. Let each chip continue from its current state when several are deleted in quick succession, keep the remove control a comfortable separate hit target, and collapse instantly under prefers-reduced-motion.
```

**验收**：删除是"缩成圆点再消失"两段；剩余标签平滑补位无瞬移；容器高度过渡不弹跳；连续删除不错位。

---

## 3. Suggestion Popover｜输入联想浮层

在正文输入时，打出首字母会在光标旁弹出联想列表，随输入实时筛选，选中后以标签形式插入正文，浮层收起。

**必须保留**
- 浮层定位在**光标旁**（用 `Range.getBoundingClientRect()` 取真实光标矩形），并做视口边界翻转，避免被裁掉。
- **关键词边界必须明确**：中文连写没有词边界，用 `/([\u4e00-\u9fa5]{1,10})$/` 这类正则会把整句都当成关键词（"本周要重点跟进高"）。正确做法是要求触发符（`@`、`/`）并提取其后的内容；英文词片段自带边界（非字母字符结束）可以直接触发。不要试图用正则猜中文词边界。
- 随输入**实时筛选**，关键词高亮；没有匹配时给出明确空状态，而不是留一个空框。
- 选中项以**不可编辑的标签形式插入正文**（如 `contenteditable="false"` 的 span），插入后光标回到标签之后，浮层立即收起。
- 键盘可用：上下移动高亮、Enter 选中、Esc 取消；指针点击同效。
- 输入被清空或光标移出触发范围时，浮层要确定地关闭。

```
Build a mention-style suggestion popover inside a text editor. When the user types the first characters, open a list next to the caret positioned from the real caret rectangle (Range.getBoundingClientRect) and flip it near viewport edges. Filter the list live as they keep typing, highlight the match, and show an explicit empty state when nothing matches. Selecting an item inserts it as a non-editable inline tag, places the caret right after the tag, and closes the popover immediately. Support arrow keys, Enter and Escape as well as pointer clicks, and make sure the popover closes when the trigger text is cleared or the caret leaves it. Skip the open/close animation under prefers-reduced-motion.
```

**验收**：浮层贴着光标且不越出视口；筛选实时无闪烁；插入后是标签且光标位置正确；键盘全流程可用。

---

## 4. Font-size Ruler｜拨动字号刻度

键盘顶部有一排横向字号刻度，当前值居中高亮，两侧渐隐。左右拨动时，正文字号实时变化，停止后吸附到最近的刻度。

**必须保留**
- 当前值**居中**（刻度条整体位移让当前刻度对齐容器中心），不是靠滚动位置碰巧对齐。
- 两侧**渐隐**（用 `mask-image` 或透明度渐变），不要硬裁边。
- 拨动期间**字号实时变化**（直接映射，不加过渡）；只有松手后的吸附才用动画。
- 松手**吸附到最近刻度**，可结合速度轻微过冲，但必须落在整数刻度上。
- 提供键盘/点击的等价操作（左右方向键、点某个刻度直接选），不能只有拖动可用。

```
Build a horizontal font-size ruler above the keyboard. Keep the current value centred and highlighted with the neighbouring values fading toward both edges, and translate the ruler so the active tick sits exactly at the container centre rather than relying on scroll position. While the user drags, map the offset straight to the body font size with no transition so it feels attached to the finger; only the snap after release is animated, and it must land exactly on a tick (allowing a slight overshoot from release velocity). Provide arrow-key and click equivalents so the ruler is usable without dragging, and apply changes instantly under prefers-reduced-motion.
```

**验收**：当前刻度严格居中、两侧渐隐；拖动时字号跟手无滞后；松手落在整数刻度；键盘可完成同样的操作。

---

## 5. Press-tilt Card｜按压倾斜卡片

按压卡片时，卡片会向触点方向轻微倾斜并缩小，背后的光斑也会向手指聚拢，松手后弹性复原。

**必须保留**
- 倾斜方向由**触点相对卡片中心的位置**决定（`rotateX/rotateY`），并设角度上限（≤ 8°），不要用固定方向。
- 同时**轻微缩小**（0.97–0.98），两者一起构成"按下去"的物理感。
- 背后光斑**朝触点聚拢**（位移方向与触点同向），这是让卡片"活着"的关键，不要只做整体变亮。
- 松手**弹性复原**（带一次轻微过冲），且按下→松开走同一条路径可逆。
- 触摸与鼠标用同一套 pointer 事件；指针取消时确定复位。

```
Make a pressable card that tilts toward the touch point. On press, tilt the card using rotateX/rotateY derived from the pointer position relative to the card centre, capped at a small angle, and scale it down slightly at the same time. Also pull the glow behind the card toward the touch point rather than just brightening it, so the card feels alive. On release, spring back with a single subtle overshoot along the same path. Use pointer events so touch and mouse behave the same, reset deterministically if the gesture is cancelled, and keep the card's hit area and content fully readable throughout.
```

**验收**：倾斜方向随触点变化且有上限；光斑确实朝触点移动；松手有且仅有一次回弹；取消手势也能复位。

---

## 6. Hold-to-Record｜长按变录音条

长按底部的麦克风按钮，按钮组会横向拉长成录音条并显示实时波形，加号按钮会旋转成取消图标，松手后复原。

**必须保留**
- **长按阈值**（200–300ms）后才进入录音态；阈值前松手视为普通点击，不启动录音。
- 录制中可以**上滑取消**（或滑动后松手取消），并给出明确提示；取消是确定的结果，不能只是"没录到"。
- 按钮组**横向拉长**时，麦克风按钮位置尽量稳定（不要整条乱跑），加号**旋转 45° 变成取消**（两条线共用中心）。
- 波形要反映**实时输入**（音量或伪随机但平滑），不是固定循环动画；静音时波形也要贴近中线。
- 松手立即复原并给出结果反馈；权限被拒或设备不可用时必须有可理解的状态。

```
Build a hold-to-record control at the bottom. Pressing and holding the microphone for about a quarter of a second expands the button group horizontally into a recording bar with a live waveform, while the plus button rotates into a cancel icon around a shared centre — releasing before the threshold must be treated as a plain tap, not a recording. Keep the microphone anchored while the bar grows, drive the waveform from live input (or a smooth pseudo-random fallback that sits near the centre when silent) rather than a canned loop, and support sliding up to cancel with clear feedback. Restore on release, handle the denied-permission state, and skip the expansion animation under prefers-reduced-motion.
```

**验收**：阈值前松手不进入录音；长按后拉长且麦克风不漂；波形随输入变化、静音时贴中线；上滑取消结果明确；松手复原。

---

## 选型提示

| 用户想表达的 | 选这个词条 | 不要选 |
|---|---|---|
| "筛选点起来要有反馈" | Multi-select Filter Chips 多选筛选标签 | Expanding Tag Selection（那是单选放大挤开） |
| "已选标签能删掉" | Removable Tag 可删除的标签 | Curved Card Deletion（那是滑删卡片） |
| "输入时想给候选" | Suggestion Popover 输入联想浮层 | Dropdown（下拉是固定锚点，不跟光标） |
| "字号要拨着调" | Font-size Ruler 拨动字号刻度 | Velocity-Based Slider Snap（那是单个滑杆，不是刻度尺） |
| "按下去要有实体感" | Press-tilt Card 按压倾斜卡片 | Layered Parallax（那是悬停视差，不是按压） |
| "按住说话" | Hold-to-Record 长按变录音条 | Circle to Pill（那是展开成胶囊，不含录制语义） |

这 6 个里只有**筛选标签**和**录音**承载真实状态（选中集合、是否在录）；其余四个是纯反馈层。无论哪种，**状态都必须先于动画提交**。
