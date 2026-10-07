import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";

function environment(primary: () => Promise<void>, fallback: () => boolean) {
  const input = { value: "", style: {}, select: vi.fn(), remove: vi.fn() };
  const focus = vi.fn();
  const appendChild = vi.fn();
  vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn(primary) } });
  vi.stubGlobal("document", { activeElement: { focus }, createElement: vi.fn(() => input), body: { appendChild }, execCommand: vi.fn(fallback) });
  return { input, focus, appendChild };
}
afterEach(() => vi.unstubAllGlobals());
describe("copyText", () => {
  it("uses the primary clipboard without creating a fallback input", async () => {
    const { appendChild } = environment(async () => {}, () => false);
    await copyText("installation");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("installation");
    expect(appendChild).not.toHaveBeenCalled();
  });
  it("uses a successful fallback and restores focus", async () => {
    const { input, focus } = environment(async () => { throw Error("denied"); }, () => true);
    await copyText("uninstallation");
    expect(input.value).toBe("uninstallation");
    expect(input.select).toHaveBeenCalledOnce();
    expect(input.remove).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });
  it("rejects a false fallback result and removes its input", async () => {
    const { input } = environment(async () => { throw Error("denied"); }, () => false);
    await expect(copyText("installation")).rejects.toThrow("Copy was rejected");
    expect(input.remove).toHaveBeenCalledOnce();
  });
  it("rejects fallback exceptions and removes its input", async () => {
    const { input } = environment(async () => { throw Error("denied"); }, () => { throw Error("unsupported"); });
    await expect(copyText("installation")).rejects.toThrow("unsupported");
    expect(input.remove).toHaveBeenCalledOnce();
  });
});
