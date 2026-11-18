# ToneRelay Portal 开发维护手册

这是一份供 Reef 和协作 Agent 按需查阅的 **Runbook（操作手册）**，记录 FAQ 维护、页面修改、本地验证和部署流程。它是普通仓库文档，不注册为 Skill，不加入自动注入上下文，也不需要安装。

日常更新优先修改内容源，再验证页面和复制内容。需要上线时，必须走完推送、部署和线上检查；本地提交不等于网站已更新。

## 如何交代任务

可以直接说：

> 把下面内容补充到 FAQ，更新 Portal：……

这类明确的维护请求按下文完整流程处理：整理问答、更新中英文、验证、提交、推送 Portal，并检查部署和线上结果。信息和权限齐全时直接执行，不再逐步询问是否继续；遇到事实不清、重叠冲突或缺少发布权限时，说明具体问题。

“先讨论”“只改文案”“只改本地”“暂不发布”等限制优先。只是描述一个问题，不等于要求写入 FAQ 或上线。本文用于约定流程，不单独触发任务或授权访问其他仓库。

交付时区分这些状态：

- **本地更新**：文件已改，说明验证结果。
- **提交**：已经产生 Git commit，未必推送。
- **推送**：远程分支收到提交，未必部署成功。
- **已上线**：对应提交的 Pages 部署成功，并检查了线上内容。

## 仓库和内容入口

