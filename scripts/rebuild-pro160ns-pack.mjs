// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const id = "fuji-film-pro-160ns";
const version = "1.2.0";
const packDir = join(root, "style-packs/packages", id);
const previewDir = join(root, "public/previews", id);
const archivePath = join(root, "style-packs/downloads", `${id}-v${version}.zip`);
const sRGB = "/System/Library/ColorSync/Profiles/sRGB Profile.icc";
const checkedAt = new Date().toISOString().slice(0, 10);

// Every URL, license and film claim below was checked on the photographer's Flickr page.
// Recheck the live page before rebuilding; an Openverse search result is not proof.
const selection = [
  {
    owner: "19924293@N08", photo: "16203711663", creator: "doca doca",
    title: "150315B7528PN160NS", license: "by", evidence: "PN160NS",
    image: "https://live.staticflickr.com/8592/16203711663_e2196ba9e9_b.jpg",
    role: "封面与硬光建筑场景：楼梯、人物、浅色天空和深暗部保持清楚的几何分界；胶片型号来自作者标题编码。",
  },
  {
    owner: "55128416@N05", photo: "27607395300", creator: "brenkee",
    title: "Pick your own lavender", license: "cc0", evidence: "160ns",
    image: "https://live.staticflickr.com/7236/27607395300_041d31f7d7_b.jpg",
    role: "柔和户外人像：肤色、紫花与深绿植被同框，观察颜色如何保持主次。",
  },
  {
    owner: "37259551@N00", photo: "4278021387", creator: "fukapon",
    title: "信号待ち、自転車の少女。その対角点にて", license: "by", evidence: "pro160ns",
    image: "https://live.staticflickr.com/4062/4278021387_422e99aeab_b.jpg",
    role: "街头人物与景深：浅色衣物、肤色和冷色街景的关系。型号来自作者标签；扫描和后期可能参与了最终颜色。",
  },
  {
    owner: "46155474@N00", photo: "5778318842", creator: "Matteo Bagnoli",
    title: "Fresca era ll'aria....", license: "by-sa", evidence: "Fuji Pro160ns",
    image: "https://live.staticflickr.com/2735/5778318842_2843504800_b.jpg",
    role: "粉色玫瑰、蓝天与浅色墙面：明亮环境里保留鲜明但不过度统一的颜色。",
  },
  {
    owner: "90975693@N05", photo: "29580739363", creator: "tommy@chau",
    title: "without you", license: "by", evidence: "fujicolorpro160ns",
    image: "https://live.staticflickr.com/7523/29580739363_4e2e007e6f_b.jpg",
    role: "树下人物、草地与广阔天空：观察低反差远景和环境人像的空间层次。",
  },
  {
    owner: "80318369@N00", photo: "6439022077", creator: "Thomas Claveirole",
    title: "Casiers, ancienne Institution Saint-Joseph, Laxou, France, 2011", license: "by-sa", evidence: "pro160ns160iso",
    image: "https://live.staticflickr.com/7174/6439022077_325912540f_b.jpg",
    role: "室内格柜与散落纸张：浅色材料、暖光和暗角有明确层次；胶片型号来自作者标签，不把空间本身的旧色当成胶片特征。",
  },
  {
    owner: "52730397@N05", photo: "7913235590", creator: "yo___ko",
    title: "朝に洗われて、", license: "by", evidence: "PRO160NS",
    image: "https://live.staticflickr.com/8181/7913235590_07c54f4ddd_b.jpg",
    role: "日出与湿沙倒影：暖光、冷天空和深色海面的层次；日出本身不是固定暖色预设。",
  },
  {
    owner: "23959464@N00", photo: "7641788638", creator: "uemu",
    title: "Kujukurihama Shirasato Beach", license: "by", evidence: "Fujifilm Pro 160 NS",
    image: "https://live.staticflickr.com/8001/7641788638_27a04d12a4_b.jpg",
    role: "雾天低反差边界：救生椅和海天仍有微差；雾与扫描路径不能推广为胶片常态。",
  },
  {
    owner: "27528003@N02", photo: "18396389728", creator: "skha818",
    title: "rollriflex protrait 160ns", license: "by-sa", evidence: "rollriflex protrait 160ns",
    image: "https://live.staticflickr.com/560/18396389728_ca7733dbfc_b.jpg",
    role: "自然光人像：肤色、浅蓝衣物和室内背景仍能分开。标题是作者的 160NS 标注；人物受光与扫描方式不等于胶片固定配方。",
  },
  {
    owner: "94163348@N02", photo: "14794283730", creator: "snopy645",
    title: "FUJI PRO 160 NS", license: "by", evidence: "FUJI PRO 160 NS",
    image: "https://live.staticflickr.com/3842/14794283730_8e84ac5401_b.jpg",
    role: "树荫中的猫与石柱：用清楚的主体、浅色石材和绿叶观察柔光关系。型号来自作者标题。",
  },
  {
    owner: "55128416@N05", photo: "27309772244", creator: "brenkee",
    title: "Mom picking lavender", license: "cc0", evidence: "160ns",
    image: "https://live.staticflickr.com/7427/27309772244_c48c4d0624_b.jpg",
    role: "另一位人物在花田中的柔光对照：浅色衣物、肤色、紫花和绿色各留位置。",
  },
];

