# UI Interaction Kit

**86 patterns** · **No build step** · **MIT License** · **CodeBuddy Skill**

> 让 AI 选对交互：8 种质感动效、7 种图表交互、10 种 App 模式、7 + 8 展开与折叠、7 种导航、7 种弹窗、7 种加载、3 种滚动驱动官网模式、6 种质感组件交互、8 种手势与反馈、8 种图标交互动效，共 86 个词条，每个词条都有可运行的 Demo。

**English version → [README_EN.md](./README_EN.md)** · **在线 Demo → https://alphaxe-hub.github.io/ui-interaction-kit/**

<p>
  <img src="./docs/demo-overview.png" alt="深色主题" width="49%">
  <img src="./docs/demo-overview-light.png" alt="浅色主题" width="49%">
</p>

## 这是什么

把模糊的动效需求（"有质感""跟手""像液体""更高级"）翻译成 86 个已定义词条；让 AI 在动手前先选对一个，主交互一个就够。规则写进了 `SKILL.md`：**先理解任务 → 选一个主交互 → 再写代码**，描述任何交互必须写清触发、开始状态、变化过程、结束状态、取消状态。

## 一分钟安装

### CodeBuddy（已实测）

```bash
# 用户级（跨项目可用）
cp -r ui-interaction-kit ~/.codebuddy/skills/

# 项目级（仅当前项目）
mkdir -p .codebuddy/skills && cp -r ui-interaction-kit .codebuddy/skills/
```

### Claude Code / Cursor（SKILL.md 是通用 Agent Skills 格式，未实测）

```bash
# Claude Code
mkdir -p ~/.claude/skills && cp -r ui-interaction-kit ~/.claude/skills/

# Cursor（项目级）
mkdir -p .cursor/skills && cp -r ui-interaction-kit .cursor/skills/
```

## 触发词

当对话里出现下面这些词，AI 编码助手会自动调出本 Skill：

> 质感动效 · 有质感 · 更顺滑 · 跟手 · 像液体 · 磁吸 · 液态 · 回弹 · 视差 · 手势转场 · 动效优化 · 交互选型 · copyable prompt · 图表交互 · 展开动画 · 导航组件 · 弹窗 · 加载动效 · 质感组件 · 重叠排列 · 进度底色 · 横向手风琴 · 组件托盘 · 下拉摘要 · 手势与反馈 · 捏合改变内容密度 · 快速滚动拖影 · 下拉拉伸 · 拖拽吸附 · 网格重排走弧线 · 悬浮元素自动反色 · 选中项突出显示 · 图标交互动效 · 描边绘制 · 双态形变 · 点赞回弹 · 铃铛摇铃 · 旋转加载 · 填充推进 · 图标跟随

## 86 个词条速览

<details>
<summary>01 质感动效 · Motion Texture（8）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Magnetic Attraction | 磁吸效果 | 拖动元素靠近明确目标时提示落点 |
| Velocity-driven Deformation | 液态形变 | 卡片随拖动速度产生柔软拉伸 |
| Layered Parallax | 3D 视差 | 前景 / 中景 / 背景随输入产生深浅差异 |
| Center-focus Scaling | 中心聚焦 | 滚动浏览时突出当前居中项 |
| Liquid Tab Indicator | 液态 Tab | 选中背景在标签间伸缩流动 |
| Shared-element Image Expansion | 图片展开 | 缩略图连续扩展到全屏图 |
| Gesture-driven Transition | 手势转场 | 拖动控制页面切换，可取消 |
| Collision and Spring Response | 碰撞回弹 | 自由移动元素彼此碰撞推挤 |

</details>

<details>
<summary>02 图表交互 · Chart Interaction（7）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Brush Selection | 框选 | 选择特定时间或数据范围 |
| Crosshair | 十字线 | 对齐数据点并查看对应数值 |
| Data Point Highlight | 数据点高亮 | 强调某个特定或重要的数据点 |
| Tooltip | 数据提示框 | 查看某个数据点的详细信息 |
| Legend Filter | 图例筛选 | 显示、隐藏或比较不同数据系列 |
| Zoom | 图表缩放 | 覆盖较大范围时查看局部趋势 |
| Drill Down | 数据下钻 | 从汇总数据进入更详细层级 |

</details>

