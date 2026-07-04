"use client";

import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toastTextClassName = "font-normal! tracking-normal! normal-case! not-italic!";

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const Toaster = ({ position, toastOptions, ...props }: ToasterProps) => {
  const toastPosition = position ?? "top-center";
  const toastClassNames = toastOptions?.classNames;

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
          fontFamily: "var(--font-sans)",
        } as CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastClassNames,
          toast: mergeClassNames(
            "cn-toast",
            toastTextClassName,
            toastClassNames?.toast,
          ),
          title: mergeClassNames(toastTextClassName, toastClassNames?.title),
          description: mergeClassNames(
            toastTextClassName,
            toastClassNames?.description,
          ),
          actionButton: mergeClassNames(
            toastTextClassName,
            toastClassNames?.actionButton,
          ),
          cancelButton: mergeClassNames(
            toastTextClassName,
            toastClassNames?.cancelButton,
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
