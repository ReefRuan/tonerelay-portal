# ToneRelay Portal

[在线画廊与使用介绍](https://reefruan.github.io/tonerelay-portal/) · [风格包与逐图许可](style-packs/README.md)

此仓库托管 ToneRelay 的静态网页、安装说明和可公开下载的风格上下文包。网页由 GitHub Pages 发布，不需要账号或自建后端。

- `src/`、`public/`：网页源码与轻量预览图。
- `style-packs/packages/`：六个独立风格包，每包含 Markdown、封面和参考图。
- `style-packs/downloads/`：对应的逐包 ZIP 下载文件。
- `docs/`：介绍、安装提示词与 FAQ。保持原路径，方便已有链接继续使用。

本地预览：`pnpm install && pnpm dev`。发布前检查：`pnpm test && pnpm build`。

第三方照片不适用任何未来的仓库级代码许可；请按每包 `package.json` 中的单图许可与署名使用。风格参考图是胶片样片，不是 ToneRelay 修图前后对比。