<details>
<summary>03 高级交互模式 · App Interaction Patterns（10）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Radial Theme Transition | 圆形主题切换 | 以点击位置为圆心切换两套主题 |
| Drag-to-Reorder | 拖拽排序 | 拖动列表项重新决定顺序 |
| Staggered Bulk Selection | 批量勾选 | 全选时多条内容依次进入选中态 |
| Velocity-Based Slider Snap | 滑杆惯性吸附 | 释放后短距离冲过再回最近刻度 |
| Animated Text Disclosure | 文本展开 | 按真实高度连续过渡 |
| Spring Stepper Progress | 步骤条回弹 | 进度段略微过冲再回准确位置 |
| Ripple Feedback for Related Switches | 开关联动反馈 | 切换一个开关，邻近的轻微涟漪 |
| Curved Card Deletion | 卡片曲线删除 | 滑过阈值后沿曲线飞向回收区 |
| Stacked Card Scroll | 卡片堆叠滚动 | 顶部卡片固定，后续压成一摞 |
| Expanding Tag Selection | 标签挤开 | 选中放大，邻近向两侧让位 |

</details>

<details>
<summary>04 展开动画 · Expand Animations（7）</summary>

Circle to Pill 圆点变胶囊 · Pill to Card 胶囊变信息卡 · Compact to Expand 紧凑态展开 · Corner Radius Morph 圆角形态过渡 · Size Morph 尺寸变形 · Content Reflow 内容重排 · Reverse Collapse 反向收回

</details>

<details>
<summary>05 折叠组件 · Collapse Components（8）</summary>

Accordion 手风琴 · Collapse 独立折叠 · Dropdown 下拉展开 · Treeview 树形 · Expandable Card 可展开卡片 · Sidebar 侧边栏 · Radio Menu 环形菜单 · Container Transform 容器变形

</details>

<details>
<summary>06 导航组件 · Navigation（7）</summary>

Tabs 标签页 · Segment Control 分段控件 · Breadcrumb 面包屑 · Pagination 分页 · Stepper 步骤条 · Sidebar 侧边导航 · Bottom Navigation 底部导航

</details>

<details>
<summary>07 弹窗组件 · Overlays（7）</summary>

Tooltip 文字提示 · Popover 气泡卡片 · Dropdown Menu 下拉菜单 · Drawer 抽屉 · Bottom Sheet 底部面板 · Modal 模态框 · Toast 轻提示（补充）

</details>

<details>
<summary>08 加载动效 · Loading States（7）</summary>

Page Loader 整页加载 · Skeleton 骨架屏 · Shimmer 微光扫过 · Spinner 旋转指示器 · Progress Bar 进度条 · Circular Progress 环形进度 · Button Loader 按钮加载

</details>

<details>
<summary>09 滚动驱动官网 · Scroll-Driven Official Site（3）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Scroll-driven Opening | 滚动驱动开场 | 产品从闭合状态开始，滚动时绕真实转轴打开 |
| Horizontal Scroll Section | 横向滚动区段 | 固定视口，纵向滚动驱动横向轨道，最后一项完整露出才解除固定 |
| Scroll-driven Hologram Scan | 滚动驱动全息扫描 | 裁剪面随滚动上移，扫过的部分全息显形，未扫到的只留残影，反向滚动自顶向下收回 |

完整示例官网：**https://alphaxe-hub.github.io/ui-interaction-kit/scroll.html**

</details>

<details>
<summary>10 质感组件交互 · Texture Components（6）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Overlapping Stack | 重叠排列 | 同类元素互相压住三分之一，末尾显示剩余数量，点击依次散开成整行 |
| Progress-fill Background | 进度底色 | 用背景填充宽度表示完成进度，勾选一项平滑前推，完成时组件提亮 |
| Horizontal Accordion | 横向手风琴 | 并排竖放只露图标与竖排文字，点击某条横向展开，其他条同步收窄 |
| Component Tray | 组件托盘 | 主组件下方垫一层深色托盘，默认只露一行，点击抽出显示明细而主组件不动 |
| Proximity-scale Icons | 跟手放大图标 | 一排图标按指针距离平滑缩放，相邻沿同一衰减曲线向外让位 |
| Pull-down Summary | 下拉摘要 | 顶部一行胶囊，下拉时跟手展开成完整统计面板，松手按位移与速度判定 |

</details>

<details>
<summary>11 手势与反馈 · Gesture &amp; Feedback（8）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Pinch to Zoom Density | 捏合改变内容密度 | 双指捏合在离散档位（大图 / 多列网格 / 文字行）间切换，改变的是布局与尺寸 |
| Scroll-driven Progress Animation | 滚动驱动进度动画 | 动画进度绑定容器滚动位置，正向播放、反向倒放，停在任意位置 |
| Velocity-based Motion Blur | 快速滚动拖影 | 按真实滚动速度施加方向性模糊，速度归零平滑恢复清晰 |
| Rubber-band Header Stretch | 下拉拉伸顶部图片 | 已在顶部继续下拉时头部图片拉伸放大，覆盖文字同步淡出，松手回弹 |
| Snap to Guides | 拖拽元素自动吸附 | 靠近参考线自动吸附并显示对齐线，进入/退出双阈值 + 吸附瞬间一次顿挫 |
| Arc Grid Reflow | 网格重排走弧线 | 列数变化时每项沿弧线移动，相邻错峰出发，连续切换从半路接续 |
| Adaptive Contrast Overlay | 悬浮元素自动反色 | 按背后区域亮度在深/浅之间连续反色，临界点带滞回不闪烁 |
| Focus Mode Selection | 选中项突出显示 | 选中项放大提亮，同级未选中项降饱和、轻微缩小与模糊，仍可读可点 |

