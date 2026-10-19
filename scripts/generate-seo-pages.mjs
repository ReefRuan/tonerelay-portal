// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { copyFile, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const site = "https://reefruan.github.io/tonerelay-portal/";
const repo = "https://github.com/ReefRuan/tonerelay-portal";

const readText = (relativePath) => readFile(join(root, relativePath), "utf8");
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);
const absolute = (path = "") => new URL(path, site).href;
const safeUrl = (value) => {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Unsupported external URL: ${value}`);
  }
  return escapeHtml(url.href);
};
function installationCallout(language = "zh") {
  const english = language === "en";
  const suffix = english ? ".en" : "";
  return `<section class="installation-callout related" aria-labelledby="installation-heading"><h2 id="installation-heading">${english ? "Ready to start editing?" : "看完效果，开始安装。"}</h2>
<p>${english ? "Open the interactive guide to copy the complete installation prompt and FAQ to your Agent. You can also read and copy the prompt directly on GitHub." : "打开交互式入口，复制完整安装提示词和 FAQ 给 Agent；也可以直接在 GitHub 查看并复制提示词全文。"}</p>
<div class="installation-callout-actions actions"><a class="button primary" href="${absolute(english ? "?lang=en#experience" : "#experience")}">${english ? "Open Install & use" : "打开安装与使用入口"}</a><a class="button" href="${repo}/blob/main/docs/install-prompt${suffix}.md">${english ? "Read and copy the prompt on GitHub" : "在 GitHub 查看并复制安装提示词"}</a><a class="button" href="https://gitee.com/ReefRuan/tonerelay-portal/blob/main/docs/install-prompt${suffix}.md">${english ? "Full prompt on Gitee" : "Gitee 备用提示词全文"}</a><a class="button" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL${suffix}.md">${english ? "Installation steps and requirements" : "安装步骤与要求"}</a><a class="button" href="https://gitee.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL${suffix}.md">${english ? "Gitee mirror installation guide" : "备用安装说明（Gitee）"}</a></div>
<p class="muted">${english ? "Copying the prompt does not complete installation. Let your Agent verify the version, permissions, and existing components before proceeding." : "复制提示词不等于完成安装。请让 Agent 先核对版本、权限与已有组件，再继续。"}</p></section>`;
}
const shortDescription = (text, max = 155) => {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).replace(/[，。；、\s]+$/u, "")}…` : clean;
};
const publicId = (id) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid public package ID: ${id}`);
  }
  return id;
};

const inline = (text, links = {}) => escapeHtml(text)
  .replace(/!\[([^\]]*)\]\((?:https?:\/\/[^\s)]+|[^)]+)\)/g, "$1")
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|sources\.md|references\/[0-9]{2}\.jpg)\)/g, (_, label, href) => {
    if (href === "sources.md" && links.packagePath) {
      return `<a href="${safeUrl(`${repo}/blob/main/${links.packagePath}/sources.md`)}">${label}</a>`;
    }
    if (href.startsWith("references/") && links.references?.has(href)) {
      return `<a href="./${href}">${label}</a>`;
    }
    if (href.startsWith("references/")) {
      throw new Error(`Effect Markdown links to an unpublished reference: ${href}`);
    }
    if (href === "sources.md") {
      throw new Error("Relative sources.md link needs package context");
    }
    const target = new URL(href.replace(/&amp;/g, "&"));
    if (links.language === "en") {
      const portal = new URL(site);
      if (target.origin === portal.origin && target.pathname === portal.pathname) {
        target.searchParams.set("lang", "en");
      }
    }
    return `<a href="${safeUrl(target.href)}">${label}</a>`;
  })
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/`([^`]+)`/g, "<code>$1</code>");

function renderMarkdown(markdown, links = {}) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let index = 0;
  const isBoundary = (line) => /^#{1,3} |^```|^\s*[-*] |^\s*\d+\. |^\|/.test(line);
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line || line.startsWith("<!--")) { index++; continue; }
    if (line.startsWith("# ")) { index++; continue; }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const tag = heading[1].length === 2 ? "h2" : "h3";
      output.push(`<${tag}>${inline(heading[2], links)}</${tag}>`);
      index++;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```")) code.push(lines[index++]);
      if (index < lines.length) index++;
      output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    if (line.startsWith("|") && /^\|[\s:|\-]+\|?$/.test(lines[index + 1]?.trim() ?? "")) {
      const cells = (row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      const header = cells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) rows.push(cells(lines[index++]));
      output.push(`<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${inline(cell, links)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell, links)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const list = line.match(/^(\s*[-*] |\s*\d+\. )/);
    if (list) {
      const ordered = /\d/.test(list[1]);
      const items = [];
      while (index < lines.length && (ordered ? /^\s*\d+\. /.test(lines[index]) : /^\s*[-*] /.test(lines[index]))) {
        items.push(lines[index++].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
      }
      const tag = ordered ? "ol" : "ul";
      output.push(`<${tag}>${items.map((item) => `<li>${inline(item, links)}</li>`).join("")}</${tag}>`);
      continue;
    }
    const paragraph = [line];
    index++;
    while (index < lines.length && lines[index].trim() && !isBoundary(lines[index].trim())) {
      paragraph.push(lines[index++].trim());
    }
    output.push(`<p>${inline(paragraph.join(" "), links)}</p>`);
  }
  return output.join("\n");
}

