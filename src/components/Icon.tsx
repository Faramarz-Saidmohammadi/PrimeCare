type IconName = "arrow" | "calendar" | "check" | "clock" | "mail" | "map" | "menu" | "phone" | "quote" | "sparkle" | "tooth" | "x";

export function Icon({ name, size = 22, className = "" }: { name: IconName; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-2-2 2c-4-1.5-6.5-4-8-8l2-2-2-4Z"/>,
    quote: <><path d="M9 11H5a4 4 0 0 0 4 4v3H5v-3a8 8 0 0 1 4-8Z"/><path d="M19 11h-4a4 4 0 0 0 4 4v3h-4v-3a8 8 0 0 1 4-8Z"/></>,
    sparkle: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
    tooth: <path d="M12 4c-1.7-1.2-3.3-1.4-4.8-.7C4.8 4.5 4.3 7.5 5 10c.8 2.8 1.4 8.8 3.2 9 1.5.2 1.3-5.5 3.8-5.5s2.3 5.7 3.8 5.5c1.8-.2 2.4-6.2 3.2-9 .7-2.5.2-5.5-2.2-6.7-1.5-.7-3.1-.5-4.8.7Z"/>,
    x: <><path d="m6 6 12 12M18 6 6 18"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}