</details>

<details>
<summary>12 图标交互动效 · Icon Micro-interactions（8）</summary>

| 英文 | 中文 | 一句话场景 |
|---|---|---|
| Stroke Drawing | 描边绘制 | 图标像被画出来，多段路径错峰绘制，填充在描边完成后出现 |
| Two-state Morph | 双态形变 | 汉堡与关闭之间形变：首尾线位移旋转、中线缩放淡出，双向同路径 |
| Play / Pause Toggle | 播放暂停切换 | 三角收缩淡出、双线展开淡入，交叉过渡不留空白帧 |
| Like Pop | 点赞回弹 | 描边变填充并过冲回弹；取消时走更弱路径，连点不累积 |
| Bell Ring | 铃铛摇铃 | 以顶部为轴角度递减摆动并精确归零，徽标脉冲独立 |
| Loading Spin | 旋转加载 | 刷新转整圈落回标准朝向，加载才无限循环，且始终留出口 |
| Fill Wipe | 填充推进 | 描边被自下而上填充，推进量由真实数值决定，可反向退回 |
| Follow Cursor | 图标跟随指针 | 内部元素跟随指针并在容器内限位，离开后带阻尼回中 |

> demo 内所有图标均为自绘基础几何图形（24 网格 / stroke 1.75 / round 端点），**未打包任何第三方图标素材**。要用具体某套图标库，见 [`references/11-icon-microinteractions.md`](./references/11-icon-microinteractions.md) 的许可证对照表。

</details>

## Demo：86 个可操作示例

**在线体验（GitHub Pages，无需安装）**：https://alphaxe-hub.github.io/ui-interaction-kit/

**滚动驱动示例官网（完整长滚动 + sticky）**：https://alphaxe-hub.github.io/ui-interaction-kit/scroll.html

右上角按钮可切换深色 / 浅色主题（选择会被记住），左上角可开启"减少动效"验证静态降级。滚动驱动页还支持 `?scrub=js`（强制 JS 插值路径）与 `?motion=reduce`（强制静态路径）两个验证开关。

本地运行：

```bash
# 方式一：直接双击打开（脚本非 module，file:// 可用）
open assets/showcase/index.html       # macOS
start assets/showcase/index.html      # Windows
explorer assets/showcase/index.html   # Git Bash

# 方式二：起一个本地服务器（推荐，方便分享）
npx serve assets/showcase
# 或
python3 -m http.server 8000 --directory assets/showcase
```

打开后右上角有"减少动效"开关，每个词条一张卡片，卡片内可真实操作。顶部搜索框按英文名 / 中文名 / 场景关键词过滤。

## 使用示例

### 直接发给 AI 的中文请求

> 帮我看一下这个可拖动卡片：拖得越快形变越明显，停手时逐渐恢复，正文保持清晰，再次拖动从当前状态接续。

> 把当前导航的选中背景做成液态 Tab：移动时先拉长再收拢，文字不动，快速连续点击也能平滑到最后选中的位置。

> 这个页面的返回转场跟随手势：松手时结合距离、速度和方向决定完成还是取消，并保留普通返回按钮。

> 这组头像互相压住三分之一，末尾显示还有几人；点一下依次错峰散开显示名字，再点按相反顺序收回。

> 给这个网格加双指捏合的语义缩放：按捏合比例在大图、三列、文字行之间切换布局，内容平滑过渡，并且记住上次选的是哪一档。

> 这个点赞按钮点下去要弹一下：先变实心再回弹，取消的时候别那么用力，连点也不能越弹越大。

### 跨工具的英文 Copyable prompt

```
Use the selected interaction pattern in my existing interface.
Preserve the current visual style, layout language, and component
structure. Do not rewrite unrelated components. Implement the
trigger, state changes, start and end states, motion behavior,
responsive behavior, keyboard accessibility, touch support, and
reduced-motion fallback described below:
[Insert the selected English interaction prompt here]
```

完整英文 prompt 模板见 [`references/prompt-templates.md`](./references/prompt-templates.md)。

## 目录结构