const css = `:root{color-scheme:dark;--line:#303b45;--surface:#171e26;--accent:#a8caff;--muted:#adb9c5;font-family:system-ui,-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:#10161d;color:#e8edf2}
*{box-sizing:border-box}body{margin:0}a{color:var(--accent);text-underline-offset:.22em}a:hover{color:#d5e5ff}a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.wrap{max-width:960px;margin:auto;padding:0 24px}.site-header{border-bottom:1px solid var(--line);background:#151c24}
.site-header .wrap{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:70px}
.brand{font-weight:750;letter-spacing:.04em;text-decoration:none;color:#edf3fa}.nav{display:flex;gap:18px;flex-wrap:wrap;font-size:.9rem}
main{padding-top:44px;padding-bottom:72px}.eyebrow{color:var(--accent);font-size:.82rem;font-weight:650;letter-spacing:.06em}
h1{font-family:"Iowan Old Style","Songti SC","Noto Serif CJK SC",serif;font-size:clamp(2rem,5vw,3.4rem);font-weight:500;line-height:1.25;margin:.35em 0}.lead{font-size:1.12rem;line-height:1.85;max-width:800px;color:#c9d4df}
.meta,.muted{color:var(--muted)}.actions{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 34px}
.button{display:inline-block;border:1px solid #52687f;border-radius:8px;padding:11px 20px;text-decoration:none;font-weight:650}
.button.primary{background:var(--accent);border-color:var(--accent);color:#152337}.button:hover{background:#25374b;color:#eef5ff}.button.primary:hover{background:#c5dbff;color:#152337}.prose{line-height:1.85}.prose h2{margin-top:2.4em;padding-top:.8em;border-top:1px solid var(--line)}
.prose h3{margin-top:1.6em}.prose p,.prose li{max-width:860px}.prose li{margin:.4em 0}.prose pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--surface);padding:18px;border:1px solid var(--line);border-radius:10px}
.prose code{background:#23303e;padding:.1em .3em;border-radius:4px}.prose pre code{padding:0}.table-scroll{overflow-x:auto}
table{border-collapse:collapse;min-width:680px;width:100%}td,th{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--line)}th{background:var(--surface)}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin:24px 0}
figure{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden}figure img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}figcaption{font-size:.9rem;line-height:1.65;padding:12px}
.chart-gallery figure img{object-fit:contain;background:#fff}
.source-list li{margin:.7em 0}.related{margin-top:64px;padding-top:24px;border-top:1px solid var(--line)}.related ul{columns:2;line-height:2}
footer{border-top:1px solid var(--line);padding:24px 0 38px;color:var(--muted);font-size:.9rem}@media(max-width:640px){.site-header .wrap{flex-wrap:wrap;padding-block:12px}.nav{gap:10px}.related ul{columns:1}}`;

