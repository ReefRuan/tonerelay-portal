import { describe, expect, it, vi } from "vitest";
import entry from "../index.html?raw";
import chinesePromptDocument from "../docs/install-short-prompt.md?raw";
import englishPromptDocument from "../docs/install-short-prompt.en.md?raw";
import { extractShortPrompt, renderBootInstallFallback } from "./bootFallback";

// The application deliberately has browser-only types; this builtin is used only by Vitest.
const { runInNewContext } = await vi.importActual<{
  runInNewContext: (code: string, context: Record<string, unknown>) => unknown;
}>("node:vm");

class BootElement {
  hidden = false;
  dataset: Record<string, string> = {};
  textContent = "";
  value = "";
  inert = false;
  style: Record<string, string> = {};
  attributes: Record<string, string> = {};
  classes = new Set<string>();
  listeners = new Map<string, (event: { target: BootElement }) => void>();
  classList = {
    add: (...names: string[]) => names.forEach((name) => this.classes.add(name)),
    remove: (...names: string[]) => names.forEach((name) => this.classes.delete(name)),
    contains: (name: string) => this.classes.has(name),
  };
  remove = vi.fn();
  focus = vi.fn();
  select = vi.fn();
  addEventListener = vi.fn((event: string, handler: (event: { target: BootElement }) => void) => this.listeners.set(event, handler));
  setAttribute(name: string, value: string) { this.attributes[name] = value; }
  getAttribute(name: string) { return this.attributes[name] ?? null; }
  dispatch(event: string) { this.listeners.get(event)?.({ target: this }); }
}

