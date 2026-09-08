# 04 展开与折叠｜7 种展开动画 + 8 种折叠组件

## Part A：7 种展开动画（形态过渡视角）

| 词条 | 核心描述 | 应用场景 |
|---|---|---|
| Circle to Pill 圆点变胶囊 | 从小圆形入口开始，横向展开成胶囊型 | 承载即时状态或简短信息 |
| Pill to Card 胶囊变信息卡 | 先显示紧凑状态，展开后变成完整信息卡 | 需要展示更多内容和操作选项 |
| Compact to Expand 紧凑态展开 | 同一功能先以紧凑形态出现，需要时展开成完整面板 | 控制面板、设置项，节省初始空间 |
| Corner Radius Morph 圆角形态过渡 | 尺寸基本不变，主要通过圆角变化实现平滑过渡 | 卡片到弹窗等形态细微调整 |
| Size Morph 尺寸变形 | 通过改变宽高让小组件变成大模块 | 需要展示更详细内容 |
| Content Reflow 内容重排 | 容器展开后内部内容重新排列，布局发生变化 | 从压缩布局到完整布局 |
| Reverse Collapse 反向收回 | 展开后沿原路径回到初始入口，而非直接消失 | 强调动画连贯性的视觉反馈 |

### 向 AI 描述展开动画的四个要素

1. **起始状态**：动画开始时的形状、大小、位置。
2. **最终状态**：动画结束时的形状、大小、位置。
3. **变化属性**：尺寸、形状、内容布局还是圆角。
4. **收回方式**：反向收回（沿原路径）还是直接消失。

只用"做一个展开动画"描述是不合格的。

## Part B：8 种折叠组件（组件行为视角）

| 词条 | 行为 | 适用 |
|---|---|---|
| Accordion 手风琴 | 一组可折叠内容，点击一项就地展开，再点收起；通常同时只开一项 | FAQ、分组设置 |
| Collapse 独立折叠区块 | 一整块内容单独控制展开与收起，互不影响 | 详情分区、长表单分段 |
| Dropdown 下拉展开 | 点击按钮后在下方展开选项列表，选择后自动收起 | 选择、操作菜单 |
| Treeview 树形展开 | 点击父节点展开子项，可继续深入 | 层级数据、文件目录 |
| Expandable Card 可展开卡片 | 卡片默认显示标题与摘要，点击就地展开完整内容 | 列表项详情 |
| Sidebar 侧边栏展开 | 从窄图标栏展开为完整菜单 | 入口较多的桌面端后台 |
| Radio Menu 环形菜单 | 点击中心按钮，周围快捷操作向四周展开 | 少量快捷入口 |
| Container Transform 容器变形 | 小卡片或缩略图逐渐放大过渡到完整详情视图 | 列表到详情的连续转场 |

### 实现要点

- 高度动画：测量真实内容高度后从当前高度过渡到目标高度，避免 `height: auto` 直接切换造成跳动；可用 grid-template-rows 0fr→1fr 或 FLIP。
- 折叠内容保持可访问：`aria-expanded`、`aria-controls`，收起时内容不应被键盘聚焦。
- 手风琴与 Collapse 的差别是"是否互斥"，实现前先确认。
- 树形展开保留展开状态与滚动位置；深层节点考虑懒加载。
- Container Transform 需要源与目标有明确对应关系，见 `01-motion-texture.md` 的 Shared-element Image Expansion。
- 遵循 `prefers-reduced-motion`：直接切换显示状态，不做高度补间。

### Copyable prompt 骨架（英文）

Create a [component type] in my existing interface. It starts as [start state: shape/size/position] and expands to [end state]. Animate [properties: height, width, border-radius, layout reflow, opacity] over the transition. When collapsing, [reverse along the original path / fade out directly]. Keep the surrounding layout stable, update aria-expanded, support keyboard operation, touch targets of at least 44px, and provide a no-animation fallback for prefers-reduced-motion. Do not rewrite unrelated components.
