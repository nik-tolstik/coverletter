"use client";

import { useId, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "motion/react";

import { cn } from "@/shared/lib/utils";

export type AnimatedListVariant = "quiet" | "accordion" | "pop";

const smoothEase = [0.16, 1, 0.3, 1] as [number, number, number, number];
const flowEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const animatedListVariants = {
  quiet: {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -6, scale: 0.98 },
  },
  accordion: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  },
  pop: {
    initial: { opacity: 0, y: 2, scale: 0.92 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -2, scale: 0.95 },
  },
} satisfies Record<AnimatedListVariant, Variants>;

const animatedListTransitions = {
  quiet: { duration: 0.28, ease: smoothEase },
  accordion: { duration: 0.24, ease: flowEase },
  pop: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 },
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
    <motion.div layout className={className}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </motion.div>
  );
}

export function AnimatedListItem({
  itemKey,
  variant = "quiet",
  as = "div",
  className,
  children,
}: {
  itemKey: string;
  variant?: AnimatedListVariant;
  as?: "div" | "section";
  className?: string;
  children: ReactNode;
}) {
  const Component = as === "section" ? motion.section : motion.div;

  return (
    <Component
      layout
      key={itemKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animatedListVariants[variant]}
      transition={animatedListTransitions[variant]}
      className={cn(variant === "accordion" && "overflow-hidden", className)}
    >
      {children}
    </Component>
  );
}

export function AnimatedInlineItem({
  itemKey,
  className,
  children,
}: {
  itemKey: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.span
      layout
      key={itemKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animatedListVariants.pop}
      transition={animatedListTransitions.pop}
      className={className}
    >
      {children}
    </motion.span>
  );
}

export function AnimatedItemsPresence({ children }: { children: ReactNode }) {
  return <AnimatePresence initial={false}>{children}</AnimatePresence>;
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