function page({ title, description, canonical, type, body, image, stylesheet, language = "zh", alternates }) {
  const english = language === "en";
  const htmlLanguage = english ? "en" : "zh-CN";
  const appHome = english ? absolute("?lang=en#gallery") : site;
  const experienceUrl = absolute(english ? "?lang=en#experience" : "#experience");
  const mcpUrl = "https://github.com/ReefRuan/tonerelay-lightroom-mcp";
  const alternateLinks = alternates
    ? `<link rel="alternate" hreflang="zh-CN" href="${safeUrl(alternates.zh)}"><link rel="alternate" hreflang="en" href="${safeUrl(alternates.en)}"><link rel="alternate" hreflang="x-default" href="${safeUrl(alternates.zh)}">`
    : "";
  const languageLink = alternates
    ? `<a href="${safeUrl(english ? alternates.zh : alternates.en)}" lang="${english ? "zh-CN" : "en"}" hreflang="${english ? "zh-CN" : "en"}">${english ? "中文" : "English"}</a>`
    : "";
  const metaImage = image ? `<meta property="og:image" content="${safeUrl(image)}">\n<meta name="twitter:card" content="summary_large_image">` : `<meta name="twitter:card" content="summary">`;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage: htmlLanguage,
    isPartOf: { "@type": "WebSite", "@id": `${site}#website`, name: "ToneRelay", url: site },
    author: { "@type": "Person", name: "Reef Ruan", url: "https://github.com/ReefRuan" },
    ...(image ? { image } : {}),
  }).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="${htmlLanguage}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="author" content="Reef Ruan">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${safeUrl(canonical)}"><link rel="sitemap" type="application/xml" href="${absolute("sitemap.xml")}">