const licenseUrl = (kind) => kind === "cc0"
  ? "https://creativecommons.org/publicdomain/zero/1.0/"
  : `https://creativecommons.org/licenses/${kind}/2.0/`;
const licenseName = (kind) => kind === "cc0" ? "CC0 1.0" : `CC ${kind.toUpperCase()} 2.0`;
const curl = (url) => execFileSync("curl", ["-L", "-sS", "--fail", "--max-time", "30", url], { maxBuffer: 24_000_000 });
const dimensions = (path) => {
  const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path], { encoding: "utf8" });
  return [Number(output.match(/pixelWidth: (\d+)/)?.[1]), Number(output.match(/pixelHeight: (\d+)/)?.[1])];
};

const originalPackage = JSON.parse(await readFile(join(packDir, "package.json"), "utf8"));
const originalStyle = await readFile(join(packDir, "style.md"), "utf8");
const body = originalStyle.split("## 公开参考图与使用边界")[0].trimEnd();
assert.ok(body.includes("## 调色决策顺序"), "Missing distilled style body");
assert.equal(selection.length, 11);

const temporaryRoot = await mkdtemp(join(tmpdir(), "tonerelay-pro160ns-"));
try {
  const temporaryPack = join(temporaryRoot, id);
  const temporaryRefs = join(temporaryPack, "references");
  const temporaryPreviews = join(temporaryRoot, "previews");
  await mkdir(temporaryRefs, { recursive: true });
  await mkdir(temporaryPreviews, { recursive: true });
  const sources = [];
  const gallery = [
    "## 公开参考图与使用边界",
    "",
    "正文综合了 Studio 更广泛的胶片实拍研究；以下图片另经逐张许可核对，供公开展示和视觉对照，不是正文的唯一依据。摄影师的拍摄、曝光、冲扫、扫描与输出都会影响观感，不能从单张照片反推固定 Lightroom 数值。",
    "",
  ];

  for (const [index, item] of selection.entries()) {
    const number = String(index + 1).padStart(2, "0");
    const pageUrl = `https://www.flickr.com/photos/${item.owner}/${item.photo}/`;
    const html = curl(pageUrl).toString("utf8");
    assert.ok(html.includes(licenseUrl(item.license)), `${number}: source license changed`);
    assert.ok(html.includes(item.image), `${number}: source image changed`);
    assert.ok(html.toLowerCase().includes(item.evidence.toLowerCase()), `${number}: film claim missing`);

    const sourceFile = join(temporaryRoot, `${number}-source.jpg`);
    const reference = join(temporaryRefs, `${number}.jpg`);
    const photoBytes = curl(item.image);
    assert.equal(photoBytes[0], 0xff, `${number}: not JPEG`);
    assert.equal(photoBytes[1], 0xd8, `${number}: not JPEG`);
    await writeFile(sourceFile, photoBytes);
    const [width, height] = dimensions(sourceFile);
    assert.ok(width >= 600 && height >= 600, `${number}: source too small`);
    const sipsArgs = ["-m", sRGB, "-s", "format", "jpeg", "-s", "formatOptions", "90"];
    if (Math.max(width, height) > 1200) sipsArgs.push("-Z", "1200");
    execFileSync("sips", [...sipsArgs, sourceFile, "--out", reference], { stdio: "ignore" });
    const [outputWidth, outputHeight] = dimensions(reference);
    assert.ok(Math.max(outputWidth, outputHeight) <= 1200, `${number}: reference too large`);
    const referenceBytes = await readFile(reference);

    const preview = join(temporaryPreviews, `${number}.webp`);
    for (const [size, quality] of [[900, 76], [800, 66], [720, 58]]) {
      execFileSync("cwebp", ["-quiet", "-q", String(quality), "-resize", String(size), "0", reference, "-o", preview]);
      if ((await stat(preview)).size <= 100_000) break;
    }
    assert.ok((await stat(preview)).size <= 100_000, `${number}: preview exceeds 100 KB`);

    const referencePath = `references/${number}.jpg`;
    sources.push({
      id: `${id}__flickr__${item.photo}`,
      title: item.title,
      url: pageUrl,
      creator: item.creator,
      license: licenseName(item.license),
      license_url: licenseUrl(item.license),
      redistributable: true,
      film_stock_claim_checked: true,
      rights_note: `Flickr source page and film claim checked ${checkedAt}; resized to at most 1200 px, converted to sRGB JPEG, and generated a WebP page preview.`,
      reference_files: [referencePath],
      image_url: item.image,
      sha256: createHash("sha256").update(referenceBytes).digest("hex"),
    });
    gallery.push(
      `### ${number} — ${item.title}`,
      "",
      `![${item.title}（${item.creator}）](${referencePath})`,
      "",
      `${item.role} 摄影师：[${item.creator}](${pageUrl}) · [原图](${pageUrl}) · [${licenseName(item.license)}](${licenseUrl(item.license)})。`,
      "",
    );
    console.log(`${number}: ${item.title} — ${licenseName(item.license)}`);
  }

  await copyFile(join(temporaryRefs, "01.jpg"), join(temporaryPack, "cover.jpg"));
  const pkg = {
    ...originalPackage,
    version,
    built_at: new Date().toISOString(),
    public_release_note: "PRO 160NS visual recuration: 11 author-attributed, film-claimed CC photos selected across portraits, flora, street, architecture and coastal light. Distilled text retains its broader private research basis; private images are not included.",
    sources,
  };
  await writeFile(join(temporaryPack, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  await writeFile(join(temporaryPack, "style.md"), `${body}\n\n${gallery.join("\n").trimEnd()}\n`);
  const temporaryArchive = join(temporaryRoot, `${id}-v${version}.zip`);
  execFileSync("zip", ["-X", "-q", "-r", temporaryArchive, id], { cwd: temporaryRoot });

  await mkdir(previewDir, { recursive: true });
  for (let index = 1; index <= selection.length; index++) {
    const number = String(index).padStart(2, "0");
    await copyFile(join(temporaryRefs, `${number}.jpg`), join(packDir, "references", `${number}.jpg`));
    await copyFile(join(temporaryPreviews, `${number}.webp`), join(previewDir, `${number}.webp`));
  }
  for (const name of ["cover.jpg", "package.json", "style.md"]) {
    await copyFile(join(temporaryPack, name), join(packDir, name));
  }
  await copyFile(temporaryArchive, archivePath);
  console.log(`Built ${id} v${version} with ${selection.length} references and matching previews.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
