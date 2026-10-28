import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { replaceGeneratedBlock, syncInstallPrompts, validateInstallTarget } from "./install-prompts.mjs";

const roots = [];
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "tonerelay-install-prompts-"));
  roots.push(root);
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs/install-target.json"), JSON.stringify({ version: "0.7.0", commit: "a".repeat(40) }));
  for (const suffix of ["", ".en"]) {
    for (const [path, block] of [
      [`docs/install-prompt${suffix}.md`, "install-target"],
      [`docs/install-short-prompt${suffix}.md`, "install-short-prompt"],
      [`README${suffix}.md`, "install-short-prompt"],
    ]) {
      await writeFile(join(root, path), `User-written introduction\n<!-- ${block}:start -->\nstale\n<!-- ${block}:end -->\nUser-written footer\n`);
    }
  }
  return root;
}

describe("pinned install/update prompt generation", () => {
  it("rejects floating refs, abbreviated hashes, and missing version metadata", () => {
    for (const target of [
      { version: "latest", commit: "a".repeat(40) },
      { version: "0.7.0", commit: "main" },
      { version: "0.7.0", commit: "3be2179" },
      { commit: "a".repeat(40) },
    ]) expect(() => validateInstallTarget(target)).toThrow(/explicit version/);
  });

  it("keeps all six entries synchronized, preserves surrounding prose, and detects a later target change without writing", async () => {
    const root = await fixture();
    await syncInstallPrompts(root);
    await expect(syncInstallPrompts(root, { check: true })).resolves.toBeUndefined();
    for (const suffix of ["", ".en"]) {
      const short = await readFile(join(root, `docs/install-short-prompt${suffix}.md`), "utf8");
      expect(await readFile(join(root, `README${suffix}.md`), "utf8")).toBe(short);
      const full = await readFile(join(root, `docs/install-prompt${suffix}.md`), "utf8");
      expect(full).toContain("a".repeat(40));
      expect(short).toContain("a".repeat(40));
      expect(short.startsWith("User-written introduction\n")).toBe(true);
      expect(short.endsWith("\nUser-written footer\n")).toBe(true);
    }
    const path = join(root, "docs/install-target.json");
    await writeFile(path, JSON.stringify({ version: "0.7.1", commit: "b".repeat(40) }));
    await expect(syncInstallPrompts(root, { check: true })).rejects.toThrow(/stale/);
    expect(await readFile(join(root, "docs/install-prompt.md"), "utf8")).not.toContain("b".repeat(40));
    await syncInstallPrompts(root);
    await expect(syncInstallPrompts(root, { check: true })).resolves.toBeUndefined();
  });

  it("fails closed for missing, duplicated, or reversed generated boundaries", () => {
    for (const source of [
      "manual text only",
      "<!-- target:end --><!-- target:start -->",
      "<!-- target:start --><!-- target:start --><!-- target:end -->",
    ]) expect(() => replaceGeneratedBlock(source, "target", "new content")).toThrow(/exactly one ordered/);
  });

  it("preserves Windows checkout line endings so an unchanged target passes the build check", () => {
    const source = "intro\r\n<!-- target:start -->\r\nold\r\n<!-- target:end -->\r\nfooter\r\n";
    const updated = replaceGeneratedBlock(source, "target", "version\ncommit");
    expect(updated).toBe(source.replace("old", "version\r\ncommit"));
    expect(replaceGeneratedBlock(updated, "target", "version\ncommit")).toBe(updated);
  });
});
