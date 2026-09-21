# ToneRelay Portal

ToneRelay Portal 是 ToneRelay 风格模板的静态浏览和选择入口。Git 仓库就是后端；页面只展示预设并提供模板库链接。

## 当前前端

- 拍立得式响应瀑布流：手机 2 列，桌面 3–5 列。
- 指针和触控可以直接选中预设。
- 操控条拥有收缩、正常、展开三个状态。
- 收缩状态只有一个 88px 的操控按钮，不显示轨迹球。
- 正常状态通过轨迹球、方向键或 WASD 在预设之间进行空间选择。
- 当前选择会同步显示在操控条中，并提供复制链接与详情操作。
- 详情以“拿起”方式出现；背景退后，操控条继续可用。
- 展开状态提供本地搜索和分类筛选。

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

当前演示目录位于 `src/catalog.ts`。后续修图模板库可以生成该文件或生成同结构的完整页面。每条预设只需要一个 Git 链接，不依赖服务端 API。

## 仓库职责

- 从 `tonerelay-style-packs` 读取公开的风格包目录。
- 展示封面、参考图、风格说明、版本和兼容性。
- 下载或安装用户明确选择的风格包。
- 为 Codex 和 ToneRelay Runtime 提供一致的包标识。

本仓库不保存完整风格包，不实现 Lightroom 操作，也不承载 MCP Server。

## 数据流

```text
tonerelay-style-packs (Git)
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
