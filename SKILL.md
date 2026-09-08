---
name: ui-interaction-kit
description: 前端 UI 交互与动效选型知识库。当用户要为页面、组件或图表选择、描述、实现交互效果时使用。覆盖 8 种质感动效（磁吸、液态形变、3D 视差、中心聚焦、液态 Tab、图片展开、手势转场、碰撞回弹）、7 种图表交互（框选、十字线、数据点高亮、数据提示框、图例筛选、缩放、下钻）、10 种 App 高级交互模式（圆形主题切换、拖拽排序、批量勾选、滑杆惯性吸附、文本展开、步骤条回弹、开关联动涟漪、曲线删除、卡片堆叠滚动、标签挤开）、7 种展开动画、8 种折叠组件、7 种导航组件、7 种弹窗组件、7 种加载动效。触发词包括：质感动效、有质感、更顺滑、跟手、像液体、磁吸、液态、回弹、视差、手势转场、动效优化、交互选型、copyable prompt、图表交互、展开动画、导航组件、弹窗、加载动效。
---

# UI Interaction Kit｜前端交互与动效选型

## 目的

把模糊的动效需求（"有质感""跟手""像液体""更高级""更顺滑"）翻译成可实现的输入、状态与运动规则，然后从 61 个已定义词条中选出最匹配的一个（最多主 1 + 辅 1），再实现。

## 核心原则

1. **先理解任务，再选择交互，最后写代码。** 未确认页面用途、目标设备、可用空间、当前技术栈之前，不输出代码。
2. **默认只选一个最匹配的主交互。** 需求确实包含两层时，拆成主交互 + 辅助交互并说明两者关系。
3. **不堆叠。** 不为视觉效果叠加多种交互；不是演示页时，不把全部词条塞进同一个项目。
4. **沿用现有技术栈与组件结构。** 不改写无关页面，不因为装饰效果扩大项目架构。
5. **"更高级"不是需求。** 必须翻译成具体的状态变化、位置变化、尺寸变化、透明度变化、裁切方式、弹簧或过冲参数。

## 工作流

### 第 1 步：读取上下文

从项目直接可获取的信息中确认：页面/组件的实际用途、用户任务、目标设备（桌面 / 移动 / 小程序）、可用空间、技术栈与已有动效能力。
缺少会改变方案的条件（例如是否需要拖放落点、是否已有滚动容器、是否已有图表库）时再询问；能合理假设时先假设并说明。

### 第 2 步：按问题定位分类

| 判断问题 | 优先分类 |
|---|---|
| 运动要不要和距离、速度、层级、用户输入建立关系？ | 质感动效（8） |
| 读图表时用户想选范围、对齐数值、看详情还是进下一层？ | 图表交互（7） |
| App/小程序界面里，变化从哪里发生、落在哪里、谁跟着回应、周围是否让位？ | 高级交互模式（10） |
| 内容从隐藏变为显示？ | 折叠组件（8）／展开动画（7） |
| 是导航、弹窗、加载状态这类基础组件？ | 导航（7）／弹窗（7）／加载（7） |

### 第 3 步：选词条并解释

说明：用户要完成什么、推荐哪个词条、为什么其他相近词条不合适、触发方式、视觉反馈、桌面与移动端是否需要不同处理。

### 第 4 步：输出

- 只要选型 → 输出效果说明 + 场景理由 + 关键规则，不写完整代码。
- 要提示词 → 输出**一段英文** Copyable prompt（不混入中文），含组件对象、触发方式、开始/结束状态、具体变化、数据状态与视觉状态的关系、响应式/键盘/触控/reduced-motion 要求、"不要改写无关组件"。
- 要实现 → 先简述方案（选型理由、修改位置、关键参数、完成与取消规则），再在指定范围内改代码。

## 词条总索引

