# Copyable Prompt 模板与输出格式

## 一、交互描述五要素（任何提示词都必须覆盖）

1. **Component / object** — 哪个组件或界面对象。
2. **Trigger** — 什么触发（点击、长按、拖动、悬停、滚动、键盘、数据变化）。
3. **Start state / End state** — 开始与结束的形状、位置、尺寸、透明度。
4. **Motion** — 具体变化：位移、缩放、旋转、圆角、裁切、透明度、层级、弹簧或过冲参数、错峰延迟。
5. **Data vs visual state** — 数据状态何时更新，视觉状态何时更新，两者不一致时以谁为准。
6. **Constraints** — 响应式、键盘、触控（≥44px）、reduced-motion 降级、"不改写无关组件"。

## 二、通用英文模板（填空式）

```
Create [component] in my existing interface. It is triggered by [trigger].
Start state: [shape, size, position, opacity].
End state: [shape, size, position, opacity].
During the transition, animate [properties] with [duration / spring / easing], including [overshoot / stagger / clipping / mask] where noted.
The underlying data state must update [immediately / after the motion settles], and the visual state must follow the last valid user input even if the animation is interrupted.
On cancel or failure: [reverse along the original path / spring back / keep a readable state].
Support responsive layout, keyboard operation, touch targets of at least 44px, and provide a simple non-animated fallback for prefers-reduced-motion.
Clean up listeners, timers and render loops when the component unmounts.
Do not rewrite unrelated components and do not change the meaning of existing data.
```

## 三、落款统一拼接（高级交互模式专用）

```
Use the selected interaction pattern in my existing interface. Preserve the current visual style, layout language, and component structure. Do not rewrite unrelated components. Implement the trigger, state changes, start and end states, motion behavior, responsive behavior, keyboard accessibility, touch support, and reduced-motion fallback described below:
[Insert the selected English interaction prompt here]
```

## 四、输出格式（回答用户时）

**Selected interaction** — 英文名称 + 中文名称
**Why this fits** — 说明它解决的是"从哪里发生""落在哪里""谁跟着变化"还是"周围是否让位"，并说明为什么相近选项不合适
**Interaction behavior** — 触发方式、开始状态、变化过程、最终状态、取消或失败状态、移动端触控注意点
**Copyable prompt** — 一段纯英文提示词

## 五、常见错误

- 用"更高级""更有质感""更顺滑"作为完整需求。
- 用固定时长掩盖没有定义开始与结束状态的问题。
- 视觉反馈被写成真实功能变化（例如邻近开关跟着切换状态）。
- 中英双栏提示词；提示词里混入中文。
- 一次输出多个模式的混合体，或把整份词条表塞进一个页面。
