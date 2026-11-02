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
  await writeFile(join(root, "docs/install-target.json"), JSON.stringify({ repository: "https://github.com/ReefRuan/tonerelay-lightroom-mcp", branch: "main", resolve: "at_execution" }));
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

describe("latest-main install/update prompt generation", () => {
  it("rejects baked-in targets, other repositories, and policies that skip execution-time resolution", () => {
    const policy = { repository: "https://github.com/ReefRuan/tonerelay-lightroom-mcp", branch: "main", resolve: "at_execution" };
    for (const target of [
      { ...policy, commit: "a".repeat(40) },
      { ...policy, version: "0.7.0" },
      { ...policy, repository: "https://example.com/other" },
      { ...policy, branch: "development" },
      { ...policy, resolve: "at_build" },
      null,
    ]) expect(() => validateInstallTarget(target)).toThrow(/at execution time/);
    expect(validateInstallTarget(policy)).toEqual(policy);
  });

  it("keeps all six entries synchronized without baking a commit into copied prompts, and detects drift without writing", async () => {
    const root = await fixture();
    await syncInstallPrompts(root);
    await expect(syncInstallPrompts(root, { check: true })).resolves.toBeUndefined();
    for (const suffix of ["", ".en"]) {
      const short = await readFile(join(root, `docs/install-short-prompt${suffix}.md`), "utf8");
      expect(await readFile(join(root, `README${suffix}.md`), "utf8")).toBe(short);
      const full = await readFile(join(root, `docs/install-prompt${suffix}.md`), "utf8");
      expect(full).toContain("main");
      expect(short).toContain("main");
      expect(full + short).not.toMatch(/\b[a-f0-9]{40}\b/);
      expect(short.startsWith("User-written introduction\n")).toBe(true);
      expect(short.endsWith("\nUser-written footer\n")).toBe(true);
    }
    const path = join(root, "docs/install-prompt.md");
    const current = await readFile(path, "utf8");
    await writeFile(path, replaceGeneratedBlock(current, "install-target", "stale fixed target"));
    await expect(syncInstallPrompts(root, { check: true })).rejects.toThrow(/stale/);
    expect(await readFile(path, "utf8")).toContain("stale fixed target");
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