function executeBoot(search = "", writeText: (text: string) => Promise<void> = async () => {}, cssReady = true) {
  const scripts = [...entry.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  const source = scripts.find((script) => script[1].includes("window.__bootDone"))?.[1];
  expect(source, "the independent boot controller must remain inline").toBeDefined();

  const ids = new Map<string, BootElement>();
  for (const id of ["boot", "boot-loading", "boot-fallback", "root", "boot-prompt-zh", "boot-prompt-en", "boot-feedback-zh", "boot-feedback-en"]) {
    ids.set(id, new BootElement());
  }
  ids.get("boot-fallback")!.hidden = true;
  const controls = {
    panels: [new BootElement(), new BootElement()],
    copies: [new BootElement(), new BootElement()],
    enter: [new BootElement(), new BootElement()],
    stylesheets: [new BootElement()],
  };
  for (const [index, language] of ["zh", "en"].entries()) {
    controls.panels[index].dataset.bootLanguage = language;
    controls.panels[index].hidden = language === "en";
    controls.copies[index].dataset.bootCopy = `boot-prompt-${language}`;
    controls.copies[index].setAttribute("aria-describedby", `boot-feedback-${language}`);
    controls.enter[index].hidden = true;
    ids.get(`boot-prompt-${language}`)!.value = extractShortPrompt(language === "en" ? englishPromptDocument : chinesePromptDocument);
  }
  const selectors = new Map<string, BootElement>();
  const documentElement = { lang: "zh-CN" };
  const timerTasks = new Map<number, { due: number; callback: () => void }>();
  let now = 0;
  let timerId = 0;
  const setTimeout = (callback: () => void, delay = 0) => {
    timerTasks.set(++timerId, { due: now + delay, callback });
    return timerId;
  };
  const clearTimeout = (id: number) => { timerTasks.delete(id); };
  const reload = vi.fn();
  let uiCssReady = cssReady;
  const getComputedStyle = () => ({
    getPropertyValue: (property: string) => property === "--tonerelay-ui-ready" && uiCssReady ? "1" : "",
  });
  const window: { location: { search: string; reload: typeof reload }; getComputedStyle: typeof getComputedStyle; __bootDone?: () => void } = {
    location: { search, reload }, getComputedStyle,
  };
  const document = {
    documentElement,
    getElementById: (id: string) => ids.get(id) ?? null,
    querySelector: (selector: string) => {
      const id = selector.match(/^#([\w-]+)$/)?.[1];
      if (id) return ids.get(id) ?? null;
      if (!selectors.has(selector)) selectors.set(selector, new BootElement());
      return selectors.get(selector)!;
    },
    querySelectorAll: (selector: string) => ({
      "[data-boot-language]": controls.panels,
      "[data-boot-copy]": controls.copies,
      "[data-boot-enter]": controls.enter,
      'link[rel="stylesheet"]': controls.stylesheets,
      "link[rel=stylesheet]": controls.stylesheets,
    })[selector] ?? [],
    execCommand: vi.fn(() => true),
  };

  runInNewContext(source!, {
    window, document, URLSearchParams, setTimeout, clearTimeout, getComputedStyle,
    navigator: { clipboard: { writeText: vi.fn(writeText) } },
    requestAnimationFrame: (callback: () => void) => setTimeout(callback, 16),
    console,
  });

  return {
    boot: ids.get("boot")!,
    loading: ids.get("boot-loading")!,
    fallback: ids.get("boot-fallback")!,
    root: ids.get("root")!,
    documentElement,
    controls,
    ids,
    reload,
    setCssReady(value: boolean) { uiCssReady = value; },
    done: () => {
      expect(window.__bootDone).toBeTypeOf("function");
      window.__bootDone!();
    },
    advance(milliseconds: number) {
      const end = now + milliseconds;
      for (;;) {
        const next = [...timerTasks.entries()]
          .filter(([, task]) => task.due <= end)
          .sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        now = next[1].due;
        timerTasks.delete(next[0]);
        next[1].callback();
      }
      now = end;
    },
  };
}

describe("independent slow-loading installation fallback", () => {
  it("extracts only the copyable short prompt rather than its document commentary", () => {
    expect(extractShortPrompt("# Explanation\n\n```text\nInstall ToneRelay.\nRead INSTALL-PROMPT.md.\n```\n\nNot part of the prompt."))
      .toBe("Install ToneRelay.\nRead INSTALL-PROMPT.md.");
    expect(extractShortPrompt(chinesePromptDocument)).toContain("先只读检查已有安装");
    expect(extractShortPrompt(englishPromptDocument)).toContain("Check existing installations read-only first");
    expect(() => extractShortPrompt("No fenced installation instructions.")).toThrow();
  });

  it("embeds both complete short prompts and explicit MCP installation document paths", () => {
    const html = renderBootInstallFallback(chinesePromptDocument, englishPromptDocument);
    expect(html).toContain('id="boot-fallback"');
    expect(html).toMatch(/\bid="boot-fallback"[^>]*\bhidden\b/);
    for (const [source, suffix] of [[chinesePromptDocument, ""], [englishPromptDocument, ".en"]]) {
      const prompt = extractShortPrompt(source);
      for (const line of prompt.split("\n").filter(Boolean)) expect(html).toContain(line);
      for (const host of ["github.com", "gitee.com"]) {
        expect(html).toContain(`https://${host}/ReefRuan/tonerelay-lightroom-mcp/blob/main/INSTALL-PROMPT${suffix}.md`);
      }
    }
  });

  it("keeps usable refresh, direct-install and author contact content without the React bundle", () => {
    const html = renderBootInstallFallback(chinesePromptDocument, englishPromptDocument);
    expect(html).toContain("刷新");
    expect(html).toContain("直接安装");
    expect(html).toMatch(/reload|Refresh/i);
    expect(html).toContain("1843727310");
    expect(html).toContain("leningruan1@gmail.com");
    expect(html).toContain("mailto:leningruan1@gmail.com");
    expect(html).not.toMatch(/<script\b[^>]*\bsrc=|<iframe\b|\/src\/|\/assets\/|import\s*\(|createRoot\(/);
    expect(html).not.toContain("reefruan.github.io/tonerelay-portal");
  });

  it("escapes prompt markup so pasted documentation cannot close the field or inject HTML", () => {
    const dangerous = "```text\nRead <settings> & compare.\n</textarea><img src=x onerror=alert(1)><script>alert(1)</script>\n```";
    const html = renderBootInstallFallback(dangerous, dangerous);
    expect(html).toContain("&lt;settings&gt; &amp; compare.");
    expect(html).toContain("&lt;/textarea&gt;");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("also exposes the independently styled fallback when JavaScript is disabled", () => {
    const noScript = entry.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];
    expect(noScript).toBeDefined();
    expect(noScript).toMatch(/#boot\s+#boot-loading\s*\{\s*display\s*:\s*none\s*\}/);
    expect(noScript).toMatch(/#boot\s+#boot-fallback\[hidden\]\s*\{\s*display\s*:\s*block\s*!important\s*\}/);
    expect(noScript).not.toMatch(/#boot\s*\{[^}]*display\s*:\s*none/);
    const fallback = renderBootInstallFallback(chinesePromptDocument, englishPromptDocument);
    expect(fallback).toMatch(/<noscript>[\s\S]*手动选中并复制[\s\S]*<\/noscript>/);
    expect(fallback).toMatch(/<noscript>[\s\S]*Select and copy the prompt below manually[\s\S]*<\/noscript>/);
  });

  it("selects only the requested language panel without depending on stored client state", async () => {
    const runtime = executeBoot("?lang=en");
    expect(runtime.documentElement.lang).toBe("en");
    expect(runtime.controls.panels[0].hidden).toBe(true);
    expect(runtime.controls.panels[1].hidden).toBe(false);
    expect(runtime.fallback.getAttribute("aria-labelledby")).toBe("boot-title-en");
    runtime.controls.copies[1].dispatch("click");
    await Promise.resolve();
    expect(runtime.ids.get("boot-feedback-en")!.textContent).toContain("Copied");
  });

  it("selects the intact prompt for manual copying when clipboard access fails", async () => {
    const runtime = executeBoot("", async () => { throw new Error("clipboard denied"); });
    runtime.advance(10001);
    runtime.controls.copies[0].dispatch("click");
    await Promise.resolve();
    await Promise.resolve();
    const field = runtime.ids.get("boot-prompt-zh")!;
    expect(field.focus).toHaveBeenCalledOnce();
    expect(field.select).toHaveBeenCalledOnce();
    expect(field.value).toBe(extractShortPrompt(chinesePromptDocument));
    expect(runtime.ids.get("boot-feedback-zh")!.textContent).toContain("手动复制");
    expect(runtime.boot.remove).not.toHaveBeenCalled();
  });

  it("never treats an elapsed timeout as application readiness", () => {
    expect(entry).not.toMatch(/setTimeout\(\s*window\.__bootDone\s*,\s*5000\s*\)/);
    const runtime = executeBoot();
    runtime.advance(3001);
    expect(runtime.loading.hidden).toBe(false);
    expect(runtime.fallback.hidden).toBe(true);
    expect(runtime.boot.classList.contains("is-slow")).toBe(false);
    runtime.advance(6998);
    expect(runtime.loading.hidden).toBe(false);
    expect(runtime.fallback.hidden).toBe(true);
    expect(runtime.boot.classList.contains("is-slow")).toBe(false);
    runtime.advance(2);
    expect(runtime.boot.classList.contains("is-slow")).toBe(true);
    expect(runtime.loading.hidden).toBe(true);
    expect(runtime.fallback.hidden).toBe(false);
    expect(runtime.boot.classList.contains("is-done")).toBe(false);
    runtime.advance(30_000);
    expect(runtime.boot.remove).not.toHaveBeenCalled();
    expect(runtime.fallback.hidden).toBe(false);
  });

  it("dismisses even an already-visible fallback only after the actual app-ready callback", () => {
    const runtime = executeBoot();
    runtime.advance(10001);
    runtime.done();
    expect(runtime.boot.classList.contains("is-done")).toBe(true);
    expect(runtime.boot.remove).not.toHaveBeenCalled();
    runtime.advance(700);
    expect(runtime.boot.remove).toHaveBeenCalledOnce();
  });

  it("does not reveal the fallback later when the application was ready before the timeout", () => {
    const runtime = executeBoot();
    runtime.advance(100);
    runtime.done();
    runtime.done();
    runtime.advance(30_000);
    expect(runtime.fallback.hidden).toBe(true);
    expect(runtime.boot.classList.contains("is-slow")).toBe(false);
    expect(runtime.boot.remove).toHaveBeenCalledOnce();
  });

  it("preserves an in-use fallback when the app becomes ready and lets the user enter explicitly", () => {
    const runtime = executeBoot();
    expect(runtime.root.inert).toBe(true);
    runtime.advance(10001);
    runtime.fallback.dispatch("focusin");
    runtime.done();
    runtime.advance(1000);
    expect(runtime.boot.classList.contains("is-done")).toBe(false);
    expect(runtime.boot.remove).not.toHaveBeenCalled();
    expect(runtime.controls.enter.every((button) => !button.hidden)).toBe(true);
    runtime.controls.enter[0].dispatch("click");
    runtime.advance(500);
    expect(runtime.root.inert).toBe(false);
    expect(runtime.boot.remove).toHaveBeenCalledOnce();
  });

  it("keeps the styled fallback available when React mounted without its stylesheet, then retries on CSS load", () => {
    const runtime = executeBoot("", async () => {}, false);
    runtime.done();
    runtime.advance(10001);
    expect(runtime.boot.classList.contains("is-done")).toBe(false);
    expect(runtime.boot.remove).not.toHaveBeenCalled();
    expect(runtime.loading.hidden).toBe(true);
    expect(runtime.fallback.hidden).toBe(false);
    expect(runtime.root.inert).toBe(true);
    runtime.setCssReady(true);
    runtime.controls.stylesheets[0].dispatch("load");
    expect(runtime.boot.classList.contains("is-done")).toBe(true);
    runtime.advance(500);
    expect(runtime.root.inert).toBe(false);
    expect(runtime.boot.remove).toHaveBeenCalledOnce();
  });

  it("does not mistake a stylesheet load for a successful application mount", () => {
    const runtime = executeBoot("", async () => {}, false);
    runtime.setCssReady(true);
    runtime.controls.stylesheets[0].dispatch("load");
    runtime.advance(10001);
    expect(runtime.boot.remove).not.toHaveBeenCalled();
    expect(runtime.boot.classList.contains("is-done")).toBe(false);
    expect(runtime.fallback.hidden).toBe(false);
    runtime.done();
    runtime.advance(500);
    expect(runtime.boot.remove).toHaveBeenCalledOnce();
  });

  it("uses native refresh links that do not depend on JavaScript event handlers", () => {
    const html = renderBootInstallFallback(chinesePromptDocument, englishPromptDocument);
    const links = [...html.matchAll(/<a\b[^>]*class="boot-refresh"[^>]*>[\s\S]*?<\/a>/g)];
    expect(links).toHaveLength(2);
    expect(links[0][0]).toContain("刷新页面");
    expect(links[1][0]).toContain("Refresh page");
    for (const [link] of links) {
      expect(link).toContain('href=""');
      expect(link).not.toMatch(/onclick|javascript:|data-boot-refresh/);
    }
  });
});
