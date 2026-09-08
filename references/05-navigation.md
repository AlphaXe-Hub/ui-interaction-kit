# 05 导航组件｜7 种 Navigation Components

导航都用于引导用户，但功能、布局与适用场景不同。向 AI 描述时说清组件类型、放置位置、切换内容与高亮方式。

## 速查表

| 词条 | 核心功能 | 适用场景 |
|---|---|---|
| Tabs 标签页 | 在同一页面内快速切换多组并列内容 | 内容分组明确，需在同一视窗内切换 |
| Segment Control 分段控件 | 在两三个视图之间快速切换，布局更紧凑 | 选项较少（通常 2–3 个），需节省空间 |
| Breadcrumb 面包屑 | 显示当前页面在网站层级中的位置，支持返回上级 | 层级较深的网站，帮助定位与回溯 |
| Pagination 分页 | 将大量内容分页展示，通过页码前后翻页 | 内容太多，无法单页完整显示 |
| Stepper 步骤条 | 将流程分解为多个步骤，展示当前进度 | 多步骤引导流程，如注册、结账 |
| Sidebar 侧边导航 | 主要功能入口固定在左侧，持续高亮当前页面 | 功能与栏目较多的后台系统或桌面应用 |
| Bottom Navigation 底部导航 | 3–5 个最常用入口固定在底部，点击切换主要页面 | 手机等移动设备，方便单手操作 |

## 描述四要素

1. **组件名称**：直接说明要哪种组件（Tabs / Segment Control / Breadcrumb / Pagination / Stepper / Sidebar / Bottom Navigation）。
2. **放置位置**：顶部、底部、左侧还是其他位置。
3. **切换内容**：点击后切换什么类型的内容。
4. **高亮方式**：选中项如何高亮（下划线、背景块、颜色、图标填充）。

## 实现要点

- Tabs：使用 `role="tablist"` / `role="tab"` / `role="tabpanel"`，方向键切换，选中态与内容面板用 `aria-selected` 与 `aria-controls` 关联。选中指示器可选 Liquid Tab Indicator（见 01）。
- Segment Control：选项超过 3–4 个时改用 Tabs 或下拉；滑块背景跟随选中项，文字与命中区域保持稳定。
- Breadcrumb：最后一项为当前页且不可点击；层级过深时中间层折叠为省略号；移动端可只保留"返回上一级"。
- Pagination：提供首页/末页、页码省略、每页条数；禁用态要清晰；支持键盘与 URL 同步。
- Stepper：区分完成、当前、未开始；允许返回的流程应可点击历史步骤；进度推进动画见 Spring Stepper Progress（03）。
- Sidebar：可折叠为图标栏；当前项高亮并保持滚动位置；小屏改为抽屉。
- Bottom Navigation：3–5 项，选中项图标与文字同时变化；带徽标时保证数字不遮挡图标；与系统返回手势不冲突。

## Copyable prompt 骨架（英文）

Add a [navigation component] to my interface, placed at [position]. Clicking an item switches [what content changes]. Indicate the active item by [highlight method: underline / background pill / icon fill / color]. Keep the correct semantic role and keyboard navigation, keep touch targets at least 44px, handle small screens and many items gracefully, respect prefers-reduced-motion, and do not modify unrelated components.
