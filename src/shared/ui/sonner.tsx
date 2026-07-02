"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const MOBILE_TOAST_QUERY = "(max-width: 767px)";

const Toaster = ({ position, ...props }: ToasterProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const toastPosition = isMobile ? "top-center" : (position ?? "bottom-right");

  useEffect(() => {
    const query = window.matchMedia(MOBILE_TOAST_QUERY);
    const syncIsMobile = () => setIsMobile(query.matches);

    syncIsMobile();
    query.addEventListener("change", syncIsMobile);

    return () => query.removeEventListener("change", syncIsMobile);
  }, []);

  return (
    <Sonner
      className="toaster group"
      position={toastPosition}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
