"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  CopyIcon,
  HistoryIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { AnimatedList, AnimatedListItem } from "@/shared/ui/animated-list";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Field, FieldTitle } from "@/shared/ui/field";
import {
  getLanguageLabel,
  getLanguageOption,
  LanguageSelectLabel,
} from "@/shared/ui/language-select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import {
  formatHistoryDate,
  getMessageFormatLabel,
  getModelLabel,
} from "../lib/labels";
import type { HistoryItemAction } from "../model/types";
import { CollapsibleCard } from "./collapsible-card";
import { ModelLogo } from "./model-select";

export function HistoryDialog({
  history,
  isClearingHistory,
  isGenerating,
  onClear,
  onRepeat,
}: {
  history: CoverLetterHistoryItem[];
  isClearingHistory: boolean;
  isGenerating: boolean;
  onClear: () => void;
  onRepeat: HistoryItemAction;
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<CoverLetterHistoryItem | null>(null);

  function handleHistoryOpenChange(nextOpen: boolean) {
    setIsHistoryOpen(nextOpen);

    if (!nextOpen) {
      setSelectedItem(null);
    }
  }

  function handleDetailsOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedItem(null);
    }
  }

  function handleRepeat() {
    if (!selectedItem) {
      return;
    }

    onRepeat(selectedItem);
    setIsHistoryOpen(false);
    setSelectedItem(null);
  }

  return (
    <>
      <Dialog open={isHistoryOpen} onOpenChange={handleHistoryOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <HistoryIcon data-icon="inline-start" />
            История
          </Button>
        </DialogTrigger>
        <HistoryDialogContent>
          <DialogHeader className="border-b border-border px-5 py-4 pr-12 sm:px-6 sm:pr-14">
            <DialogTitle>История</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
            <HistoryList history={history} onSelect={setSelectedItem} />
          </div>

          <DialogFooter className="flex-col border-t border-border bg-card px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pb-4">
            <Button
              variant="outline"
              onClick={onClear}
              disabled={!history.length || isClearingHistory}
              className="w-full sm:w-auto"
            >
              <Trash2Icon data-icon="inline-start" />
              {isClearingHistory ? "Очищаю" : "Очистить"}
            </Button>
          </DialogFooter>
        </HistoryDialogContent>
      </Dialog>

      <Dialog open={selectedItem !== null} onOpenChange={handleDetailsOpenChange}>
        <HistoryDialogContent>
          <DialogHeader className="border-b border-border px-5 py-4 pr-12 sm:px-6 sm:pr-14">
            <DialogTitle>Письмо из истории</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
            {selectedItem ? <HistoryItemDetails item={selectedItem} /> : null}
          </div>

          <DialogFooter className="flex-col border-t border-border bg-card px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pb-4">
            <Button
              type="button"
              onClick={handleRepeat}
              disabled={isGenerating || !selectedItem}
              className="w-full sm:w-auto"
            >
              <SparklesIcon data-icon="inline-start" />
              {isGenerating ? "Генерирую" : "Повторить"}
            </Button>
          </DialogFooter>
        </HistoryDialogContent>
      </Dialog>
    </>
  );
}

function HistoryDialogContent({ children }: { children: ReactNode }) {
  return (
    <DialogContent className="top-0 bottom-0 grid h-auto !max-h-none w-full max-w-190 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-none p-0 sm:bottom-0">
      {children}
    </DialogContent>
  );
}

function HistoryList({
  history,
  onSelect,
}: {
  history: CoverLetterHistoryItem[];
  onSelect: HistoryItemAction;
}) {
  return (
    <AnimatedList className="-mb-2 flex flex-col">
      {history.map((item) => (
        <AnimatedListItem key={item.id} itemKey={item.id} spacing="0.5rem">
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full flex-col gap-2 rounded-xl bg-input/20 p-3 text-left transition-colors hover:bg-input/40 focus-visible:bg-input/40 focus-visible:outline-none"
          >
            <span className="flex min-w-0 items-start justify-between gap-3">
              <span className="line-clamp-2 text-sm font-medium">
                {item.title}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {formatHistoryDate(item.createdAt)}
              </span>
            </span>
            <span className="flex flex-wrap gap-1.5">
              <Badge variant="outline">{getLanguageLabel(item.language)}</Badge>
              <Badge variant="outline">
                {getMessageFormatLabel(item.messageFormat)}
              </Badge>
              <Badge variant="outline">{getModelLabel(item.model)}</Badge>
            </span>
            <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              {item.coverLetter}
            </span>
          </button>
        </AnimatedListItem>
      ))}
      {!history.length && (
        <AnimatedListItem
          key="empty-history"
          itemKey="empty-history"
          spacing="0.5rem"
        >
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl bg-input/10 p-6 text-center text-sm text-muted-foreground">
            <HistoryIcon className="size-5" />
            История появится после первой успешной генерации.
          </div>
        </AnimatedListItem>
      )}
    </AnimatedList>
  );
}