${alternateLinks}
<meta property="og:type" content="${escapeHtml(type)}"><meta property="og:site_name" content="ToneRelay">
<meta property="og:locale" content="${english ? "en_US" : "zh_CN"}"><meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${safeUrl(canonical)}">
${metaImage}<meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">
<script type="application/ld+json">${structuredData}</script>
<link rel="stylesheet" href="${stylesheet}">
</head><body><header class="site-header"><div class="wrap"><a class="brand" href="${appHome}">ToneRelay</a><nav class="nav" aria-label="${english ? "Main navigation" : "主导航"}"><a href="${appHome}">${english ? "Style & effect gallery" : "风格与效果画廊"}</a><a href="${experienceUrl}">${english ? "Install & use" : "安装与使用"}</a><a href="${mcpUrl}">${english ? "MCP source" : "MCP 源码"}</a>${languageLink}</nav></div></header>
<main class="wrap">${body}</main><footer><div class="wrap">© 2026 Reef Ruan · ToneRelay · <a href="${repo}">${english ? "Project source" : "项目源码"}</a></div></footer></body></html>`;
}

async function writePage(path, html) {
  const output = join(dist, path, "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf8");
}

const catalog = await readJson("style-packs/catalog.json");
const effectCatalog = await readJson("style-packs/effect-catalog.json");
const publicStyles = [];
const publicEffects = [];

for (const entry of catalog.packages) {
  const id = publicId(entry.package_id);
  const pkg = await readJson(`${entry.path}/package.json`);
  if (pkg.id !== id || !pkg.content?.style || !Array.isArray(pkg.sources)) {
    throw new Error(`Incomplete public style package: ${id}`);
  }
  const markdown = (await readText(`${entry.path}/${pkg.content.style}`)).split("\n## 公开参考图与使用边界")[0];
  const canonical = absolute(`styles/${id}/`);
  if (entry.portal_url !== canonical) throw new Error(`Catalog URL must match canonical URL: ${id}`);
  const title = `${pkg.title} Lightroom 风格包｜ToneRelay`;
  const description = shortDescription(pkg.summary);
  const gallery = pkg.content.references.slice(0, 3).map((reference, index) => {
    const source = pkg.sources.find((item) => item.reference_files?.includes(reference));
    if (!source || !source.redistributable || !source.license_url) {
      throw new Error(`Public preview lacks verified credit: ${id} ${reference}`);
    }
    const number = String(index + 1).padStart(2, "0");
    const image = absolute(`previews/${id}/${number}.webp`);
    return `<figure><img src="${image}" alt="${escapeHtml(`${pkg.title} 参考照片：${source.title}，摄影 ${source.creator}`)}" loading="lazy"><figcaption>${escapeHtml(source.title)} · ${escapeHtml(source.creator)} · <a href="${safeUrl(source.url)}">原图</a> · <a href="${safeUrl(source.license_url)}">${escapeHtml(source.license)}</a></figcaption></figure>`;
  }).join("\n");
  const appUrl = absolute(`?preset=${id}#gallery`);
  const packageUrl = `${repo}/tree/main/${entry.path}`;
  const downloadUrl = `${repo}/raw/refs/heads/main/${entry.archive_path}`;
  const body = `<p class="eyebrow">公开风格包 · ${escapeHtml(pkg.version)}</p><h1>${escapeHtml(pkg.title)}</h1>
<p class="lead">${escapeHtml(pkg.summary)}</p><div class="actions"><a class="button primary" href="${appUrl}">在画廊中查看</a><a class="button" href="${safeUrl(downloadUrl)}">下载风格包 ZIP</a><a class="button" href="${safeUrl(packageUrl)}">查看包文件</a></div>
<article class="prose" aria-label="风格说明">${renderMarkdown(markdown)}</article>
<section aria-labelledby="references-heading"><h2 id="references-heading">真实参考照片与署名</h2><p class="muted">以下样片由原作者标注为对应胶片拍摄，按各自标注的许可展示。照片色彩会随拍摄、扫描和显示条件变化。</p><div class="gallery">${gallery}</div><p><a href="${safeUrl(packageUrl)}">查看全部参考图与逐图许可记录</a></p></section>`;
  await writePage(`styles/${id}`, page({ title, description, canonical, type: "article", body, image: absolute(`previews/${id}/01.webp`), stylesheet: "../../seo.css" }));
  publicStyles.push({ id, title: pkg.title, summary: pkg.summary, url: canonical });
}

