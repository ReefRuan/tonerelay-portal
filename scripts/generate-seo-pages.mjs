// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { readFile, mkdir, writeFile } from "node:fs/promises";
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

const inline = (text) => escapeHtml(text)
  .replace(/!\[([^\]]*)\]\((?:https?:\/\/[^\s)]+|[^)]+)\)/g, "$1")
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|sources\.md)\)/g, (_, label, href) => {
    const target = href === "sources.md"
      ? `${repo}/blob/main/style-packs/packages/luminous-mist-portrait/sources.md`
      : href.replace(/&amp;/g, "&");
    return `<a href="${safeUrl(target)}">${label}</a>`;
  })
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/`([^`]+)`/g, "<code>$1</code>");

function renderMarkdown(markdown) {
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
      output.push(`<${tag}>${inline(heading[2])}</${tag}>`);
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
      output.push(`<div class="table-scroll"><table><thead><tr>${header.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
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
      output.push(`<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</${tag}>`);
      continue;
    }
    const paragraph = [line];
    index++;
    while (index < lines.length && lines[index].trim() && !isBoundary(lines[index].trim())) {
      paragraph.push(lines[index++].trim());
    }
    output.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }
  return output.join("\n");
}

const css = `:root{color-scheme:light;font-family:system-ui,-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:#f7f7f3;color:#202522}
*{box-sizing:border-box}body{margin:0}a{color:#175446;text-underline-offset:.18em}a:hover{color:#0c392f}
.wrap{max-width:960px;margin:auto;padding:0 24px}.site-header{border-bottom:1px solid #d8ded8;background:#fff}
.site-header .wrap{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:70px}
.brand{font-weight:750;letter-spacing:.04em;text-decoration:none;color:#173c33}.nav{display:flex;gap:18px;flex-wrap:wrap}
main{padding-top:44px;padding-bottom:72px}.eyebrow{color:#547065;font-size:.82rem;font-weight:650;letter-spacing:.08em;text-transform:uppercase}
h1{font-size:clamp(2rem,5vw,3.4rem);line-height:1.15;margin:.35em 0}.lead{font-size:1.12rem;line-height:1.85;max-width:800px}
.meta,.muted{color:#5c6d65}.actions{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 34px}
.button{display:inline-block;border:1px solid #175446;border-radius:999px;padding:11px 20px;text-decoration:none;font-weight:650}
.button.primary{background:#175446;color:#fff}.prose{line-height:1.85}.prose h2{margin-top:2.4em;padding-top:.5em;border-top:1px solid #d8ded8}
.prose h3{margin-top:1.6em}.prose p,.prose li{max-width:860px}.prose li{margin:.4em 0}.prose pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#e9efeb;padding:18px;border-radius:12px}
.prose code{background:#e9efeb;padding:.1em .3em;border-radius:4px}.prose pre code{padding:0}.table-scroll{overflow-x:auto}
table{border-collapse:collapse;min-width:680px;width:100%}td,th{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid #d5ddd6}th{background:#e9efeb}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin:24px 0}
figure{margin:0;background:#fff;border:1px solid #dce3dc;border-radius:14px;overflow:hidden}figure img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}figcaption{font-size:.9rem;line-height:1.65;padding:12px}
.source-list li{margin:.7em 0}.related{margin-top:64px;padding-top:24px;border-top:1px solid #d8ded8}.related ul{columns:2;line-height:2}
footer{border-top:1px solid #d8ded8;padding:24px 0 38px;color:#5c6d65;font-size:.9rem}@media(max-width:640px){.nav{gap:10px}.related ul{columns:1}}`;

