# ToneRelay Portal

ToneRelay Portal 是 ToneRelay 风格模板的静态浏览和选择入口。Git 仓库就是后端；页面只展示预设并提供模板库链接。

## 当前前端

- 拍立得式响应瀑布流：手机 2 列，桌面 3–5 列。
- 指针和触控可以直接选中预设。
- 操控条拥有收缩、正常、展开三个状态。
- 收缩状态只有一个 88px 的操控按钮，不显示轨迹球。
- 正常状态通过轨迹球、方向键或 WASD 在预设之间进行空间选择。
- 当前选择会同步显示在操控条中，并提供复制链接与详情操作。
- 详情以“拿起”方式出现；背景退后，并展示该包的真实参考证据，操控条继续可用。
- 展开状态提供本地搜索和分类筛选。
- 顶部导航提供“画廊”和“立即体验”；体验页以图解呈现真实预览、安全并行、后台处理与上下文效率。
- 体验页提供支持的 Agent、无 Agent 安装引导、可复制的安装提示词和面向用户/Agent 的答疑；当前明确标记为分发流程预览。

体验页的信息架构、产品口径、占位素材与验收标准见
[`docs/experience-page-design-prompt.md`](docs/experience-page-design-prompt.md)。

### 快捷键

| 按键 | 动作 |
| --- | --- |
| `M` | 开启收缩状态下的操控条 |
| `↑ ↓ ← →` / `W A S D` | 移动当前选择 |
| `Enter` | 查看当前预设详情 |
| `C` | 复制当前预设链接 |
| `/` | 展开并聚焦搜索 |
| `Esc` | 放回详情、关闭展开面板或收缩操控条 |

## 本地运行

```bash
pnpm install
pnpm dev
```

验证：

```bash
pnpm test
pnpm build
```

## 静态目录

当前目录位于 `src/catalog.ts`，分为两层：

- `lr-xmp-mimic-studio/templatepackages` 是正式包结构来源；当前 6 个 P5 包在 Portal 标记为「正式版 / 本地候选」。由于上游 manifest 仍是 `status: candidate` 且参考图尚未获得公开分发确认，Portal 只展示元数据占位图，不复制这些参考图。
- 原有 `lr-xmp-mimic-studio/packages` 示例全部标记为 `BETA / 公开预览`，继续使用已经核实可公开展示的封面与三张参考图。

完整配方、来源记录与其余参考图保留在对应 Git 包中。后续修图模板库可以生成该文件或生成同结构的完整页面。每条预设只需要一个 Git 链接，不依赖服务端 API。

## 仓库职责

- 从 `lr-xmp-mimic-studio/templatepackages` 读取正式包结构，并保留上游候选/发布状态。
- 将旧 `lr-xmp-mimic-studio/packages` 示例作为 BETA 画廊继续展示。
- 展示封面、参考图、风格说明、版本和兼容性。
- 下载或安装用户明确选择的风格包。
- 为 Codex 和 ToneRelay Runtime 提供一致的包标识。

本仓库不保存完整风格包，不实现 Lightroom 操作，也不承载 MCP Server。

## 数据流

```text
lr-xmp-mimic-studio/packages (Git)
        │ static catalog + images + links
        ▼
ToneRelay Portal (static site)
```

## 技术基线

- Vite + React + TypeScript
- Motion for pickup and controller transitions
- CSS multi-column masonry
- Native Pointer Events for the trackball
- No backend, authentication, or runtime installation protocol