function HistoryItemDetails({ item }: { item: CoverLetterHistoryItem }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldTitle>Язык</FieldTitle>
          <HistoryReadonlyValue>
            <HistoryLanguageValue language={item.language} />
          </HistoryReadonlyValue>
        </Field>
        <Field>
          <FieldTitle>Формат</FieldTitle>
          <HistoryReadonlyValue>
            <span className="min-w-0 truncate">
              {getMessageFormatLabel(item.messageFormat)}
            </span>
          </HistoryReadonlyValue>
        </Field>
        <Field>
          <FieldTitle>Модель</FieldTitle>
          <HistoryReadonlyValue>
            <ModelLogo model={item.model} />
            <span className="min-w-0 truncate">{getModelLabel(item.model)}</span>
          </HistoryReadonlyValue>
        </Field>
      </div>

      <HistoryCollapsibleCard
        title="Правила письма"
        contentId="history-rules-content"
        defaultOpen={false}
      >
        <HistoryReadonlyText
          value={item.coverLetterRules.join("\n")}
          className="min-h-28"
        />
      </HistoryCollapsibleCard>

      <HistoryCollapsibleCard
        title="Дополнительные пожелания"
        contentId="history-additional-wishes-content"
        defaultOpen={false}
      >
        <HistoryReadonlyText value={item.additionalWishes} className="min-h-24" />
      </HistoryCollapsibleCard>

      <HistoryCollapsibleCard
        title="Текст вакансии"
        contentId="history-vacancy-content"
        defaultOpen={false}
      >
        <HistoryReadonlyText value={item.vacancyText} className="min-h-40" />
      </HistoryCollapsibleCard>

      <HistoryCollapsibleCard
        title="Письмо"
        contentId="history-cover-letter-content"
        action={<HistoryCopyButton value={item.coverLetter} />}
      >
        <HistoryReadonlyText
          value={item.coverLetter}
          className="min-h-72"
        />
      </HistoryCollapsibleCard>
    </div>
  );
}

function HistoryCollapsibleCard({
  title,
  contentId,
  action,
  defaultOpen,
  children,
}: {
  title: string;
  contentId: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <CollapsibleCard
      title={title}
      contentId={contentId}
      action={action}
      defaultOpen={defaultOpen}
      headerClassName="px-0"
      contentClassName="px-0"
      titleClassName="text-sm"
    >
      {children}
    </CollapsibleCard>
  );
}

function HistoryCopyButton({ value }: { value: string }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Письмо скопировано.");
    } catch {
      toast.error("Не удалось скопировать письмо.");
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Копировать письмо"
          onClick={handleCopy}
        >
          <CopyIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Копировать</TooltipContent>
    </Tooltip>
  );
}

function HistoryReadonlyValue({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 w-full min-w-0 items-center gap-2 rounded-4xl bg-input/30 px-3 py-1 text-sm">
      {children}
    </div>
  );
}

function HistoryReadonlyText({
  value,
  className,
  action,
  emptyLabel = "Нет",
}: {
  value: string;
  className?: string;
  action?: ReactNode;
  emptyLabel?: string;
}) {
  const content = value.trim();

  return (
    <div
      className={cn(
        "relative w-full whitespace-pre-wrap break-words rounded-xl bg-input/30 px-3 py-3 text-sm leading-6",
        !content && "text-muted-foreground",
        action && "pr-14",
        className,
      )}
    >
      {action}
      {content || emptyLabel}
    </div>
  );
}

function HistoryLanguageValue({ language }: { language: string }) {
  const languageOption = getLanguageOption(language);

  if (languageOption) {
    return <LanguageSelectLabel option={languageOption} />;
  }

  return <span className="min-w-0 truncate">{getLanguageLabel(language)}</span>;
}
