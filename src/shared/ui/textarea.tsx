"use client"

import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Textarea({
  className,
  onInput,
  rows = 3,
  ...props
}: React.ComponentProps<"textarea">) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const resizeTextarea = React.useCallback((textarea?: HTMLTextAreaElement | null) => {
    if (!textarea) {
      return
    }

    textarea.style.height = "auto"

    const maxHeight = Number.parseFloat(getComputedStyle(textarea).maxHeight)
    const hasMaxHeight = Number.isFinite(maxHeight)
    const nextHeight = hasMaxHeight
      ? Math.min(textarea.scrollHeight, maxHeight)
      : textarea.scrollHeight

    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY =
      hasMaxHeight && textarea.scrollHeight > maxHeight ? "auto" : "hidden"
  }, [])

  React.useLayoutEffect(() => {
    resizeTextarea(textareaRef.current)
  }, [props.value, resizeTextarea])

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      rows={rows}
      className={cn(
        "flex max-h-[min(60dvh,32rem)] w-full resize-none overflow-y-hidden rounded-xl bg-input/30 px-3 py-3 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onInput={(event) => {
        resizeTextarea(event.currentTarget)
        onInput?.(event)
      }}
      {...props}
    />
  )
}

export { Textarea }