```
ui-interaction-kit/
├── SKILL.md                    # 决策入口：四步工作流 + 86 词条索引
├── references/                 # 每个分类的规则、验收清单、Copyable prompt
│   ├── 01-motion-texture.md    # 8 种质感动效
│   ├── 02-chart-interaction.md # 7 种图表交互
│   ├── 03-app-patterns.md      # 10 种 App 模式 + 英文 prompt
│   ├── 04-expand-collapse.md   # 7 + 8 展开与折叠
│   ├── 05-navigation.md        # 7 种导航
│   ├── 06-overlays.md          # 7 种弹窗
│   ├── 07-loading.md           # 7 种加载
│   ├── 08-scroll-driven.md     # 3 种滚动驱动官网模式（共享规则、三个 pattern、完成标准）
│   ├── 09-texture-components.md # 6 种质感组件交互（共享规则、Copyable prompt、验收与选型对照）
│   ├── 10-gesture-feedback.md  # 8 种手势与反馈（输入→反馈映射规则、Copyable prompt、验收与选型对照）
│   ├── 11-icon-microinteractions.md # 8 种图标交互动效 + 第三方图标库许可证对照
│   └── prompt-templates.md     # 统一提示词模板
├── assets/showcase/            # Demo
│   ├── index.html              # 86 个词条总览（卡片网格）
│   ├── core.js                 # 注册表 + 运行时 + reduced-motion 开关 + 中英切换
│   ├── styles.css
│   ├── scroll.html / .css / .js  # 滚动驱动示例官网（开场 → 横向滚段 → 全息扫描 → 结尾）
│   └── demos/01..12-*.js       # 12 个分类共 86 个 demo
├── docs/demo-overview.png      # README 用的首屏截图
└── LICENSE                     # MIT
```

## 注意事项

- **不堆叠**：默认一个需求只选一个主交互；需要两层时拆主 + 辅并说明关系。
- **不堆"高级"**：把"有质感""跟手""像液体"翻译成具体的状态变化、位置变化、尺寸变化，不要直接当完整需求。
- **参数是设计选择**：本 Skill 列出的弹簧刚度、阈值、过冲量都是需要结合项目调整的设计选择，不是固定行业标准。
- **reduced-motion**：Demo 与所有 reference 都尊重 `prefers-reduced-motion`；真实项目里必须保留静态替代。
- **平台差异**：网页 / 原生 App / 小程序不默认使用同一套实现；先检查目标平台能力，与系统手势、返回、滚动冲突时优先协调现有行为。
- **不承诺帧率**：实际性能依赖设备和实现细节，编译通过不能替代真实交互验收。
- **不堆库**：不要为装饰效果引入完整物理引擎、动画库或路由框架，必要时优先用项目已有的依赖。
- **图标是美术资源，许可证要和代码分开看**：Iconsax 等库的 Free 许可明确禁止再分发图标文件（原文 *Redistribution (Loose Icons): FORBIDDEN! Neither loose nor in packs*），把 SVG 复制进公开仓库就是再分发——改用 npm 依赖引入，或选 ISC / MIT 的库（Lucide、Heroicons、Phosphor、Tabler）。本仓库的图标 demo 全部自绘，不携带任何第三方图标素材；对照表见 [`references/11-icon-microinteractions.md`](./references/11-icon-microinteractions.md)。
- **手势必须有等价输入**：捏合、双指、下拉这类手势在桌面与无触屏设备上要给出替代（⌘/Ctrl + 滚轮、按钮、键盘、指针拖拽），不能只有触摸才能完成任务。
- **分清组件级与流程级**：重叠排列、进度底色、组件托盘、下拉摘要属于"同一份数据的另一种呈现"，通常不改业务状态；只有进度底色的勾选和折叠开合会同步状态，且状态必须先于动画提交。
- **滚动驱动另有三条硬约束**：滚动位置是唯一事实来源（由区段真实起止位置推导进度，不用全局滚动比例）；反向滚动必须沿同一路径回到同一状态；不要给每次滚动更新挂 CSS `transition`（用逐帧同步、scrub 时间线或插值循环）。
- **拆解内部结构要诚实**：拿不到真实模型时，用基础几何体程序生成并明确标注"概念可视化"，不要声称重建或扫描过真实内部结构。
- **依赖边界**：除滚动驱动示例页的全息扫描段使用 Three.js（CDN、仅该段需要、加载失败自动降级为静态示意）外，全部为零依赖原生 JS，且没有构建步骤。

## 贡献指南

新增词条：

1. 在 `references/` 下新建 `XX-name.md`，覆盖选型边界、必须保留的规则、验收清单、Copyable prompt。
2. 在 `assets/showcase/demos/` 下加文件，调用 `UIK.register(catId, def)` 注册。
3. 在 `SKILL.md` 的词条总索引里加一行。

修改 Demo：

- 保持 12 个分类的注册文件结构。
- `node --check assets/showcase/demos/*.js` 全部通过。
- 打开 `assets/showcase/index.html` 实测正常交互再提交。
- 开启右上角"减少动效"开关复验静态降级。

## License

MIT © 2026 ChangerXu
