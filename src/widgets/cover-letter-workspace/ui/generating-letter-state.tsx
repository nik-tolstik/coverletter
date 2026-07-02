"use client";

import { useEffect, useState } from "react";

const STATUS_STEPS = [
  { at: 0, text: "Проверяю профиль" },
  { at: 2500, text: "Сверяю опыт с вакансией" },
  { at: 5000, text: "Выбираю сильные факты" },
  { at: 7500, text: "Пишу черновик" },
  { at: 10000, text: "Финально вычитываю" },
];

const DRAFT_LINES = [
  "Здравствуйте! Меня заинтересовала ваша вакансия и задачи, которые стоят перед командой.",
  "Сейчас подбираю опыт из профиля, который лучше всего совпадает с требованиями роли.",
  "Хочу сделать письмо конкретным: без общих фраз, только релевантные факты и спокойный тон.",
  "Осталось собрать финальную версию так, чтобы она звучала естественно и по делу.",
];

const TYPE_DELAY_MS = 34;
const DELETE_DELAY_MS = 18;
const HOLD_DELAY_MS = 900;
const EMPTY_DELAY_MS = 220;

export function GeneratingLetterState() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentLine = DRAFT_LINES[lineIndex];
  const status = `${STATUS_STEPS[statusIndex].text}...`;
  const visibleLine = currentLine.slice(0, visibleLength);

  useEffect(() => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextIndex = STATUS_STEPS.findLastIndex((step) => elapsed >= step.at);

      setStatusIndex(Math.max(nextIndex, 0));
    }, 250);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let delay = isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS;

    if (!isDeleting && visibleLength === currentLine.length) {
      delay = HOLD_DELAY_MS;
    }

    if (isDeleting && visibleLength === 0) {
      delay = EMPTY_DELAY_MS;
    }

    const timeoutId = window.setTimeout(() => {
      if (!isDeleting && visibleLength < currentLine.length) {
        setVisibleLength((currentLength) => currentLength + 1);
        return;
      }

      if (!isDeleting) {
        setIsDeleting(true);
        return;
      }

      if (visibleLength > 0) {
        setVisibleLength((currentLength) => currentLength - 1);
        return;
      }

      setIsDeleting(false);
      setLineIndex((currentIndex) => (currentIndex + 1) % DRAFT_LINES.length);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [currentLine.length, isDeleting, visibleLength]);

  return (
    <div className="flex min-h-[inherit] flex-col gap-4 overflow-hidden">
      <div className="flex flex-1 flex-col gap-5 rounded-xl border border-border/70 bg-card/75 p-4">
        <div className="min-h-28 text-[0.8125rem] leading-6 text-foreground/78">
          <p className="mb-3 text-foreground/35">
            Добрый день! Спасибо за подробное описание роли.
          </p>
          <p>
            {visibleLine}
            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-[typing-caret_900ms_steps(1,end)_infinite] bg-primary" />
          </p>
          <span className="mt-4 block h-2 w-7/12 rounded-full bg-foreground/8" />
          <span className="mt-2 block h-2 w-5/12 rounded-full bg-foreground/8" />
        </div>
      </div>

      <div className="flex min-w-0 justify-start px-1">
        <span className="min-w-0 truncate bg-[linear-gradient(100deg,var(--muted-foreground)_0%,var(--muted-foreground)_38%,color-mix(in_oklch,var(--muted-foreground)_22%,white)_50%,var(--muted-foreground)_62%,var(--muted-foreground)_100%)] bg-clip-text text-xs font-normal text-transparent [background-size:300%_100%] animate-[status-gradient_3.4s_ease-out_infinite]">
          {status}
        </span>
      </div>
    </div>
  );
}
