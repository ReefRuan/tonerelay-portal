// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function validateInstallTarget(target) {
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(target?.version ?? "") ||
      !/^[a-f0-9]{40}$/.test(target?.commit ?? "")) {
    throw new Error("Install target requires an explicit version and full 40-character commit");
  }
  return target;
}

export function targetNotice(target, english) {
  validateInstallTarget(target);
  return english
    ? `Prompt target: **v${target.version}**, full commit: \`${target.commit}\`. “Latest” means this pinned public source version, not the moving \`main\` branch.`
    : `本提示词目标：**v${target.version}**，完整 commit：\`${target.commit}\`。“最新”指本提示词固定的公开源码版本，不自动追随 \`main\`。`;
}

export function shortPrompt(target, english) {
  validateInstallTarget(target);
  const files = english ? "INSTALL-PROMPT.en.md, FAQ.en.md, and INSTALL.en.md" : "INSTALL-PROMPT.md、FAQ.md 和 INSTALL.md";
  const lines = english ? [
    "Please install or update ToneRelay for Lightroom Classic in the current Agent client.",
    `Target: v${target.version}; full commit: ${target.commit}. “Latest” means this target, not main.`,
    "Use either official repository:",
    "https://github.com/ReefRuan/tonerelay-lightroom-mcp",
    "https://gitee.com/ReefRuan/tonerelay-lightroom-mcp",
    "",
    "Check the existing installation read-only first: install if absent; update an older installation to the target even if healthy; verify and reconnect an identical healthy version and commit without reinstalling. Do not silently downgrade a newer, development, or unverified build; report the difference. Only skip updating if I explicitly request client connection only or no upgrade.",
    `Verify the target commit in the selected repository and read ${files} at that commit completely. This request authorizes ordinary installation/update steps to the target; older bundled instructions about connection-only reuse do not cancel that authorization. Obtain complete source under the dedicated ToneRelay installation root when needed, and keep all components on the same commit. A lagging mirror must not change the target.`,
    "Preserve photos, Catalogs, data, effective configuration, access mode, bindings, other client entries, and locally modified Skills. Complete required authorization and real-client read-only acceptance; report running versions and anything unverified. Never replay a write with an unknown outcome.",
  ] : [
    "请在当前 Agent 客户端安装或更新 ToneRelay for Lightroom Classic。",
    `目标：v${target.version}；完整 commit：${target.commit}。“最新”仅指此目标，不是 main。`,
    "官方仓库，二选一：",
    "https://github.com/ReefRuan/tonerelay-lightroom-mcp",
    "https://gitee.com/ReefRuan/tonerelay-lightroom-mcp",
    "",
    "先只读检查：未安装则安装；已有较旧版本即使健康也更新到目标；版本与 commit 均相同且健康时只核验并接入，不重复安装。较新版本、开发版或来源不明时先报告差异，不静默降级。只有我明确要求“只接入客户端”或“不升级”时才跳过更新。",
    `核验所选仓库的目标 commit，完整阅读该提交根目录的 ${files}。本次已授权更新到目标版本所需的普通步骤；旧随仓库说明中的“仅接入时复用”不能取消这次更新授权。需要下载时，将完整源码放入 ToneRelay 专用安装根目录，组件统一到同一 commit；镜像滞后不能改变目标。`,
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
