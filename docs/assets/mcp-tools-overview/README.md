# ToneRelay 工具介绍列表

## 当前审核稿：密集工具列表

当前使用 `tools-list.zh.html`、`tools-list.en.html` 和共用的 `tools-list.css`。中英文是两个独立页面，列表中**没有示意图或照片**；每一项直接显示真实 `trlr_*` 名称和简短用途。对应的 `tools-list.zh.two-column.jpg`、`tools-list.en.two-column.jpg` 是浏览器截图，供 README 展示。

已按下方公开源码中的 `TOOLS` 注册项逐项核对，共 58 个唯一工具，无遗漏或重复：

1. 修图参数、版本与回读：32 个，包含虚拟副本、编辑上下文、编辑版本预览、状态、显影参数、蒙版、XMP 读取/验证、预设、RGB / Lab / ΔE00，以及会话工具。`trlr_create_episode` 紧接 01 标题，作为这一组第一项。
2. 批量操作、预览与导出：24 个，包含目录、标记、Catalog 缓存与文件预览、JPEG 导出、连接及运行配置。
3. 图片处理与数值化：2 个，分别是 `trlr_image_measure`、`trlr_image_compare`；区域裁切、直方图和明暗统计是工具的能力，不伪造为新的 tool 名称。

面向首次接触项目的用户，只展示当前注册的工具名称与用途，不展示内部迁移、兼容或版本历史标签，也不把部分工具变灰。页面不放分组说明小字。分类是展示用途，不声称等于源码模块结构。名单随本次公开源码快照核验，工具注册变化后需重新核对数量与名称。

已接入 Portal「试着这样说」之后、「02 批量操作」编号之前，按钮名为「MCP 工具一览」，单独居中。默认展开，点击可收起或再次展开两列文字列表，不打开独立页面。组件直接解析本目录已确认的中英文 HTML，复用工具名与文案，不维护第二份名单。HTML 继续用作本地审核稿与截图真源，不再单独发布网页路由。

01 组顺序优先展示显影与色彩：创建编辑上下文 → 显影参数与曲线 → RGB / Lab / ΔE00 色块测量 → 数字色值转换 → 区域色彩变化，其余工具继续按原顺序排列。

Portal 与公开 MCP 的 README 在「从一张照片，到一整组照片」下展示对应语言截图。

两列构图：左列为 01 修图组，右列上方 02 批量组、下方 03 图片组；窄屏纵向排列。两列独立按内容高度排布，工具行保持紧凑，不拉伸卡片或行距来补齐高度。02 的目录缓存预览和打标状态，与 01 的编辑版本预览及回读分开。

`tools-list.zh.md` 与 `tools-list.en.md` 是可直接粘贴到 GitHub 的原生文字表格，不依赖图片、脚本或网页样式。由对应 HTML 机械导出，不另行维护第二份工具名单。修改 HTML 后，在本目录运行 `node export-markdown.mjs` 重新生成。

## 文件与维护

- `tools-list.zh.html`、`tools-list.en.html`：中英文工具名与文案真源，可离线打开审核。
- `tools-list.css`：独立审核稿的排版；宽 1480 px，桌面两列，不拉伸行距。
- `tools-list.zh.two-column.jpg`、`tools-list.en.two-column.jpg`：对应 HTML 的浏览器截图。
- `tools-list.zh.md`、`tools-list.en.md`：GitHub 原生文字表格。
- `export-markdown.mjs`：从 HTML 重新导出 Markdown。

Portal 页内展开组件位于 `src/McpToolsOverview.tsx`，样式在 `src/mcp-tools-overview.css`。摆放顺序在 `src/WorkflowComparisons.tsx` 的 `<McpToolsOverview />` 调用处调整；不需要改变名单或截图。

## 公开源码核对

内容独立依据 [ToneRelay 公开 MCP 源码](https://github.com/ReefRuan/tonerelay-lightroom-mcp/tree/1e9d63d0c6b7d9c45638d21e87b8ce5c9c9900f7) 与用户本轮需求编写。未摘抄私有 Runtime 设计资料。

以下路径均相对上述公开仓库，不是相对本目录：

| 图中能力 | 公开工具 | 核对位置 |
| --- | --- | --- |
| 当前照片与目录、缓存预览 | `trlr_get_current_selection`、`trlr_list_photos`、`trlr_get_current_folder_previews`、`trlr_get_photo_preview` | `apps/workbench-mcp/workbench_mcp/server.py` |
| 星级、旗标、颜色标签 | `trlr_get_photo_marks`、`trlr_set_photo_marks`、`trlr_get_mark_operation`、`trlr_undo_photo_marks` | 同上；`apps/workbench/tests/test_photo_marks.py` |
| 虚拟副本、渲染与参数回读 | `trlr_create_episode`、`trlr_edit_episode`、`trlr_get_episode`、`trlr_episode_artifact` | 同上；`apps/workbench/workbench/studio/engine.py` |
| JPEG 与参数 XMP 导出 | `trlr_export_image`、`trlr_verify_episode_xmp`、`trlr_episode_artifact` | `apps/workbench-mcp/workbench_mcp/server.py` |
| 显影参数、曲线、HSL、色彩分级 | `trlr_edit_episode`、`trlr_parameter_reference` | 同上；`apps/workbench/workbench/studio/parameter_specs.py` |
| 主体、天空、背景蒙版 | `trlr_native_mask` | `apps/workbench-mcp/workbench_mcp/server.py` |
| RGB、Lab、ΔE00 | `trlr_color_patch_measure`、`trlr_color_region_compare` | 同上；`apps/workbench/workbench/image_tools.py` |
| ROI、并排对比、直方图、明暗统计、ICC | `trlr_image_compare`、`trlr_image_measure` | 同上；`apps/workbench/workbench/image_tools.py` |

表述边界：工具写入评分，不独立决定选片标准；当前选图指当前目标照片，不宣称返回多选集合；缓存缩略图不等同于新鲜、色彩已验证的渲染；原生蒙版限主体、天空与背景；裁切是用于观察和测量的 ROI；ΔE00 表示渲染颜色变化，不是精度认证；JPEG 是图像导出，XMP 是参数文件。没有宣称图片 embedding、专用模糊检测器或全部操作都不改变 Lightroom 可见界面。

## README 嵌入

GitHub README 使用浏览器截图；点击可查看原尺寸。普通 README 不直接执行 HTML：

```markdown
![ToneRelay MCP 工具一览](docs/assets/mcp-tools-overview/tools-list.zh.two-column.jpg)
```

公开 MCP 仓库的对应文件是 `assets/readme/mcp-tools-list.zh.jpg`、`mcp-tools-list.en.jpg`。改动名单或顺序后，重新生成 Markdown 与浏览器截图，并同步两仓 README 使用的图片。截图未修改文字或另行生成图像内容。