for (const entry of effectCatalog.packages) {
  const id = publicId(entry.package_id);
  const pkg = await readJson(`${entry.path}/package.json`);
  if (pkg.id !== id || !pkg.content?.effect || !Array.isArray(pkg.sources)) {
    throw new Error(`Incomplete public effect package: ${id}`);
  }
  const embeddedCharts = entry.media === "embedded-cleared-chart-photos";
  if (!embeddedCharts && entry.media !== "external-links-only") {
    throw new Error(`Unsupported public effect media: ${id} ${entry.media}`);
  }
  const references = embeddedCharts ? pkg.content.references : [];
  if (embeddedCharts && (!Array.isArray(references) || references.length === 0)) {
    throw new Error(`Embedded chart effect has no reference photos: ${id}`);
  }
  const referenceCards = (references ?? []).map((reference) => {
    if (!/^references\/[0-9]{2}\.jpg$/.test(reference)) {
      throw new Error(`Invalid public chart reference path: ${id} ${reference}`);
    }
    const source = pkg.sources.find((item) => item.reference_files?.includes(reference));
    if (!source?.creator || !source?.title || !source?.url || !source?.license) {
      throw new Error(`Public chart reference lacks author, source, or license: ${id} ${reference}`);
    }
    const licenseUrl = source.license_url ?? source.license.match(/https?:\/\/\S+/)?.[0];
    const licenseLabel = licenseUrl ? source.license.replace(licenseUrl, "").trim() : source.license;
    const license = licenseUrl
      ? `<a href="${safeUrl(licenseUrl)}">${escapeHtml(licenseLabel)}</a>`
      : escapeHtml(licenseLabel);
    return {
      reference,
      html: `<figure><a href="./${reference}"><img src="./${reference}" alt="${escapeHtml(`${source.title}，摄影 ${source.creator}`)}" loading="lazy"></a><figcaption>${escapeHtml(source.creator)} · <a href="${safeUrl(source.url)}">${escapeHtml(source.title)}</a> · ${license}</figcaption></figure>`,
    };
  });
  const markdown = await readText(`${entry.path}/${pkg.content.effect}`);
  const canonical = absolute(`effects/${id}/`);
  const appUrl = absolute(`?preset=${id}#gallery`);
  if (entry.portal_url !== appUrl) throw new Error(`Effect catalog URL must match gallery detail URL: ${id}`);
  const title = `${pkg.title}｜可调 Lightroom 效果提示词 · ToneRelay`;
  const description = shortDescription(pkg.summary);
  const packageUrl = `${repo}/tree/main/${entry.path}`;
  const downloadUrl = `${repo}/raw/refs/heads/main/${entry.archive_path}`;
  const sources = pkg.sources.map((source) => `<li><a href="${safeUrl(source.url)}">${escapeHtml(source.title)}</a> · ${escapeHtml(source.creator)}<br><span class="muted">${escapeHtml(source.role)}</span></li>`).join("\n");
  const chartSection = embeddedCharts
    ? `<section aria-labelledby="charts-heading"><h2 id="charts-heading">实体色卡外观参考照片</h2><p class="muted">这些照片只帮助辨认实体色卡的外观和布局；照片像素受现场光、相机与编码影响，不是色卡的数值参考值，也不是任何人的肤色目标。不能用它们的像素计算色准。</p><div class="gallery chart-gallery">${referenceCards.map((card) => card.html).join("\n")}</div></section>`
    : "";
  const sourceIntro = embeddedCharts
    ? "以下资料用于解释同场色卡、色度条件和人像修图；内置照片的作者、原图和许可已逐张标明。"
    : "参考照片通过提示词中的原站直链查看。照片不在本站托管，原站图片的再分发许可未核实。";
  const body = `<p class="eyebrow">候选效果包 · ${escapeHtml(pkg.version)} · ${embeddedCharts ? "附实体色卡外观照片" : "原站照片链接版"}</p><h1>${escapeHtml(pkg.title)}</h1>
<p class="lead">${escapeHtml(pkg.summary)}</p><div class="actions"><a class="button primary" href="${appUrl}">在画廊中查看</a><a class="button" href="${safeUrl(downloadUrl)}">${embeddedCharts ? "下载效果包 ZIP" : "下载文字链接包"}</a><a class="button" href="${safeUrl(packageUrl)}">查看包文件</a></div>
<article class="prose" aria-label="效果提示词">${renderMarkdown(markdown, { packagePath: entry.path, references: new Set(referenceCards.map((card) => card.reference)) })}</article>
${chartSection}<section aria-labelledby="sources-heading"><h2 id="sources-heading">${embeddedCharts ? "参考来源" : "参考教程"}</h2><p>${sourceIntro}</p><ul class="source-list">${sources}</ul></section>`;
  await writePage(`effects/${id}`, page({ title, description, canonical, type: "article", body, image: embeddedCharts ? absolute(`effects/${id}/${referenceCards[0].reference}`) : undefined, stylesheet: "../../seo.css" }));
  for (const { reference } of referenceCards) {
    const destination = join(dist, "effects", id, reference);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(join(root, entry.path, reference), destination);
  }
  publicEffects.push({ id, title: pkg.title, summary: pkg.summary, url: canonical });
}

