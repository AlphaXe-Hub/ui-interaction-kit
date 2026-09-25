# UI Interaction Kit

**92 patterns** · **No build step** · **MIT License** · **CodeBuddy Skill**

> Pick the right interaction before writing a line of code. 8 motion textures, 7 chart interactions, 10 app patterns, 7 + 8 expand & collapse, 7 navigation, 7 overlays, 7 loading states, 3 scroll-driven site patterns, 6 texture components, 8 gesture & feedback patterns, 8 icon micro-interactions, 6 instant feedback components — 92 entries, each with a runnable demo.

**中文版 → [README.md](./README.md)** · **Live demo → https://alphaxe-hub.github.io/ui-interaction-kit/**

<p>
  <img src="./docs/demo-overview.png" alt="Dark theme" width="49%">
  <img src="./docs/demo-overview-light.png" alt="Light theme" width="49%">
</p>

## What it is

A selection-and-implementation knowledge base for front-end interactions. Turns vague asks like *"make it feel snappier"*, *"follow my finger"*, *"like liquid"* into 92 well-defined terms so the AI picks the right one before touching code. The rule baked into `SKILL.md` is simple: **understand the task → choose one interaction → then code**. Every interaction spec must cover trigger, start state, motion, end state, and cancel state.

## Install in one minute

### CodeBuddy (verified)

```bash
# User scope (shared across projects)
cp -r ui-interaction-kit ~/.codebuddy/skills/

# Project scope (current repo only)
mkdir -p .codebuddy/skills && cp -r ui-interaction-kit .codebuddy/skills/
```

### Claude Code / Cursor (same `SKILL.md` format, unverified)

```bash
# Claude Code
mkdir -p ~/.claude/skills && cp -r ui-interaction-kit ~/.claude/skills/

# Cursor (project scope)
mkdir -p .cursor/skills && cp -r ui-interaction-kit .cursor/skills/
```

## Trigger words

When the conversation contains any of these, the AI coding assistant will pull this Skill in:

> motion texture · feel snappier · smoother · follow my finger · liquid · magnetic · spring · parallax · gesture transition · animation tuning · interaction selection · copyable prompt · chart interaction · expand animation · navigation component · overlay · loading state · texture component · overlapping stack · progress fill · horizontal accordion · pull-down summary · gesture feedback · pinch to zoom · motion blur · rubber band · snap to guides · arc reflow · adaptive contrast · focus mode · icon micro-interaction · stroke drawing · icon morph · like pop · bell ring · loading spin · fill wipe · icon follow · instant feedback · filter chips · removable tag · suggestion popover · font size ruler · press tilt · hold to record

## 92-entry catalog

<details>
<summary>01 Motion Texture (8)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Magnetic Attraction | 磁吸效果 | Drag an element near a target and signal the drop point |
| Velocity-driven Deformation | 液态形变 | Card deforms with drag speed, springs back on release |
| Layered Parallax | 3D 视差 | Foreground / midground / background shift with input |
| Center-focus Scaling | 中心聚焦 | The centered card visually pops during scroll |
| Liquid Tab Indicator | 液态 Tab | Indicator stretches then contracts between labels |
| Shared-element Image Expansion | 图片展开 | Thumbnail morphs into fullscreen image |
| Gesture-driven Transition | 手势转场 | Drag-controlled page transition, cancellable |
| Collision and Spring Response | 碰撞回弹 | Free-floating elements push each other on contact |

</details>

<details>
<summary>02 Chart Interaction (7)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Brush Selection | 框选 | Select a time or data range |
| Crosshair | 十字线 | Align with data points and read values |
| Data Point Highlight | 数据点高亮 | Emphasize a specific or important data point |
| Tooltip | 数据提示框 | Inspect the details of a data point |
| Legend Filter | 图例筛选 | Show, hide or compare series |
| Zoom | 图表缩放 | Inspect a slice of a wide range |
| Drill Down | 数据下钻 | Move from summary to a finer level |

</details>

<details>
<summary>03 App Interaction Patterns (10)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Radial Theme Transition | 圆形主题切换 | Reveal a new theme from the click point |
| Drag-to-Reorder | 拖拽排序 | Reorder list items by dragging |
| Staggered Bulk Selection | 批量勾选 | Select all with a staggered visual sweep |
| Velocity-Based Slider Snap | 滑杆惯性吸附 | Overshoot then snap to the nearest tick |
| Animated Text Disclosure | 文本展开 | Expand to real content height continuously |
| Spring Stepper Progress | 步骤条回弹 | Progress segment overshoots and settles |
| Ripple Feedback for Related Switches | 开关联动反馈 | Ripple to neighbors without changing their state |
| Curved Card Deletion | 卡片曲线删除 | Swiped card flies to trash along a curve |
| Stacked Card Scroll | 卡片堆叠滚动 | Previous cards compress into a visible stack |
| Expanding Tag Selection | 标签挤开 | Active tag grows, neighbors slide aside |

