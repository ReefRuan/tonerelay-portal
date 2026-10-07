import { useEffect, useRef } from "react";

export function ManualCopyDialog({ value, onClose }: { value: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    inputRef.current?.focus();
    inputRef.current?.select();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return (
    <dialog ref={dialogRef} className="agent-dialog manual-copy-dialog" aria-labelledby="manual-copy-title" onCancel={onClose}>
      <div className="agent-dialog-topline"><strong id="manual-copy-title">请手动复制</strong><button onClick={onClose} aria-label="关闭手动复制">关闭</button></div>
      <p>自动复制失败。选中以下内容，使用系统复制命令。</p>
      <textarea ref={inputRef} aria-label="待复制内容" readOnly value={value} onFocus={(event) => event.currentTarget.select()} />
    </dialog>
  );
}