[Portal 仓库](https://github.com/ReefRuan/tonerelay-portal)包含网页和 `style-packs/` 中的公开资源；[Lightroom MCP 仓库](https://github.com/ReefRuan/tonerelay-lightroom-mcp)提供 Runtime、Lightroom 插件与技术安装说明。更新 Portal 不默认包含修改 MCP 程序或 Studio。

| 要改的内容 | 维护位置 |
| --- | --- |
| FAQ | [faq.md](faq.md)、[faq.en.md](faq.en.md) |
| 完整安装提示词 | [install-prompt.md](install-prompt.md)、[英文版](install-prompt.en.md) |
| 短安装入口 | [install-short-prompt.md](install-short-prompt.md)、[英文版](install-short-prompt.en.md) |
| 卸载提示词 | [uninstall-prompt.md](uninstall-prompt.md)、[英文版](uninstall-prompt.en.md) |
| 体验页文章与案例外层文字 | [experience-introduction.md](experience-introduction.md)、[英文版](experience-introduction.en.md) |
| 案例的复制提问 | [experience-card-prompts.md](experience-card-prompts.md)、[英文版](experience-card-prompts.en.md) |
| 排版和交互约定 | [experience-page-design-prompt.md](experience-page-design-prompt.md) |
| 工具能力说明 | [mcp-tools-overview.md](mcp-tools-overview.md)及[工具一览维护说明](assets/mcp-tools-overview/README.md) |
| FAQ 读取、渲染和安装复制内容 | [src/Documents.tsx](../src/Documents.tsx) |
| 默认入口与链接路由 | [src/routing.ts](../src/routing.ts)、[src/App.tsx](../src/App.tsx) |
| 页面样式 | [src/styles.css](../src/styles.css) |
| 独立介绍页和搜索引擎页面 | [scripts/generate-seo-pages.mjs](../scripts/generate-seo-pages.mjs) |
| 部署配置 | [.github/workflows/deploy-pages.yml](../.github/workflows/deploy-pages.yml) |

介绍文字和布局分开维护。真实对话截图中的文字是实录，不通过修改图片来润色文案。`dist/` 是构建产物，不直接编辑或提交。

## FAQ 更新流程

### 先同步和核对事实

1. 检查 `git status --short --branch`、当前分支和 `git remote -v`，确认正在操作 Portal；保留无关改动和未跟踪草稿。
2. 运行 `git fetch origin`，查看 `git log --oneline --left-right HEAD...origin/main`。本地仅落后且已跟踪文件干净时可用 `git merge --ff-only origin/main`；有本地未推送提交时先检查差异，再保留双方修改合并。不要强推覆盖远程更新。
3. 阅读中英文 FAQ，找到相同或相近问题，优先补充已有条目。涉及安装、权限或工具能力时，对照公开 MCP 的对应版本说明和代码；用户提供的故障现象不直接写成所有版本都会发生的结论。

### 写入同一份内容源

每个问题使用二级标题，回答以短段落为主：

```markdown
## 用户实际会问的问题？

先直接回答，再说明需要采取的操作。版本或平台限制放在相关操作旁边。
```

- 修改 `docs/faq.md`，并在 `docs/faq.en.md` 同步对应问答、顺序和条件。问题标题不手写序号，网页自动编号。
- 当前组件支持段落、行内代码、加粗和 HTTP(S) 链接；回答尽量不用表格、代码围栏、嵌套列表或三级标题，避免原样露出 Markdown 标记。
- 保持用户视角和清楚的操作描述，不堆内部术语、不新增无依据的能力承诺。

`src/Documents.tsx` 已同时读取这两份 FAQ：网页将 `##` 解析为折叠问答，`getInstallPrompt()` 将对应语言的完整安装提示词与整份 FAQ 拼接后复制。因此，**普通 FAQ 更新不需要再把答案复制进 TSX 或安装提示词正文**。

如果新增答案改变了安装步骤、客户端接入路径、版本选择或安全要求，还要检查完整安装提示词是否需要同步修改。短提示词只负责定位完整说明，不把完整 FAQ 再塞进短提示词。

独立的搜索引擎介绍页目前只选取三道固定标题的 FAQ，不自动收录全部新问题。修改这些问题的标题时，要同步检查 `scripts/generate-seo-pages.mjs` 中的 `faqHeadings`、`faqHeadingsEn`；仅新增普通 FAQ 不必扩张该选集。

### 验证页面和复制内容

运行下一节的测试与构建，再预览 `/#experience` 和 `/?lang=en#experience`，确认：

- 新问题出现在正确位置，展开后段落和链接可读，中英文含义一致。
- 点击“复制安装提示词”，实际复制内容包含新增或修订的完整 FAQ，而不仅是标题或链接。
- 原有问答仍然存在，没有重复条目或把整段正文误解析为问题标题。

涉及新复制规则或渲染行为时，在 [src/Documents.test.ts](../src/Documents.test.ts)补回归测试。纯内容修改至少检查页面渲染及实际复制结果。

### 检查 MCP 仓库的文档副本

不访问 Portal 的短提示词安装会读取公开 MCP 仓库根目录的文档副本：

| Portal 维护源 | MCP 仓库副本 |
| --- | --- |
| `docs/install-prompt.md` | `INSTALL-PROMPT.md` |
| `docs/install-prompt.en.md` | `INSTALL-PROMPT.en.md` |
| `docs/faq.md` | `FAQ.md` |
| `docs/faq.en.md` | `FAQ.en.md` |

修改 FAQ 后检查是否需要同步副本。**仅要求更新 Portal 时，不擅自修改另一个仓库**；交付时说明 MCP 副本是否待同步。明确要求“两端同步”或“更新短提示词安装所读的 FAQ”时，再处理公开 MCP 仓库：从已提交的 Portal 快照复制文档，更新 `INSTALL-CONTEXT.json` 的来源提交及 SHA-256 记录，并逐文件比对。

目前没有自动同步脚本。不要混入私有开发文件、修改 Runtime 或安装器，也不要为了同步文档移动已有版本标签。GitHub 与 Gitee 均须分别检查；一端成功不代表另一端同步。

## 本地开发与验证

使用仓库锁文件安装依赖，避免为改文案顺手升级依赖。当前 CI 使用 Node.js 20 和 pnpm 9.15.9；执行时以部署工作流和当前依赖要求为准。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

开发服务器默认使用 `http://127.0.0.1:5173/`。端口已占用时先确认现有进程是否就是这个项目，不随意终止其他服务。

发布前运行：

```bash
pnpm test
pnpm verify:packs
pnpm build
pnpm preview --port 4173 --strictPort
```

生产预览位于 `http://127.0.0.1:4173/`。`pnpm build` 会先检查 TypeScript，再构建网页，最后生成独立介绍页、资源页面与 sitemap；只开开发服务器不能替代完整构建验证。

改动仅为维护文档和 README 时，检查相对链接与 `git diff --check` 即可；修改 FAQ、安装提示词、页面或包资源时执行上述相关验证。前端构建成功不等于 Lightroom 插件安装或实际修图已验证。

## 入口兜底回归

入口由 `index.html` 的内联样式与脚本、`src/bootFallback.ts` 的安装内容生成器，以及 `vite.config.ts` 的构建注入共同保证。主应用和样式可以失败，安装入口仍要可读、可复制；不要把这部分当作未使用的装饰删除。

- 正常进入裸首页和英文入口，默认显示体验页；预设深链接仍进入画廊。只有 React 已挂载且主样式的就绪标记生效后才撤掉启动层。
- 对构建后的页面分别模拟主 CSS 长时间不返回、CSS 404、主脚本失败。约10秒应出现短安装提示词、GitHub/Gitee完整说明链接与作者联系方式；不能无限转圈或露出未排版正文。只测源码开发服务器不足以覆盖构建后的资源阻塞。
- 构建产物的应用样式链接带 `data-boot-style`，以不阻塞页面的方式加载，加载后才切换到屏幕样式；独立启动样式始终内联。SEO生成步骤须保留 `#root` 的 `inert`，启动完成后由内联控制器解除。
- 点击备用页刷新时，应重新加载完整的当前地址，保留 `lang`、`preset` 和 hash。禁用 JavaScript 时仍保留原生链接和可手动复制的完整文本。
- 在备用页点击复制或选中文字，再让页面恢复加载：不能打断操作；应出现“进入完整页面”，由用户选择进入。剪贴板拒绝时应选中文本并提示手动复制。

短提示词始终来自中英文 `docs/install-short-prompt*.md`；使用实际执行时解析官方仓库最新提交的规则，不在备用入口另写版本或复制一份会过期的提示词。

## 提交和部署

Portal 是 GitHub Pages 静态站点，不需要为日常发布另建后端。推送到 `main` 会触发 **Deploy Portal to GitHub Pages** 工作流；也可从 Actions 手动运行同一工作流。它安装锁定依赖，检查公开包并构建，将 `dist/` 上传后部署。

以下步骤用于本地 `main` 分支。在其他分支工作时，先确认合入主分支的方式，不直接用 `git push origin main` 发布另一条未包含本次修改的分支。

1. 阅读 `git diff`，确认本次文件范围，显式 `git add -- <本次文件>`。不要用 `git add .` 顺手收走草稿。
2. 运行 `git diff --cached --check`，再提交。提交说明写清内容，例如 `docs: clarify client setup in FAQ`。
3. 上线前再次 `git fetch origin`。如果远程已更新，先检查并合入，重跑受影响的验证；不使用强推绕过分支分歧。
4. 用户要求发布时执行 `git push origin main`，记录推送提交。用户只要求本地提交时到此之前停止。
5. 在 [GitHub Actions](https://github.com/ReefRuan/tonerelay-portal/actions/workflows/deploy-pages.yml)找到**对应提交**的运行，确认 build 和 deploy 都成功。若使用已登录的 GitHub CLI，可运行：

```bash
gh run list --repo ReefRuan/tonerelay-portal --workflow deploy-pages.yml --branch main --limit 5
gh run view <运行编号> --repo ReefRuan/tonerelay-portal
```

6. 打开[线上体验页](https://reefruan.github.io/tonerelay-portal/#experience)，检查本次内容和实际复制结果；英文改动同时检查[英文体验页](https://reefruan.github.io/tonerelay-portal/?lang=en#experience)。必要时使用带提交号的 `?v=<提交号>#experience` 地址排查缓存，但这个参数不是部署成功的证明。

检查首页默认入口时使用不带 hash 和预设参数的站点根地址。显式 `#gallery` 和预设深链接本来就应进入画廊，不能据此判断默认入口失效。

Gitee 是备用仓库；同步 Git 仓库不等于配置了 Gitee 网页托管。本次需要镜像同步时，先检查远端、权限和差异，完成后核对提交；无权限则报告待同步，不绕过认证，也不声称备用源已更新。

部署失败时先区分检查失败、构建失败和部署失败，修复后重新验证。需要回退已发布内容时，先确定有问题的提交，再用 `git revert` 产生可追踪的回退提交并正常部署，不强推回退历史。

## 完成后怎么回报

说明改了什么、验证了什么、提交号、是否推送，以及对应部署是否成功。已上线时附页面链接；未上线时直接说停在哪一步。

FAQ 更新另注明：中英文是否一致、网页复制内容是否包含新答案、MCP 文档副本和 Gitee 是否同步。不要用“已更新”代替这些具体状态。