</details>

<details>
<summary>04 Expand Animations (7)</summary>

Circle to Pill · Pill to Card · Compact to Expand · Corner Radius Morph · Size Morph · Content Reflow · Reverse Collapse

</details>

<details>
<summary>05 Collapse Components (8)</summary>

Accordion · Collapse · Dropdown · Treeview · Expandable Card · Sidebar · Radio Menu · Container Transform

</details>

<details>
<summary>06 Navigation (7)</summary>

Tabs · Segment Control · Breadcrumb · Pagination · Stepper · Sidebar · Bottom Navigation

</details>

<details>
<summary>07 Overlays (7)</summary>

Tooltip · Popover · Dropdown Menu · Drawer · Bottom Sheet · Modal · Toast (addendum)

</details>

<details>
<summary>08 Loading States (7)</summary>

Page Loader · Skeleton · Shimmer · Spinner · Progress Bar · Circular Progress · Button Loader

</details>

<details>
<summary>09 Scroll-Driven Official Site (3)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Scroll-driven Opening | 滚动驱动开场 | The product starts closed and opens around its real hinge as you scroll |
| Horizontal Scroll Section | 横向滚动区段 | Pinned viewport, vertical scroll drives a horizontal track until the last item is fully inside |
| Scroll-driven Hologram Scan | 滚动驱动全息扫描 | A clip plane climbs with the scroll: scanned parts render as a hologram, the rest stays a ghost, and reverse scroll unwinds it from the top |

Full example page: **https://alphaxe-hub.github.io/ui-interaction-kit/scroll.html**

</details>

<details>
<summary>10 Texture Components (6)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Overlapping Stack | 重叠排列 | Similar items overlap by a third with a trailing count badge; clicking fans them out into a full row |
| Progress-fill Background | 进度底色 | Completion shown by the fill width of the component background, with a brightness lift at 100% |
| Horizontal Accordion | 横向手风琴 | Equal narrow bars with vertical text; clicking one widens it while the others shrink |
| Component Tray | 组件托盘 | A darker tray under the main component shows one line, then draws out details without moving the main component |
| Proximity-scale Icons | 跟手放大图标 | Icons scale with pointer distance and neighbours make room along the same falloff |
| Pull-down Summary | 下拉摘要 | One row of pills at the top expands into a stats panel by drag distance and release velocity |

</details>

<details>
<summary>11 Gesture &amp; Feedback (8)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Pinch to Zoom Density | 捏合改变内容密度 | Pinch between discrete densities (large image / multi-column grid / text rows), re-flowing the layout rather than scaling |
| Scroll-driven Progress Animation | 滚动驱动进度动画 | Animation progress bound to the container scroll offset: forward, reversible, stable at any position |
| Velocity-based Motion Blur | 快速滚动拖影 | Directional blur driven by real scroll velocity, decaying to perfectly sharp when scrolling stops |
| Rubber-band Header Stretch | 下拉拉伸顶部图片 | Pulling down at the top stretches the header image and fades the caption, then springs back |
| Snap to Guides | 拖拽元素自动吸附 | Snaps to guides with an alignment line, separate enter/exit thresholds and a single recoil |
| Arc Grid Reflow | 网格重排走弧线 | Items travel along arcs with a staggered start when the column count changes, resuming mid-flight |
| Adaptive Contrast Overlay | 悬浮元素自动反色 | Floating labels cross-fade between dark and light by the brightness behind them, with hysteresis |
| Focus Mode Selection | 选中项突出显示 | The selected item scales up and brightens; peers lose saturation, shrink and blur slightly — still tappable |

</details>

