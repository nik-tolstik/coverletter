"use client";

import { useState } from "react";
import { HistoryIcon, SparklesIcon, Trash2Icon } from "lucide-react";

import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { getLanguageLabel } from "@/shared/ui/language-select";
import { Textarea } from "@/shared/ui/textarea";

import {
  formatHistoryDate,
  getMessageFormatLabel,
  getModelLabel,
} from "../lib/labels";
import type { HistoryItemAction } from "../model/types";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<CoverLetterHistoryItem | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setSelectedItem(null);
    }
  }

  function handleRepeat() {
    if (!selectedItem) {
      return;
    }

    onRepeat(selectedItem);
    setIsOpen(false);
    setSelectedItem(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <HistoryIcon data-icon="inline-start" />
          История
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            {selectedItem ? "Письмо из истории" : "История"}
          </DialogTitle>
        </DialogHeader>

        {selectedItem ? (
          <HistoryItemDetails item={selectedItem} />
        ) : (
          <HistoryList history={history} onSelect={setSelectedItem} />
        )}

        <DialogFooter>
          {selectedItem ? (
            <>
              <Button
                type="button"
                onClick={handleRepeat}
                disabled={isGenerating}
              >
                <SparklesIcon data-icon="inline-start" />
                {isGenerating ? "Генерирую" : "Повторить"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedItem(null)}
              >
                Назад
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onClear}
              disabled={!history.length || isClearingHistory}
            >
              <Trash2Icon data-icon="inline-start" />
              {isClearingHistory ? "Очищаю" : "Очистить"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoryList({
  history,
  onSelect,
}: {
  history: CoverLetterHistoryItem[];
  onSelect: HistoryItemAction;
}) {
  if (!history.length) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl bg-input/10 p-6 text-center text-sm text-muted-foreground">
        <HistoryIcon className="size-5" />
        История появится после первой успешной генерации.
      </div>
    );
  }

  return (
    <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
      {history.map((item) => (
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="flex w-full flex-col gap-2 rounded-xl bg-input/20 p-3 text-left transition-colors hover:bg-input/40 focus-visible:bg-input/40 focus-visible:outline-none"
          key={item.id}
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
      ))}
    </div>
  );
}

function HistoryItemDetails({ item }: { item: CoverLetterHistoryItem }) {
  return (
    <div className="grid max-h-[60dvh] gap-4 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="history-language">Язык</FieldLabel>
          <Input
            id="history-language"
            value={getLanguageLabel(item.language)}
            readOnly
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="history-format">Формат</FieldLabel>
          <Input
            id="history-format"
            value={getMessageFormatLabel(item.messageFormat)}
            readOnly
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="history-model">Модель</FieldLabel>
          <Input id="history-model" value={getModelLabel(item.model)} readOnly />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="history-cover-letter">Письмо</FieldLabel>
        <Textarea
          id="history-cover-letter"
          value={item.coverLetter}
          readOnly
          className="max-h-[min(42dvh,24rem)]"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="history-vacancy">Текст вакансии</FieldLabel>
        <Textarea
          id="history-vacancy"
          value={item.vacancyText}
          readOnly
          className="max-h-[min(36dvh,18rem)]"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="history-additional-wishes">
          Дополнительные пожелания
        </FieldLabel>
        <Textarea
          id="history-additional-wishes"
          value={item.additionalWishes}
          readOnly
          placeholder="Нет"
          className="max-h-[min(30dvh,14rem)]"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="history-rules">Правила письма</FieldLabel>
        <Textarea
          id="history-rules"
          value={item.coverLetterRules.join("\n")}
          readOnly
          className="max-h-[min(36dvh,18rem)]"
        />
      </Field>
    </div>
  );
}