| # | 分类 | 词条 | 参考文件 |
|---|---|---|---|
| 1 | 质感动效 | Magnetic Attraction / Velocity-driven Deformation / Layered Parallax / Center-focus Scaling / Liquid Tab Indicator / Shared-element Image Expansion / Gesture-driven Transition / Collision and Spring Response | `references/01-motion-texture.md` |
| 2 | 图表交互 | Brush Selection / Crosshair / Data Point Highlight / Tooltip / Legend Filter / Zoom / Drill Down | `references/02-chart-interaction.md` |
| 3 | 高级交互模式 | Radial Theme Transition / Drag-to-Reorder / Staggered Bulk Selection / Velocity-Based Slider Snap / Animated Text Disclosure / Spring Stepper Progress / Ripple Feedback for Related Switches / Curved Card Deletion / Stacked Card Scroll / Expanding Tag Selection | `references/03-app-patterns.md` |
| 4 | 展开动画 | Circle to Pill / Pill to Card / Compact to Expand / Corner Radius Morph / Size Morph / Content Reflow / Reverse Collapse | `references/04-expand-collapse.md` |
| 5 | 折叠组件 | Accordion / Collapse / Dropdown / Treeview / Expandable Card / Sidebar / Radio Menu / Container Transform | `references/04-expand-collapse.md` |
| 6 | 导航组件 | Tabs / Segment Control / Breadcrumb / Pagination / Stepper / Sidebar / Bottom Navigation | `references/05-navigation.md` |
| 7 | 弹窗组件 | Tooltip / Popover / Dropdown Menu / Drawer / Bottom Sheet / Modal / Toast（补充） | `references/06-overlays.md` |
| 8 | 加载动效 | Page Loader / Skeleton / Shimmer / Spinner / Progress Bar / Circular Progress / Button Loader | `references/07-loading.md` |

需求落到具体分类后，再读取对应 reference 获取"必须保留"的约束、Copyable prompt 与验收清单。不要一次性加载全部 reference。

## 描述任何交互都必须写清的五件事

1. **触发方式**：点击 / 长按 / 拖动 / 悬停 / 滚动 / 键盘 / 数据变化。
2. **开始状态**：动画起点是什么形状、位置、尺寸、透明度。
3. **变化过程**：哪些属性变化（位移、缩放、旋转、圆角、裁切、透明度、层级），是否过冲、是否错峰、是否跟随输入。
4. **结束状态**：最终停在哪里，数据状态是否同步，事件/计时器/渲染循环是否清理。
5. **取消或失败状态**：反向、回弹、直接消失、保留可理解状态；中途重新接管时从当前状态接续。

## 通用约束（每个方案都要满足）

- 尊重 `prefers-reduced-motion`，提供简短淡入、直接切换或静态替代，核心功能不依赖动效。
- 输入响应优先：把柔软和回弹放在视觉运动规则里，不人为延迟输入事件、不延迟状态提交。
- 动画可被重复输入打断时，必须从当前可见位置与形态接续，避免陈旧动画覆盖新状态。
- 保持可读性、键盘可操作性与合理触摸命中范围（建议 ≥44×44）；无悬停设备不依赖悬停完成任务。
- 网页、原生 App、小程序不默认使用同一套实现；先检查目标平台能力支持。
- 结束后清理事件监听、计时器、渲染循环与临时图层。
- 验证要区分代码检查、真实界面操作与性能测量；未做的验证直接说明，编译通过不能替代交互验收。
- 不承诺未经测量的帧率或"所有设备兼容"。

## 资源

- `references/01-motion-texture.md` – 8 种质感动效：选型边界、关键规则、验收清单
- `references/02-chart-interaction.md` – 7 种图表交互：场景表、决策路径、实现要点
- `references/03-app-patterns.md` – 10 种高级交互模式 + 英文 Copyable prompt
- `references/04-expand-collapse.md` – 7 种展开动画 + 8 种折叠组件
- `references/05-navigation.md` – 7 种导航组件与描述要素
- `references/06-overlays.md` – 7 种弹窗组件与描述要素
- `references/07-loading.md` – 7 种加载动效与描述要素
- `references/prompt-templates.md` – Copyable prompt 模板与输出格式
- `assets/showcase/index.html` – 61 个词条的可运行 Demo，每个卡片标注词条英文名与中文名；可直接用浏览器打开

## 使用 Demo

向用户交付或自查时，打开 `assets/showcase/index.html`：按 8 个分类分组，每个词条一张卡片，卡片内是可真实操作的迷你示例，支持"减少动效"开关。实现同类效果时优先复用其中的原生 JS 片段（无第三方依赖）。