function page({ title, description, canonical, type, body, image, stylesheet }) {
  const metaImage = image ? `<meta property="og:image" content="${safeUrl(image)}">\n<meta name="twitter:card" content="summary_large_image">` : `<meta name="twitter:card" content="summary">`;
  return `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${safeUrl(canonical)}"><link rel="sitemap" type="application/xml" href="${absolute("sitemap.xml")}">
<meta property="og:type" content="${escapeHtml(type)}"><meta property="og:site_name" content="ToneRelay">
<meta property="og:locale" content="zh_CN"><meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${safeUrl(canonical)}">
${metaImage}<meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">
<link rel="stylesheet" href="${stylesheet}">
</head><body><header class="site-header"><div class="wrap"><a class="brand" href="${site}">ToneRelay</a><nav class="nav" aria-label="主导航"><a href="${site}">风格与效果画廊</a><a href="${absolute("experience/")}">使用说明</a></nav></div></header>
<main class="wrap">${body}</main><footer><div class="wrap">© 2026 Reef Ruan · ToneRelay · <a href="${repo}">项目源码</a></div></footer></body></html>`;
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
  const markdown = await readText(`${entry.path}/${pkg.content.effect}`);
  const canonical = absolute(`effects/${id}/`);
  if (entry.portal_url !== canonical) throw new Error(`Effect catalog URL must match canonical URL: ${id}`);
  const title = `${pkg.title}｜可调 Lightroom 效果提示词 · ToneRelay`;
  const description = shortDescription(pkg.summary);
  const appUrl = absolute(`?preset=${id}#gallery`);
  const packageUrl = `${repo}/tree/main/${entry.path}`;
  const downloadUrl = `${repo}/raw/refs/heads/main/${entry.archive_path}`;
  const sources = pkg.sources.map((source) => `<li><a href="${safeUrl(source.url)}">${escapeHtml(source.title)}</a> · ${escapeHtml(source.creator)}<br><span class="muted">${escapeHtml(source.role)}</span></li>`).join("\n");
  const body = `<p class="eyebrow">候选效果包 · ${escapeHtml(pkg.version)} · 原站照片链接版</p><h1>${escapeHtml(pkg.title)}</h1>
<p class="lead">${escapeHtml(pkg.summary)}</p><div class="actions"><a class="button primary" href="${appUrl}">在画廊中查看</a><a class="button" href="${safeUrl(downloadUrl)}">下载文字链接包</a><a class="button" href="${safeUrl(packageUrl)}">查看包文件</a></div>
<article class="prose" aria-label="效果提示词">${renderMarkdown(markdown)}</article>
<section aria-labelledby="sources-heading"><h2 id="sources-heading">参考教程</h2><p>参考照片通过提示词中的原站直链查看。照片不在本站托管，原站图片的再分发许可未核实。</p><ul class="source-list">${sources}</ul></section>`;
  await writePage(`effects/${id}`, page({ title, description, canonical, type: "article", body, stylesheet: "../../seo.css" }));
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
<div class="actions"><a class="button primary" href="${absolute("#gallery")}">浏览风格与效果</a><a class="button" href="${absolute("#experience")}">打开交互式使用说明</a><a class="button" href="${repo}/blob/main/docs/install-prompt.md">查看安装提示词</a></div>
<article class="prose">${renderMarkdown(intro)}<h2>常见问题</h2>${renderMarkdown(faqSections.join("\n"))}</article>`;
await writePage("experience", page({ title: "ToneRelay 使用说明｜用对话操作 Lightroom Classic", description: "ToneRelay 连接 Agent 与 Lightroom Classic。了解对话修图、真实渲染回读、批量操作、参考图调色，以及风格效果包的使用方式。", canonical: absolute("experience/"), type: "website", body: experienceBody, stylesheet: "../seo.css" }));

const homepageLinks = [
  ...publicStyles.map((pack) => `<li><a href="${pack.url}">${escapeHtml(pack.title)} 风格包</a>：${escapeHtml(shortDescription(pack.summary, 85))}</li>`),
  ...publicEffects.map((pack) => `<li><a href="${pack.url}">${escapeHtml(pack.title)} 效果包</a>：${escapeHtml(shortDescription(pack.summary, 85))}</li>`),
].join("\n");
const staticRoot = `<main lang="zh-CN"><header><h1>ToneRelay：Lightroom 风格与效果画廊</h1><p>ToneRelay 连接 Agent 与 Lightroom Classic。浏览公开胶片风格包和可调效果提示词，查看真实参考、来源署名和使用说明。</p></header>
<nav aria-label="公开页面"><a href="${absolute("experience/")}">了解 ToneRelay 的对话修图方式</a></nav>
<section><h2>公开风格与效果包</h2><ul>${homepageLinks}</ul></section>
<p><a href="${repo}">ToneRelay Portal 项目与公开包文件</a></p></main>`;
const indexPath = join(dist, "index.html");
const index = await readFile(indexPath, "utf8");
const rootPattern = /<div id="root">\s*<\/div>/;
if (!rootPattern.test(index)) throw new Error("Cannot find empty #root in Vite index.html");
await writeFile(indexPath, index.replace(rootPattern, `<div id="root">${staticRoot}</div>`), "utf8");

await writeFile(join(dist, "seo.css"), css, "utf8");
const sitemapUrls = [site, absolute("experience/"), ...publicStyles.map((item) => item.url), ...publicEffects.map((item) => item.url)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated ${publicStyles.length} style pages, ${publicEffects.length} effect pages, experience page, homepage fallback, and sitemap.`);
