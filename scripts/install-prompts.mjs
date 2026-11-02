// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function validateInstallTarget(target) {
  if (target?.repository !== "https://github.com/ReefRuan/tonerelay-lightroom-mcp" ||
      target?.branch !== "main" || target?.resolve !== "at_execution" ||
      "commit" in target || "version" in target) {
    throw new Error("Install target must resolve the official main branch at execution time");
  }
  return target;
}

export function targetNotice(target, english) {
  validateInstallTarget(target);
  return english
    ? "Install/update target: the latest code on the official public MCP repository's `main` branch when this prompt is executed. Resolve its full commit then and use that one commit throughout this installation."
    : "安装／更新目标：执行本提示词时，官方公开 MCP 仓库 `main` 分支的最新代码。执行时查询并记录完整 commit，整次安装统一使用该提交。";
}

export function shortPrompt(target, english) {
  validateInstallTarget(target);
  const files = english ? "INSTALL-PROMPT.en.md, FAQ.en.md, and INSTALL.en.md" : "INSTALL-PROMPT.md、FAQ.md 和 INSTALL.md";
  const lines = english ? [
    "Please install or update ToneRelay for Lightroom Classic in the current Agent client.",
    "Target: the latest code on the official public MCP main branch at execution time. Resolve and record its full 40-character commit once, then keep this installation on that commit even if main advances. A version/commit I explicitly request takes precedence.",
    "Official primary source and fallback:",
    "https://github.com/ReefRuan/tonerelay-lightroom-mcp",
    "https://gitee.com/ReefRuan/tonerelay-lightroom-mcp",
    "",
    "Check the existing installation read-only first: install if absent; update an older installation to the target even if healthy; verify and reconnect an identical healthy version and commit without reinstalling. Do not silently downgrade a newer, development, or unverified build; report the difference. Only skip updating if I explicitly request client connection only or no upgrade.",
    `Verify public repository identity, resolve main through the official API or Git, and read ${files} at the resolved commit completely. The resolved commit overrides older targets in bundled prompts. This request authorizes ordinary installation/update steps. Obtain complete source under the dedicated ToneRelay installation root and keep all components on that commit. After resolving GitHub main, a mirror must provide the same commit; if only Gitee is reachable initially, resolve its main and report that GitHub's latest state could not be verified.`,
    "Preserve photos, Catalogs, data, effective configuration, access mode, bindings, other client entries, and locally modified Skills. Complete required authorization and real-client read-only acceptance; report running versions and anything unverified. Never replay a write with an unknown outcome.",
  ] : [
    "请在当前 Agent 客户端安装或更新 ToneRelay for Lightroom Classic。",
    "目标：执行时官方公开 MCP 仓库 main 分支的最新代码。先查询并记录一次完整的 40 位 commit，整次安装统一使用该提交，期间 main 前进也不混装；我明确指定版本或 commit 时按我的指定。",
    "官方主源及备用：",
    "https://github.com/ReefRuan/tonerelay-lightroom-mcp",
    "https://gitee.com/ReefRuan/tonerelay-lightroom-mcp",
    "",
    "先只读检查：未安装则安装；已有较旧版本即使健康也更新到目标；版本与 commit 均相同且健康时只核验并接入，不重复安装。较新版本、开发版或来源不明时先报告差异，不静默降级。只有我明确要求“只接入客户端”或“不升级”时才跳过更新。",
    `核验公开仓库身份，通过官方 API 或 Git 解析 main，完整阅读所得提交根目录的 ${files}。源码附带旧提示词的提交号不能替换本次解析结果。本次已授权普通安装／更新步骤。将完整源码放入 ToneRelay 专用安装根目录，组件统一到该提交。已解析 GitHub main 时，备用源须提供同一提交；最初仅 Gitee 可达时解析其 main，并说明尚未核验 GitHub 的最新状态。`,
    "保留照片、Catalog、数据、有效配置、访问模式、绑定、其他客户端条目和用户修改过的 Skill。完成必要授权及真实客户端的只读验收，报告实际运行版本与未验证项；不重放结果未知的写入。",
  ];
  return `\`\`\`text\n${lines.join("\n")}\n\`\`\``;
}

export function replaceGeneratedBlock(document, name, content) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  if (document.split(start).length !== 2 || document.split(end).length !== 2 || document.indexOf(start) > document.indexOf(end)) {
    throw new Error(`Expected exactly one ordered ${name} block`);
  }
  const newline = document.includes("\r\n") ? "\r\n" : "\n";
  const generated = `${start}\n${content}\n${end}`.replace(/\r?\n/g, newline);
  return document.slice(0, document.indexOf(start)) + generated + document.slice(document.indexOf(end) + end.length);
}

export async function syncInstallPrompts(root, { check = false } = {}) {
  const target = validateInstallTarget(JSON.parse(await readFile(join(root, "docs/install-target.json"), "utf8")));
  for (const english of [false, true]) {
    const suffix = english ? ".en" : "";
    for (const [path, block, content] of [
      [`docs/install-prompt${suffix}.md`, "install-target", targetNotice(target, english)],
      [`docs/install-short-prompt${suffix}.md`, "install-short-prompt", shortPrompt(target, english)],
      [`README${suffix}.md`, "install-short-prompt", shortPrompt(target, english)],
    ]) {
      const file = join(root, path);
      const current = await readFile(file, "utf8");
      const updated = replaceGeneratedBlock(current, block, content);
      if (current !== updated) {
        if (check) throw new Error(`${path} is stale; run npm run sync:install-prompts`);
        await writeFile(file, updated, "utf8");
      }
    }
  }
}
