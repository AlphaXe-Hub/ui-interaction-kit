# 03 App 高级交互模式｜10 种 Interaction Patterns

根据 APP 或小程序的界面需求判断合适的交互模式，并生成可直接交给 AI 的英文实现提示词。
重点判断：变化从哪里发生；操作最后落在哪里；哪些元素需要跟着变化；周围内容是否主动让位；动画结束后用户应看到什么结果。

**默认选择一个最匹配的主交互。** 确实包含多个时拆成主交互 + 辅助交互并说明关系。保留用户已有的视觉风格、组件结构与技术栈，不改写无关页面。
**所有 Copyable prompt 必须用英文**，不要在英文提示词中混入中文。

## 定位四问

| 判断问题 | 重点关注的交互 |
|---|---|
| 变化应该从哪里开始？ | Radial Theme Transition、Drag-to-Reorder |
| 操作最后应该停在哪里？ | Staggered Bulk Selection、Velocity-Based Slider Snap |
| 这次变化需要谁跟着回应？ | Spring Stepper Progress、Ripple Feedback for Related Switches |
| 周围内容要不要一起让位？ | Curved Card Deletion、Stacked Card Scroll、Expanding Tag Selection |

内容本身从隐藏变为显示 → 优先 Animated Text Disclosure。

---

## 1. Radial Theme Transition｜圆形主题切换

**场景**：点击主题切换按钮，从浅色切到深色，或在两套完整页面之间切换。
**必须保留**：以真实点击或触摸位置为圆心；圆的半径覆盖到最远的视口角落；两套页面尺寸与位置相同；只裁切上层页面，不缩放页面内容。

Copyable prompt：
Implement a radial theme transition for an app interface. When the user presses the theme toggle, reveal the new theme from the exact pointer or touch position as the center of an expanding circle. Calculate the circle radius based on the distance from the touch point to the farthest viewport corner. Keep both theme layers at the same scale and position, and clip only the top layer with a circular mask instead of scaling the page. Support mouse and touch input, respect prefers-reduced-motion, and use a simple fallback transition when needed.

## 2. Drag-to-Reorder｜拖拽排序

**场景**：拖动列表、卡片或任务项重新决定顺序。
**必须保留**：拖动项暂时脱离普通列表流；每一帧重新计算落点索引；其他项目形成明确空槽；每一项独立追赶新位置；中途停下时布局也停在当前状态。

Copyable prompt：
Create a draggable sortable list. When the user holds and drags one row, temporarily remove it from the normal list flow and calculate the insertion index continuously from the pointer position. The other rows should create a visible empty slot and move out of the way. Animate each row independently with a spring motion so the layout feels soft and staggered. Keep the dragged item attached to the pointer, prevent layout jumps, and support both touch and keyboard interactions.

## 3. Staggered Bulk Selection｜批量勾选

**场景**：点击全选或批量操作，让多条内容依次进入选中状态。
**必须保留**：状态立即更新，视觉反馈从第一项开始错峰；每个勾选出现时有轻微弹性放大；动画不阻塞继续操作。

Copyable prompt：
Implement a select-all interaction for a list of four items. When the user activates select all, update the selection state immediately but animate the checkmarks one by one with a short staggered delay from the first item to the last. Add a subtle elastic scale effect when each checkmark appears, then return each item to its normal size. Make the sequence feel deliberate without slowing down the actual state update, and support keyboard and screen-reader accessibility.

## 4. Velocity-Based Slider Snap｜滑杆惯性吸附

**场景**：拖动带刻度的滑杆选择数值、档位或目标值。
**必须保留**：记录释放速度；松手后允许滑块短距离冲过；再用弹簧回到最近有效刻度；最终值限制在合法范围内。

Copyable prompt：
Create a stepped slider for selecting a target value. Track the pointer velocity while the user drags. When the user releases the slider, let the thumb continue slightly past the release point based on the release velocity, then use a spring animation to pull it back to the nearest valid tick. Clamp the final value to the available range, make the overshoot subtle, and support mouse, touch, keyboard control, and reduced-motion preferences.

## 5. Animated Text Disclosure｜文本展开

**场景**：说明文字、详情或帮助信息在折叠与展开之间切换。
**必须保留**：根据真实内容高度调整容器；从当前高度连续过渡到目标高度；箭头旋转 180 度；文字不突然出现、布局不跳动。

Copyable prompt：
Create an animated text disclosure component for a collapsible description. When the user opens it, measure the real content height and animate the container from its current height to the measured height instead of suddenly revealing the text. When it closes, animate back to the collapsed height. Rotate the trailing chevron by 180 degrees to represent the two states, keep the content accessible to screen readers, and avoid layout jumps.

## 6. Spring Stepper Progress｜步骤条回弹

