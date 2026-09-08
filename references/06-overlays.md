# 06 弹窗组件｜7 种 Overlays

只说"弹个框"远远不够。不同弹窗在触发方式、内容承载与交互逻辑上差异巨大。

## 速查表

| 词条 | 触发方式 | 主要用途 | 关键特点 |
|---|---|---|---|
| Tooltip 文字提示 | 鼠标悬停 / 键盘聚焦 | 为图标、按钮提供简短说明 | 内容极少，不适合复杂操作 |
| Popover 气泡卡片 | 点击 | 展示比 Tooltip 更多的补充信息 | 可包含按钮，内容更丰富 |
| Dropdown 下拉菜单 | 点击 | 从一组选项或操作中做选择 | 选择后通常自动收起 |
| Drawer 抽屉 | 点击 | 在保留原页面的同时展示详情或编辑内容 | 从侧边滑入，不遮挡原页面主体 |
| Bottom Sheet 底部面板 | 点击 | 移动端常用，把操作放在拇指易触达位置 | 从屏幕底部向上展开，可下拉关闭 |
| Modal 模态框 | 点击 | 要求用户确认内容或做出决定 | 居中显示，有遮罩，阻断原页面操作 |
| Toast 轻提示（补充） | 系统或操作后自动触发 | 简短反馈结果，不打断当前流程 | 自动消失，不获取焦点，不阻断操作 |

## 描述四要素

1. **组件名称**：要哪种弹窗。
2. **触发方式**：点击、悬停、长按还是自动触发。
3. **出现位置**：侧边、底部、居中还是贴近触发元素。
4. **交互要求**：是否必须完成操作才能继续（模态）、点击外部是否关闭、是否需要遮罩。

## 实现要点

- Tooltip：内容短、无交互元素；必须同时支持键盘聚焦显示；触摸设备上用点击替代悬停。
- Popover / Dropdown：点击外部与 Esc 关闭；打开时焦点移入，关闭后焦点回到触发器；菜单项支持方向键。
- Drawer / Bottom Sheet：打开时锁定背景滚动（但保留内容可读）；Bottom Sheet 支持下拉手势关闭，见 Gesture-driven Transition（01）。
- Modal：焦点陷阱、遮罩、Esc 关闭、打开时 `aria-modal="true"`；关闭后恢复之前的焦点与滚动位置。
- Toast：不获取焦点；多条时排队或堆叠；提供足够但不过长的显示时长；重要结果不能只用 Toast 表达。
- 所有浮层：定位要避免越出视口（边缘翻转），层级与 z-index 有明确约定，关闭时清理监听与计时器。
- 遵循 `prefers-reduced-motion`：淡入淡出改为直接显示。

## Copyable prompt 骨架（英文）

Add a [overlay type] to my interface. It is triggered by [hover / click / long-press / automatic] and appears [position: near the trigger / from the side / from the bottom / centered]. It should [whether it blocks interaction, closes on outside click or Esc, traps focus]. Animate [entrance and exit motion], keep it inside the viewport with edge flipping, restore focus and scroll position after closing, support keyboard and touch, respect prefers-reduced-motion, and do not modify unrelated components.
