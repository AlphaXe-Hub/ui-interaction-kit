# 07 加载动效｜7 种 Loading States

7 种加载动效都表示"请稍等"，但适用场景完全不同。描述时必须说清动效类型、预计等待时间与具体使用场景。

## 速查表

| 词条 | 适用场景 | 核心作用 |
|---|---|---|
| Page Loader 整页加载 | 首次打开页面或核心内容加载 | 覆盖整个页面，告知内容正在加载 |
| Skeleton 骨架屏 | 页面内容未就绪 | 用占位结构保留页面布局，避免页面跳动 |
| Shimmer 微光扫过 | 配合 Skeleton 使用 | 通过移动的高光告诉用户内容仍在加载 |
| Spinner 旋转指示器 | 任务处理中，无法判断具体完成时间 | 表示系统仍在工作，没有卡住 |
| Progress Bar 进度条 | 任务进度可被计算 | 直观展示已完成百分比 |
| Circular Progress 环形进度 | 进度可计算且空间有限 | 与进度条作用相同，适合按钮、卡片等小空间 |
| Button Loader 按钮加载 | 用户点击提交、生成或保存后 | 按钮进入加载态，同时防止重复点击 |

## 选择规则

1. 能算出进度 → Progress Bar / Circular Progress；算不出 → Spinner。
2. 首次进入、整块内容未就绪 → Skeleton（+ Shimmer），比整页 Spinner 更少布局跳动。
3. 局部刷新、小空间 → Spinner / Circular Progress。
4. 用户点击了提交类按钮 → Button Loader，必须同时禁用重复提交。
5. 阻塞整个页面且必须等待 → Page Loader，需提供超时或重试说明；能不阻塞就不要用。

## 描述三要素

- **动效类型**：明确指出是哪一种。
- **预计等待时间**：长时加载还是短时处理（>1s 建议 Skeleton 或进度；<300ms 可不做动效，避免闪烁）。
- **具体使用场景**：在哪个环节、哪个位置使用。

## 实现要点

- 结束条件明确：数据到达即切换，失败时提供重试入口与可读的错误状态，不能停在加载态。
- 防止闪烁：加载时间很短时延时出现（例如 200ms 后才显示 Spinner），避免一闪而过。
- Skeleton 的占位结构必须与真实内容尺寸接近，否则替换时仍会跳动。
- Shimmer 是 Skeleton 的增强，不单独承担"布局保留"职责。
- 无障碍：`role="status"` / `aria-live="polite"` / `aria-busy="true"`，进度用 `aria-valuenow`；不确定进度的 Spinner 不要伪造百分比。
- 遵循 `prefers-reduced-motion`：Shimmer 高光停止移动，Spinner 可保留但降低速度或改为静态提示。

## Copyable prompt 骨架（英文）

Add a [loading pattern] to [location / step] in my interface. The expected wait time is [short / long / unknown progress]. It should [reserve layout / show percentage / prevent repeat submission], switch to the real content as soon as data arrives, and show a retry action with a readable message on failure. Delay showing the indicator for about 200ms to avoid flashing on fast responses, announce the state with the correct aria attributes, respect prefers-reduced-motion, and do not modify unrelated components.