<details>
<summary>12 Icon Micro-interactions (8)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Stroke Drawing | 描边绘制 | The icon is drawn on: paths stagger by real measured length, fill arrives after the strokes |
| Two-state Morph | 双态形变 | Hamburger morphs into close — outer bars move and rotate, the middle bar scales out, reversible |
| Play / Pause Toggle | 播放暂停切换 | Triangle shrinks out while the two bars grow in, with overlapping timing and no empty frame |
| Like Pop | 点赞回弹 | Outline to filled with a spring overshoot; un-liking is deliberately weaker and taps never stack |
| Bell Ring | 铃铛摇铃 | Swings from the top with decaying amplitude to exactly zero; the badge pulses independently |
| Loading Spin | 旋转加载 | A refresh settles exactly at its standard orientation; only real loading loops, and it keeps an exit |
| Fill Wipe | 填充推进 | Outline fills bottom-up via a clip mask, driven by the real value and reversible |
| Follow Cursor | 图标跟随指针 | An inner element tracks the pointer, clamped inside its container, easing back on leave |

> Every icon in the demo is drawn from scratch (24 grid / 1.75 stroke / round caps) — **no third-party icon assets are bundled**. To use a specific icon library, see the license table in [`references/11-icon-microinteractions.md`](./references/11-icon-microinteractions.md).

</details>

<details>
<summary>13 Instant Feedback Components (6)</summary>

| English | Chinese | One-line scenario |
|---|---|---|
| Multi-select Filter Chips | 多选筛选标签 | Checkmark grows from the left, background fills, width expands and pushes neighbours aside, count pops |
| Removable Tag | 可删除的标签 | Remove shrinks the tag into a dot first, then FLIP slides the rest over and the field height contracts |
| Suggestion Popover | 输入联想浮层 | Opens beside the caret, filters live, inserts the choice as a non-editable inline tag |
| Font-size Ruler | 拨动字号刻度 | Active tick centred with fading edges; drag changes the size live, release snaps to a tick |
| Press-tilt Card | 按压倾斜卡片 | Tilts toward the touch point and scales down while the glow gathers in, springs back once |
| Hold-to-Record | 长按变录音条 | Past the hold threshold the group grows into a recording bar with a live waveform; plus rotates to cancel |

</details>

## Demo: 92 playable examples

**Live demo (GitHub Pages, nothing to install)**: https://alphaxe-hub.github.io/ui-interaction-kit/

**Scroll-driven example site (full-length scroll + sticky)**: https://alphaxe-hub.github.io/ui-interaction-kit/scroll.html

Toggle dark / light theme from the top-right button (the choice is remembered); use the "Reduce motion" switch to check the static fallback. The scroll-driven page also accepts `?scrub=js` (force the JS interpolation path) and `?motion=reduce` (force the static path) for verification.

Run locally:

```bash
# Option 1: open directly (scripts are not ES modules, file:// works)
open assets/showcase/index.html       # macOS
start assets/showcase/index.html      # Windows
explorer assets/showcase/index.html   # Git Bash

# Option 2: serve locally (recommended for sharing)
npx serve assets/showcase
# or
python3 -m http.server 8000 --directory assets/showcase
```

Each card in the demo is one entry. Use the top-right *Reduce motion* toggle to verify the static fallback. The search box filters by English name, Chinese name, or scenario keyword.

## Usage examples

### Paste-ready Chinese requests

> Look at this draggable card: the faster I drag, the more it deforms; when I stop, it gradually recovers; the text stays readable; and when I grab it again it picks up from the current shape.

> Make the nav indicator a Liquid Tab: it should stretch first then contract when moving, the text should not move, and rapid consecutive clicks should still land smoothly on the last choice.

> The back transition on this page should follow the finger: on release, decide commit or cancel from distance, velocity, and direction, and keep the regular back button as a fallback.

> These avatars overlap by a third with a badge showing how many are hidden; one click staggers them open with names, another click gathers them back in reverse order.

> Add semantic pinch-to-zoom to this grid: the pinch ratio switches between large images, a three-column grid and compact text rows, the content transitions smoothly, and the last chosen density is remembered.

> This like button should pop when tapped: switch to filled and bounce back, be gentler on un-like, and never let rapid taps stack up.

> These filter chips should grow a checkmark from the left when selected, fill their background and widen so the neighbours shift aside, with the count on the right popping too.

### Cross-tool English copyable prompt

```
Use the selected interaction pattern in my existing interface.
Preserve the current visual style, layout language, and component
structure. Do not rewrite unrelated components. Implement the
trigger, state changes, start and end states, motion behavior,
responsive behavior, keyboard accessibility, touch support, and
reduced-motion fallback described below:
[Insert the selected English interaction prompt here]
```

Full prompt templates: [`references/prompt-templates.md`](./references/prompt-templates.md).

## Layout

