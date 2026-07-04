"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePenLineIcon,
  FileTextIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Генерация",
    icon: FilePenLineIcon,
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: UserRoundIcon,
  },
  {
    href: "/resume",
    label: "Резюме",
    icon: FileTextIcon,
  },
];

export function AppBottomNavigation() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const activeIndex = navigationItems.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  const safeActiveIndex = activeIndex < 0 ? 0 : activeIndex;

  return (
    <nav
      aria-label="Основная навигация"
      className="scroll-lock-right-gap fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="mx-auto w-full max-w-84 rounded-[1.6rem] border border-white/65 bg-card/55 p-1 shadow-[0_14px_48px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl supports-[backdrop-filter]:bg-card/45 pointer-events-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${navigationItems.length}, minmax(0, 1fr))`,
          }}
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0 left-0 rounded-[1.25rem] border border-white/75 bg-white/70 shadow-[0_8px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.85)] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
            )}
            style={{
              width: `${100 / navigationItems.length}%`,
              transform: `translateX(${safeActiveIndex * 100}%)`,
            }}
          />
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = safeActiveIndex === index;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative z-10 flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[1.2rem] px-2.5 text-[10px] leading-none font-medium transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-transform duration-300 motion-reduce:transition-none",
                    isActive && "-translate-y-0.5",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