const intro = (await readText("docs/experience-introduction.md")).split("<!-- comparison-content:start -->")[0];
const faq = await readText("docs/faq.md");
const faqHeadings = ["如何描述目标？", "工具会自动决定哪张最好吗？", "画廊中的模板可以下载吗？"];
const allFaqSections = faq.split(/^## /m).slice(1);
const faqSections = faqHeadings.map((heading) => {
  const section = allFaqSections.find((candidate) => candidate.startsWith(`${heading}\n`));
  return section ? `## ${section}` : "";
}).filter(Boolean);
const experienceBody = `<p class="eyebrow">ToneRelay 使用说明</p><h1>用对话操作 Lightroom Classic</h1>
<p class="lead">描述想要的画面，让 Agent 调整 Lightroom 并带回实际渲染；查看结果后继续细调，也可以从公开风格与效果包开始。</p>
<div class="actions"><a class="button primary" href="${absolute("#experience")}">开始安装与使用</a><a class="button" href="${absolute("#gallery")}">浏览风格与效果</a><a class="button" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.md">安装步骤与要求</a></div>
<article class="prose">${renderMarkdown(intro)}<h2>常见问题</h2>${renderMarkdown(faqSections.join("\n"))}</article>${installationCallout()}`;
const experienceAlternates = { zh: absolute("experience/"), en: absolute("en/experience/") };
await writePage("experience", page({ title: "ToneRelay 使用说明｜用对话操作 Lightroom Classic", description: "ToneRelay 连接 Agent 与 Lightroom Classic。了解对话修图、真实渲染回读、批量操作、参考图调色，以及风格效果包的使用方式。", canonical: experienceAlternates.zh, type: "website", body: experienceBody, stylesheet: "../seo.css", alternates: experienceAlternates }));

const introEn = (await readText("docs/experience-introduction.en.md")).split("<!-- comparison-content:start -->")[0];
const faqEn = await readText("docs/faq.en.md");
const faqHeadingsEn = ["How should I describe the result I want?", "Does the tool automatically decide which photo is best?", "Can I download the templates in the gallery?"];
const allFaqSectionsEn = faqEn.split(/^## /m).slice(1);
const faqSectionsEn = faqHeadingsEn.map((heading) => {
  const section = allFaqSectionsEn.find((candidate) => candidate.startsWith(`${heading}\n`));
  return section ? `## ${section}` : "";
}).filter(Boolean);
const experienceBodyEn = `<p class="eyebrow">ToneRelay usage guide</p><h1>Operate Lightroom Classic through conversation</h1>
<p class="lead">Describe the image you want, let an Agent adjust Lightroom and return actual renders, then refine the result together. You can also start with public style and effect packs.</p>
<div class="actions"><a class="button primary" href="${absolute("?lang=en#experience")}">Start installation & use</a><a class="button" href="${absolute("?lang=en#gallery")}">Browse styles & effects</a><a class="button" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md">Installation steps and requirements</a></div>
<article class="prose">${renderMarkdown(introEn, { language: "en" })}<h2>Frequently asked questions</h2>${renderMarkdown(faqSectionsEn.join("\n"), { language: "en" })}</article>${installationCallout("en")}`;
await writePage("en/experience", page({ title: "ToneRelay Usage Guide | Operate Lightroom Classic Through Conversation", description: "ToneRelay connects an Agent to Lightroom Classic. Explore conversational editing, actual render readback, batch operations, reference color matching, and style and effect packs.", canonical: experienceAlternates.en, type: "website", body: experienceBodyEn, stylesheet: "../../seo.css", language: "en", alternates: experienceAlternates }));

const mcpMarkdown = await readText("docs/lightroom-classic-mcp.md");
const mcpBody = `<p class="eyebrow">ToneRelay · MCP 工具说明</p><h1>Lightroom MCP：用对话选片和修图</h1>
<p class="lead">说出想要的效果，查看 Lightroom 实际渲染的照片，再接着调整。了解 ToneRelay 如何连接 Agent 与 Lightroom Classic。</p>
<div class="actions"><a class="button primary" href="${absolute("#experience")}">开始安装与使用</a><a class="button" href="${absolute("#gallery")}">浏览风格与效果</a><a class="button" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.md">安装步骤与要求</a></div>
<article class="prose">${renderMarkdown(mcpMarkdown)}</article>${installationCallout()}`;
const mcpAlternates = { zh: absolute("lightroom-classic-mcp/"), en: absolute("en/lightroom-classic-mcp/") };
await writePage("lightroom-classic-mcp", page({ title: "Lightroom MCP 工具｜ToneRelay for Lightroom Classic", description: "ToneRelay 是连接 Agent 与 Lightroom Classic 的本地 MCP 工具套件。用对话选片、调整显影参数和主体蒙版，查看真实渲染预览，比较多种调色方案。", canonical: mcpAlternates.zh, type: "article", body: mcpBody, stylesheet: "../seo.css", alternates: mcpAlternates }));

const mcpMarkdownEn = await readText("docs/lightroom-classic-mcp.en.md");
const mcpBodyEn = `<p class="eyebrow">ToneRelay · MCP toolkit guide</p><h1>Lightroom MCP: select and edit photos through conversation</h1>
<p class="lead">Describe the result you want, inspect photos actually rendered by Lightroom, then continue adjusting. Discover how ToneRelay connects an Agent to Lightroom Classic.</p>
<div class="actions"><a class="button primary" href="${absolute("?lang=en#experience")}">Start installation & use</a><a class="button" href="${absolute("?lang=en#gallery")}">Browse styles & effects</a><a class="button" href="https://github.com/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL.en.md">Installation steps and requirements</a></div>
<article class="prose">${renderMarkdown(mcpMarkdownEn, { language: "en" })}</article>${installationCallout("en")}`;
await writePage("en/lightroom-classic-mcp", page({ title: "Lightroom MCP Toolkit | ToneRelay for Lightroom Classic", description: "ToneRelay is a local MCP toolkit connecting an Agent to Lightroom Classic. Select photos, adjust Develop settings and subject masks, inspect actual renders, and compare color treatments.", canonical: mcpAlternates.en, type: "article", body: mcpBodyEn, stylesheet: "../../seo.css", language: "en", alternates: mcpAlternates }));

const homepageLinks = [
  ...publicStyles.map((pack) => `<li><a href="${pack.url}">${escapeHtml(pack.title)} 风格包</a>：${escapeHtml(shortDescription(pack.summary, 85))}</li>`),
  ...publicEffects.map((pack) => `<li><a href="${pack.url}">${escapeHtml(pack.title)} 效果包</a>：${escapeHtml(shortDescription(pack.summary, 85))}</li>`),
].join("\n");
const staticRoot = `<main lang="zh-CN"><header><h1>ToneRelay：Lightroom Classic MCP 与风格画廊</h1><p>ToneRelay 是连接 Agent 与 Lightroom Classic 的本地 MCP 工具。了解对话修图与实际渲染回读，浏览公开胶片风格包和可调效果提示词。</p></header>
<nav aria-label="公开页面"><a href="${absolute("#experience")}">安装与使用</a> · <a href="${absolute("#gallery")}">浏览风格与效果画廊</a></nav>
<section><h2>公开风格与效果包</h2><ul>${homepageLinks}</ul></section>
<p><a href="${repo}">ToneRelay Portal 项目与公开包文件</a></p></main>`;
const indexPath = join(dist, "index.html");
const index = await readFile(indexPath, "utf8");
const rootPattern = /<div id="root">\s*<\/div>/;
if (!rootPattern.test(index)) throw new Error("Cannot find empty #root in Vite index.html");
await writeFile(indexPath, index.replace(rootPattern, `<div id="root">${staticRoot}</div>`), "utf8");

await writeFile(join(dist, "seo.css"), css, "utf8");
const sitemapUrls = [site, absolute("experience/"), absolute("lightroom-classic-mcp/"), absolute("en/experience/"), absolute("en/lightroom-classic-mcp/"), absolute("contact.html"), ...publicStyles.map((item) => item.url), ...publicEffects.map((item) => item.url)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated ${publicStyles.length} style pages, ${publicEffects.length} effect pages, Chinese and English experience and MCP pages, homepage fallback, and sitemap.`);