```
ui-interaction-kit/
├── SKILL.md                    # Decision entry: 4-step workflow + 92-entry index
├── references/                 # Rules, acceptance checks, copyable prompts
│   ├── 01-motion-texture.md    # 8 motion textures
│   ├── 02-chart-interaction.md # 7 chart interactions
│   ├── 03-app-patterns.md      # 10 app patterns + English prompts
│   ├── 04-expand-collapse.md   # 7 + 8 expand & collapse
│   ├── 05-navigation.md        # 7 navigation components
│   ├── 06-overlays.md          # 7 overlays
│   ├── 07-loading.md           # 7 loading states
│   ├── 08-scroll-driven.md     # 3 scroll-driven site patterns (shared rules, patterns, completion criteria)
│   ├── 09-texture-components.md # 6 texture components (shared rules, copyable prompts, acceptance, selection table)
│   ├── 10-gesture-feedback.md  # 8 gesture & feedback patterns (input-to-feedback mapping, prompts, acceptance)
│   ├── 11-icon-microinteractions.md # 8 icon micro-interactions + third-party icon license table
│   ├── 12-instant-feedback.md  # 6 instant feedback components (direction, reflow, cancel rules)
│   └── prompt-templates.md     # Unified prompt templates
├── assets/showcase/            # Demo
│   ├── index.html              # 92-entry card grid
│   ├── core.js                 # Registry + runtime + reduced-motion toggle + zh/en switch
│   ├── styles.css
│   ├── scroll.html / .css / .js  # Scroll-driven example site (opening → horizontal → hologram scan → outro)
│   └── demos/01..13-*.js       # 13 files, 92 demos
├── docs/demo-overview.png      # Screenshot for this README
└── LICENSE                     # MIT
```

## Constraints

- **Don't stack**: pick one main interaction per request. If two are truly needed, split into primary + secondary and explain the relation.
- **Don't say "more advanced"**: translate *"snappier"*, *"follow my finger"*, *"like liquid"* into concrete state, position, and size changes.
- **Parameters are design choices**: the spring stiffness, thresholds, and overshoot values in this Skill are starting points, not industry standards — tune per project.
- **Respect `prefers-reduced-motion`**: both the demo and the reference docs assume it; your implementation must keep a static fallback.
- **Platform differences**: web, native app, and mini-program each need their own implementation. Check platform capabilities first and coordinate with system gestures, back, and scroll when in conflict.
- **No frame-rate promises**: real performance depends on device and implementation. Passing a build does not replace a real interaction test.
- **No bloat**: don't pull in a full physics engine, animation library, or routing framework for a decorative effect. Use what the project already has.
- **Icon art is licensed separately from code**: libraries such as Iconsax forbid redistributing icon files outright (*Redistribution (Loose Icons): FORBIDDEN! Neither loose nor in packs*), so copying their SVGs into a public repository is redistribution — install them as a dependency instead, or pick an ISC/MIT library (Lucide, Heroicons, Phosphor, Tabler). Every icon in this repo's demo is drawn from scratch; see the license table in [`references/11-icon-microinteractions.md`](./references/11-icon-microinteractions.md).
- **Every gesture needs an equivalent input**: pinch, two-finger and pull-down gestures must have a desktop / non-touch substitute (Ctrl/⌘ + wheel, buttons, keyboard, pointer drag). Never make touch the only way to finish the task.
- **Separate component-level from flow-level**: overlapping stacks, progress fills, trays and pull-down summaries are alternative views of the same data and usually leave business state untouched. Only the checklist and the folding components sync state, and the state change must be committed before the animation.
- **Scroll-driven has three hard rules**: scroll position is the single source of truth (derive progress from the section's real start and end, never a global scroll ratio); a reverse scroll must return along the same path to the same state; and never attach a CSS `transition` to every scroll update (use frame-synced updates, a scrubbed timeline, or an interpolation loop).
- **Be honest about teardowns**: without separable assets, draw the internals in SVG and label it a concept visualization — do not claim reconstructed internals.

## Contributing

Add an entry:

1. New `references/XX-name.md` covering selection boundaries, must-keep rules, acceptance checks, and a copyable prompt.
2. Add a file under `assets/showcase/demos/` and register it with `UIK.register(catId, def)`.
3. Add a row to the index in `SKILL.md`.

Modify the demo:

- Keep the 8-category registration shape.
- `node --check assets/showcase/demos/*.js` must all pass.
- Open `assets/showcase/index.html` and verify the interaction in a real browser before committing.
- Toggle *Reduce motion* to verify the static fallback.

## License

MIT © 2026 ChangerXu