**场景**：完成表单、购买或设置流程中的一个步骤，推进到下一步。
**必须保留**：进度段先略微超过目标位置再回弹；完成、当前、未完成状态清晰区分；动画不改变真实步骤状态。

Copyable prompt：
Create a multi-step progress indicator. When the user completes a step, animate the next progress segment so it slightly overshoots its target and then settles back with a soft spring motion. Update the completed, current, and upcoming states clearly, keep the progress value accurate throughout the animation, and make the transition feel responsive without delaying navigation. Support keyboard accessibility and prefers-reduced-motion.

## 7. Ripple Feedback for Related Switches｜开关联动反馈

**场景**：一组相互关联的开关中切换其中一个，提醒用户它们属于同一组。
**必须保留**：当前开关正常改变状态；邻近开关只产生轻微震动或涟漪；邻近开关的真实开关状态不能被改变。

Copyable prompt：
Create a settings group with multiple toggle switches. When the user changes one switch, trigger a subtle ripple-like feedback effect that spreads to the neighboring switches. The neighboring switches may slightly shake or translate, but their actual on and off states must not change. The source switch should update normally, while the ripple remains purely visual feedback. Keep the effect contained within the group, support touch and keyboard input, and disable the motion for reduced-motion users.

## 8. Curved Card Deletion｜卡片曲线删除

**场景**：滑动删除卡片、消息或任务，让删除动作有明确去向。
**必须保留**：卡片沿曲线路径移动到删除图标或回收区域；移动中逐渐缩小、旋转、变淡；未达阈值可取消回原位；动画结束后再从数据源移除。

Copyable prompt：
Create a swipe-to-delete card interaction. When the user swipes a card past the delete threshold, animate the card along a curved path toward the delete icon or trash area. While moving, gradually reduce its scale, rotate it slightly, and fade its opacity. Remove the card from the data source after the exit animation completes. If the user releases before the threshold, smoothly return the card to its original position. Support touch, mouse, keyboard deletion, and reduced-motion preferences.

## 9. Stacked Card Scroll｜卡片堆叠滚动

**场景**：滚动一组有顺序的卡片或记录，保留已看过内容的空间线索。
**必须保留**：顶部卡片到达边界后暂时固定；后续卡片上移并把前面的压成一摞；压缩程度、缩放与层级根据后方卡片数量变化；内容不突然消失。

Copyable prompt：
Create a vertically scrollable card stack. When the top card reaches the top boundary, keep it pinned temporarily while the cards behind it move upward and compress into a visible stack. Calculate each card's vertical offset, scale, and depth based on how many cards are behind it. The more cards that move forward, the deeper and smaller the previous cards should become. Preserve the user's scroll context, avoid abrupt disappearance, and support touch, mouse wheel, and keyboard scrolling.

## 10. Expanding Tag Selection｜标签挤开

**场景**：从一行标签、筛选项或分类项中选择一项，需要突出当前选择。
**必须保留**：当前标签稍微放大；邻近标签平滑向两侧让位；元素不重叠、不突然跳动；小屏幕正确处理换行。

Copyable prompt：
Create a selectable tag list with animated layout reflow. When the user selects a tag, slightly enlarge the active tag and make the neighboring tags move aside to create enough space. The surrounding tags should smoothly translate rather than overlap or jump. Clearly show the selected state, preserve the original order of the tags, handle wrapping on smaller screens, and support mouse, touch, keyboard navigation, and reduced-motion preferences.

---

## 输出格式

**Selected interaction** — 英文名称 + 中文名称
**Why this fits** — 简短中文说明它解决的是"从哪里发生""落在哪里""谁跟着变化"还是"周围是否让位"
**Interaction behavior** — 触发方式、开始状态、变化过程、最终状态、取消或失败状态、移动端触控区域注意点
**Copyable prompt** — 一段英文提示词，含：具体组件/界面对象、触发方式、开始与结束状态、位移/尺寸/透明度/裁切/弹簧/过冲等具体变化、数据状态与视觉状态的关系、响应式/键盘/触控/reduced-motion 要求、"不要改写无关组件"

结尾统一拼接：
"Use the selected interaction pattern in my existing interface. Preserve the current visual style, layout language, and component structure. Do not rewrite unrelated components. Implement the trigger, state changes, start and end states, motion behavior, responsive behavior, keyboard accessibility, touch support, and reduced-motion fallback described below:
[Insert the selected English interaction prompt here]"

## 禁止事项

- 只说"加一个高级动画"。
- 把 10 种模式全部混在一起输出。
- 把视觉反馈误写成真实功能变化（例如让邻近开关跟着改变状态）。
- 用固定时长掩盖没有定义开始状态与结束状态的问题。
- 输出视频剪辑、配音、字幕或视频制作流程。
- 生成中英文双栏提示词。
