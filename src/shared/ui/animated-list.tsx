"use client";

import { forwardRef, useId, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
} from "motion/react";

import { cn } from "@/shared/lib/utils";

export type AnimatedListVariant = "quiet" | "accordion" | "pop";
type AnimatedListSpacing = number | string;

const smoothEase = [0.16, 1, 0.3, 1] as [number, number, number, number];
const flowEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const animatedListTransitions = {
  quiet: { duration: 0.26, ease: smoothEase },
  accordion: { duration: 0.22, ease: flowEase },
  pop: { type: "spring", stiffness: 680, damping: 42, mass: 0.55 },
} satisfies Record<AnimatedListVariant, Transition>;

type AnimatedListKeyState = {
  keys: string[];
  nextKeyIndex: number;
};

export function AnimatedList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </div>
  );
}

export function AnimatedListItem({
  itemKey,
  variant = "quiet",
  as = "div",
  spacing = 0,
  className,
  children,
}: {
  itemKey: string;
  variant?: AnimatedListVariant;
  as?: "div" | "section";
  spacing?: AnimatedListSpacing;
  className?: string;
  children: ReactNode;
}) {
  const Component = as === "section" ? motion.section : motion.div;

  return (
    <Component
      key={itemKey}
      initial={getAnimatedListInitialState(variant)}
      animate={getAnimatedListAnimateState(variant, spacing)}
      exit={getAnimatedListExitState(variant)}
      transition={animatedListTransitions[variant]}
      className={cn(variant !== "pop" && "overflow-hidden", className)}
    >
      {children}
    </Component>
  );
}

type AnimatedInlineItemProps = {
  itemKey: string;
  className?: string;
  children: ReactNode;
};

export const AnimatedInlineItem = forwardRef<
  HTMLSpanElement,
  AnimatedInlineItemProps
>(function AnimatedInlineItem({ itemKey, className, children }, ref) {
  return (
    <motion.span
      ref={ref}
      layout
      key={itemKey}
      initial={getAnimatedListInitialState("pop")}
      animate={getAnimatedListAnimateState("pop", 0)}
      exit={getAnimatedListExitState("pop")}
      transition={animatedListTransitions.pop}
      className={className}
    >
      {children}
    </motion.span>
  );
});

function getAnimatedListInitialState(variant: AnimatedListVariant) {
  if (variant === "pop") {
    return { opacity: 0, y: 2, scale: 0.92 };
  }

  if (variant === "accordion") {
    return { opacity: 0, height: 0, marginBottom: 0 };
  }

  return { opacity: 0, y: 8, scale: 0.98, height: 0, marginBottom: 0 };
}

function getAnimatedListAnimateState(
  variant: AnimatedListVariant,
  spacing: AnimatedListSpacing,
) {
  if (variant === "pop") {
    return { opacity: 1, y: 0, scale: 1 };
  }

  if (variant === "accordion") {
    return { opacity: 1, height: "auto", marginBottom: spacing };
  }

  return {
    opacity: 1,
    y: 0,
    scale: 1,
    height: "auto",
    marginBottom: spacing,
  };
}

function getAnimatedListExitState(variant: AnimatedListVariant) {
  if (variant === "pop") {
    return { opacity: 0, y: -2, scale: 0.95 };
  }

  if (variant === "accordion") {
    return { opacity: 0, height: 0, marginBottom: 0 };
  }

  return { opacity: 0, y: -4, scale: 0.98, height: 0, marginBottom: 0 };
}

export function AnimatedItemsPresence({
  mode = "sync",
  children,
}: {
  mode?: "sync" | "popLayout" | "wait";
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false} mode={mode}>
      {children}
    </AnimatePresence>
  );
}

export function useAnimatedListKeys(itemCount: number, keyPrefix: string) {
  const instanceId = sanitizeAnimatedListId(useId());
  const [keyState, setKeyState] = useState(() =>
    createAnimatedListKeyState(itemCount, keyPrefix, instanceId, 0),
  );
  const keys = readAnimatedListKeys(
    keyState.keys,
    itemCount,
    keyPrefix,
    instanceId,
  );

  function insertKey(index = itemCount) {
    setKeyState((currentState) => {
      const syncedState = syncAnimatedListKeyState(
        currentState,
        itemCount,
        keyPrefix,
        instanceId,
      );
      const nextKeys = [...syncedState.keys];

      nextKeys.splice(
        index,
        0,
        createAnimatedListKey(
          keyPrefix,
          instanceId,
          syncedState.nextKeyIndex,
        ),
      );

      return {
        keys: nextKeys,
        nextKeyIndex: syncedState.nextKeyIndex + 1,
      };
    });
  }

  function insertKeys(count: number, index = itemCount) {
    if (count <= 0) {
      return;
    }

    setKeyState((currentState) => {
      const syncedState = syncAnimatedListKeyState(
        currentState,
        itemCount,
        keyPrefix,
        instanceId,
      );
      const insertedState = createAnimatedListKeyState(
        count,
        keyPrefix,
        instanceId,
        syncedState.nextKeyIndex,
      );
      const nextKeys = [...syncedState.keys];

      nextKeys.splice(index, 0, ...insertedState.keys);

      return {
        keys: nextKeys,
        nextKeyIndex: insertedState.nextKeyIndex,
      };
    });
  }

  function removeKey(index: number) {
    setKeyState((currentState) => {
      const syncedState = syncAnimatedListKeyState(
        currentState,
        itemCount,
        keyPrefix,
        instanceId,
      );

      return {
        keys: syncedState.keys.filter(
          (_, currentIndex) => currentIndex !== index,
        ),
        nextKeyIndex: syncedState.nextKeyIndex,
      };
    });
  }

  return {
    keys,
    insertKey,
    insertKeys,
    removeKey,
  };
}

function createAnimatedListKey(
  keyPrefix: string,
  instanceId: string,
  keyIndex: number,
) {
  return `${keyPrefix}-${instanceId}-${keyIndex}`;
}

function createAnimatedListKeyState(
  count: number,
  keyPrefix: string,
  instanceId: string,
  startIndex: number,
): AnimatedListKeyState {
  return {
    keys: Array.from({ length: count }, (_, index) =>
      createAnimatedListKey(keyPrefix, instanceId, startIndex + index),
    ),
    nextKeyIndex: startIndex + count,
  };
}

function readAnimatedListKeys(
  keys: string[],
  itemCount: number,
  keyPrefix: string,
  instanceId: string,
) {
  if (keys.length === itemCount) {
    return keys;
  }

  if (keys.length > itemCount) {
    return keys.slice(0, itemCount);
  }

  return [
    ...keys,
    ...Array.from(
      { length: itemCount - keys.length },
      (_, index) => `${keyPrefix}-${instanceId}-pending-${keys.length + index}`,
    ),
  ];
}

function syncAnimatedListKeyState(
  state: AnimatedListKeyState,
  itemCount: number,
  keyPrefix: string,
  instanceId: string,
): AnimatedListKeyState {
  if (state.keys.length === itemCount) {
    return {
      keys: [...state.keys],
      nextKeyIndex: state.nextKeyIndex,
    };
  }

  if (state.keys.length > itemCount) {
    return {
      keys: state.keys.slice(0, itemCount),
      nextKeyIndex: state.nextKeyIndex,
    };
  }

  const addedState = createAnimatedListKeyState(
    itemCount - state.keys.length,
    keyPrefix,
    instanceId,
    state.nextKeyIndex,
  );

  return {
    keys: [...state.keys, ...addedState.keys],
    nextKeyIndex: addedState.nextKeyIndex,
  };
}

function sanitizeAnimatedListId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}
