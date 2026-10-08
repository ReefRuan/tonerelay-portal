import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(join(root, "style-packs/catalog.json"), "utf8"));
const imageLicenses = /^https:\/\/creativecommons\.org\/(?:licenses\/(?:by|by-sa)\/(?:2\.0|3\.0|4\.0)|publicdomain\/zero\/1\.0)\/$/;
const seenSourceUrls = new Set();
let imageCount = 0;

assert.equal(catalog.packages.length, 6);
for (const entry of catalog.packages) {
  const packDir = join(root, entry.path);
  const archive = join(root, entry.archive_path);
  const pkgBytes = await readFile(join(packDir, "package.json"));
  const pkg = JSON.parse(pkgBytes.toString("utf8"));
  const styleBytes = await readFile(join(packDir, pkg.content.style));
  const style = styleBytes.toString("utf8");
  const refPaths = pkg.content.references;
  assert.equal(pkg.id, entry.package_id);
  assert.equal(pkg.version, entry.version);
  assert.equal(pkg.sources.length, refPaths.length);
  assert.ok(refPaths.length >= 10 && refPaths.length <= 12);
  assert.ok(refPaths.includes(pkg.content.cover_reference));
  assert.deepEqual(await readFile(join(packDir, pkg.content.cover)), await readFile(join(packDir, pkg.content.cover_reference)));

  const archiveRead = (path) => execFileSync("unzip", ["-p", archive, `${pkg.id}/${path}`]);
  assert.deepEqual(archiveRead("package.json"), pkgBytes);
  assert.deepEqual(archiveRead(pkg.content.style), styleBytes);
  assert.deepEqual(archiveRead(pkg.content.cover), await readFile(join(packDir, pkg.content.cover)));

  for (const [index, refPath] of refPaths.entries()) {
    const source = pkg.sources[index];
    const imageBytes = await readFile(join(packDir, refPath));
    const digest = createHash("sha256").update(imageBytes).digest("hex");
    assert.equal(source.reference_files[0], refPath);
    assert.equal(source.sha256, digest);
    assert.equal(source.redistributable, true);
    assert.equal(source.film_stock_claim_checked, true);
    assert.match(source.license_url, imageLicenses);
    assert.ok(style.includes(source.url) && style.includes(source.license_url));
    assert.ok(style.includes(`](${refPath})`));
    assert.ok(!seenSourceUrls.has(source.url), `Duplicate source ${source.url}`);
    seenSourceUrls.add(source.url);
    assert.deepEqual(archiveRead(refPath), imageBytes);

    const preview = join(root, "public/previews", pkg.id, `${String(index + 1).padStart(2, "0")}.webp`);
    const previewBytes = await readFile(preview);
    assert.ok((await stat(preview)).size <= 100_000, `Preview exceeds 100 KB: ${preview}`);
    assert.equal(previewBytes.subarray(0, 4).toString(), "RIFF");
    assert.equal(previewBytes.subarray(8, 12).toString(), "WEBP");
    imageCount++;
  }
  console.log(`${pkg.id}: ${refPaths.length} images, archive and previews verified`);
}

assert.equal(imageCount, 64);
console.log(`Verified ${catalog.packages.length} packages and ${imageCount} licensed reference images.`);
