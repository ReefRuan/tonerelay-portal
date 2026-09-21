import type { SVGProps } from "react";

export type IconName =
  | "arrow"
  | "back"
  | "check"
  | "close"
  | "collapse"
  | "controller"
  | "copy"
  | "details"
  | "external"
  | "filter"
  | "next"
  | "search";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const shared = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h13" /><path d="m14 7 5 5-5 5" /></>,
    back: <><path d="M19 12H6" /><path d="m10 7-5 5 5 5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    collapse: <><path d="M7 9h10" /><path d="m9 13 3 3 3-3" /></>,
    controller: <><path d="M4 8.5h16" /><path d="M7 12h10" /><path d="M9.5 15.5h5" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    details: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
    external: <><path d="M14 5h5v5" /><path d="m19 5-8 8" /><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    next: <><path d="m8 5 7 7-7 7" /><path d="M16 5v14" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  };

  return <svg {...shared}>{paths[name]}</svg>;
}
