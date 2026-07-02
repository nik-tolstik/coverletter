"use client";

import Image from "next/image";
import {
  ChevronDownIcon,
  ClipboardPasteIcon,
  CopyIcon,
  HistoryIcon,
  RotateCcwIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  MAX_COVER_LETTER_HISTORY_ITEMS,
  type CoverLetterHistoryItem,
} from "@/entities/cover-letter-history";
import {
  DEFAULT_COVER_LETTER_LANGUAGE,
  DEFAULT_COVER_LETTER_RULES,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_USE_EMAIL_FORMAT,
  OPENROUTER_MODEL_OPTIONS,
  type CoverLetterSettingsForm,
} from "@/entities/cover-letter-settings";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

const LANGUAGES = [
  { value: "Russian", label: "Русский" },
  { value: "English", label: "Английский" },
];

const MESSAGE_FORMATS = [
  { value: "email", label: "Email" },
  { value: "telegram", label: "Telegram" },
];

const OPENROUTER_MODEL_GROUPS = [
  { tier: "pro", label: "Pro" },
  { tier: "balanced", label: "Balanced" },
  { tier: "free", label: "Free" },
] as const;

type SavedLetterSettings = Pick<
  CoverLetterSettingsForm,
  "model" | "language" | "useEmailFormat" | "coverLetterRules"
>;

export function CoverLetterWorkspace({
  initialHistory = [],
  initialSettings,
}: {
  initialHistory?: CoverLetterHistoryItem[];
  initialSettings: CoverLetterSettingsForm;
}) {
  const [savedSettings, setSavedSettings] = useState(() =>
    getSavedLetterSettings(initialSettings),
  );
  const [history, setHistory] = useState(initialHistory);
  const [vacancyText, setVacancyText] = useState("");
  const [model, setModel] = useState(
    initialSettings.model || DEFAULT_OPENROUTER_MODEL,
  );
  const [language, setLanguage] = useState(
    initialSettings.language || DEFAULT_COVER_LETTER_LANGUAGE,
  );
  const [additionalWishes, setAdditionalWishes] = useState("");
  const [useEmailFormat, setUseEmailFormat] = useState(
    initialSettings.useEmailFormat ?? DEFAULT_USE_EMAIL_FORMAT,
  );
  const [coverLetterRules, setCoverLetterRules] = useState(
    initialSettings.coverLetterRules.join("\n") ||
      DEFAULT_COVER_LETTER_RULES.join("\n"),
  );
  const [isRulesOpen, setIsRulesOpen] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isClearingHistory, startClearingHistory] = useTransition();
  const hasLetterContent = isGenerating || Boolean(coverLetter);
  const canGenerateLetter = vacancyText.trim().length > 0;
  const currentSettings = useMemo(
    () => ({
      model,
      language,
      vacancyText,
      additionalWishes,
      useEmailFormat,
      coverLetterRules: splitLines(coverLetterRules),
    }),
    [
      additionalWishes,
      coverLetterRules,
      language,
      model,
      useEmailFormat,
      vacancyText,
    ],
  );
  const currentSavedSettings = useMemo(
    () => ({
      model,
      language,
      useEmailFormat,
      coverLetterRules: splitLines(coverLetterRules),
    }),
    [coverLetterRules, language, model, useEmailFormat],
  );
  const isSettingsDirty =
    serializeSettings(currentSavedSettings) !==
    serializeSettings(savedSettings);

  function saveSettings() {
    startSaving(async () => {
      try {
        const response = await fetch("/api/cover-letter-settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: createSettingsPayload(currentSavedSettings),
          }),
        });
        const data = (await response.json()) as {
          settings?: CoverLetterSettingsForm;
          error?: string;
        };

        if (!response.ok || !data.settings) {
          toast.error(data.error ?? "Настройки письма не сохранены.");
          return;
        }

        const nextSavedSettings = getSavedLetterSettings(data.settings);

        setSavedSettings(nextSavedSettings);
        setModel(data.settings.model);
        setLanguage(data.settings.language);
        setUseEmailFormat(data.settings.useEmailFormat);
        setCoverLetterRules(data.settings.coverLetterRules.join("\n"));
        toast.success("Настройки письма сохранены.");
      } catch {
        toast.error("Настройки письма не сохранены.");
      }
    });
  }

  function generateLetter() {
    startGenerating(async () => {
      try {
        const response = await fetch("/api/cover-letter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...currentSettings,
          }),
        });
        const data = (await response.json()) as {
          coverLetter?: string;
          historyItem?: CoverLetterHistoryItem | null;
          historySaved?: boolean;
          error?: string;
        };

        if (!response.ok || !data.coverLetter) {
          toast.error(data.error ?? "Не удалось создать письмо.");
          return;
        }

        setCoverLetter(data.coverLetter);

        if (data.historyItem) {
          const historyItem = data.historyItem;

          setHistory((currentHistory) =>
            [
              historyItem,
              ...currentHistory.filter((item) => item.id !== historyItem.id),
            ].slice(0, MAX_COVER_LETTER_HISTORY_ITEMS),
          );
        }

        if (data.historySaved === false) {
          toast.warning("Письмо создано, но история не сохранена.");
          return;
        }

        toast.success("Письмо создано.");
      } catch {
        toast.error("Не удалось создать письмо.");
      }
    });
  }

  async function copyLetter() {
    if (!coverLetter) {
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success("Письмо скопировано.");
    } catch {
      toast.error("Не удалось скопировать письмо.");
    }
  }

  async function pasteVacancyText() {
    if (!navigator.clipboard?.readText) {
      toast.error("Буфер обмена недоступен.");
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText.trim()) {
        toast.warning("Буфер обмена пуст.");
        return;
      }

      setVacancyText(clipboardText);
      toast.success("Текст вакансии вставлен.");
    } catch {
      toast.error("Не удалось прочитать буфер обмена.");
    }
  }

  function openHistoryItem(item: CoverLetterHistoryItem) {
    setCoverLetter(item.coverLetter);
    setModel(item.model);
    setVacancyText(item.vacancyText);
    setLanguage(item.language);
    setAdditionalWishes(item.additionalWishes);
    setUseEmailFormat(item.useEmailFormat);
    setCoverLetterRules(item.coverLetterRules.join("\n"));
    toast.success("Письмо открыто из истории.");
  }

  function clearHistory() {
    startClearingHistory(async () => {
      try {
        const response = await fetch("/api/cover-letter-history", {
          method: "DELETE",
        });
        const data = (await response.json()) as {
          history?: CoverLetterHistoryItem[];
          error?: string;
        };

        if (!response.ok || !data.history) {
          toast.error(data.error ?? "История писем не очищена.");
          return;
        }

        setHistory(data.history);
        toast.success("История писем очищена.");
      } catch {
        toast.error("История писем не очищена.");
      }
    });
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 px-4 pt-5 pb-28">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/icon.svg"
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-xl"
              priority
            />
            <h1 className="min-w-0 font-heading text-2xl font-bold">
              Coverletter
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <HistoryIcon data-icon="inline-start" />
                  История
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[760px]">
                <DialogHeader>
                  <DialogTitle>История</DialogTitle>
                  <DialogDescription>
                    Последние сгенерированные письма с параметрами генерации.
                  </DialogDescription>
                </DialogHeader>
                <HistoryList history={history} onSelect={openHistoryItem} />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={clearHistory}
                    disabled={!history.length || isClearingHistory}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    {isClearingHistory ? "Очищаю" : "Очистить"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <section className="grid min-h-[calc(100dvh-9rem)] grid-cols-1 gap-5">
          <div className="flex min-h-0 flex-col gap-5">
            <CollapsibleCard
              title="Настройки письма"
              contentId="letter-settings-content"
            >
              <FieldGroup>
                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="openrouter-model">Модель</FieldLabel>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger id="openrouter-model" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-[calc(100vw-2rem)] max-w-[728px]">
                        {OPENROUTER_MODEL_GROUPS.map((group, groupIndex) => (
                          <SelectGroup key={group.tier}>
                            <SelectLabel>{group.label}</SelectLabel>
                            {OPENROUTER_MODEL_OPTIONS.filter(
                              (item) => item.tier === group.tier,
                            ).map((item) => (
                              <SelectItem value={item.value} key={item.value}>
                                {item.label} · {item.priceLabel}
                              </SelectItem>
                            ))}
                            {groupIndex <
                              OPENROUTER_MODEL_GROUPS.length - 1 && (
                              <SelectSeparator />
                            )}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="language">Язык</FieldLabel>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {LANGUAGES.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="message-format">Формат</FieldLabel>
                    <Select
                      value={useEmailFormat ? "email" : "telegram"}
                      onValueChange={(value) =>
                        setUseEmailFormat(value === "email")
                      }
                    >
                      <SelectTrigger id="message-format" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {MESSAGE_FORMATS.map((item) => (
                            <SelectItem value={item.value} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <CollapsibleField
                    title="Правила письма"
                    id="cover-letter-rules-panel"
                    isOpen={isRulesOpen}
                    onToggle={() => setIsRulesOpen((current) => !current)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCoverLetterRules(
                              DEFAULT_COVER_LETTER_RULES.join("\n"),
                            )
                          }
                        >
                          <RotateCcwIcon data-icon="inline-start" />
                          По умолчанию
                        </Button>
                      </div>
                      <Textarea
                        id="cover-letter-rules"
                        aria-label="Правила письма"
                        placeholder="Одно правило на строку."
                        value={coverLetterRules}
                        onChange={(event) =>
                          setCoverLetterRules(event.target.value)
                        }
                      />
                    </div>
                  </CollapsibleField>
                </Field>
              </FieldGroup>
              {isSettingsDirty && (
                <div className="mt-5 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={saveSettings}
                    disabled={isSaving}
                  >
                    <SaveIcon data-icon="inline-start" />
                    {isSaving ? "Сохраняю" : "Сохранить"}
                  </Button>
                </div>
              )}
            </CollapsibleCard>

            <Card>
              <CardHeader>
                <CardTitle>Дополнительные пожелания</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="additional-wishes"
                  aria-label="Дополнительные пожелания"
                  placeholder="Сделать акцент на React, продуктовой разработке и опыте с AI-инструментами."
                  value={additionalWishes}
                  onChange={(event) => setAdditionalWishes(event.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex min-h-0 flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Текст вакансии</CardTitle>
                <CardAction>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={pasteVacancyText}
                  >
                    <ClipboardPasteIcon data-icon="inline-start" />
                    Вставить
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <Textarea
                      id="vacancy-text"
                      aria-label="Текст вакансии"
                      className="max-h-[min(30dvh,16rem)]"
                      placeholder="Вставьте сюда описание вакансии, сообщение рекрутера или требования к роли."
                      value={vacancyText}
                      onChange={(event) => setVacancyText(event.target.value)}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            {hasLetterContent && (
              <Card className="min-h-0">
                <CardHeader>
                  <CardTitle>Письмо</CardTitle>
                </CardHeader>
                <CardContent className="min-h-0">
                  <div
                    className={cn(
                      "relative rounded-xl bg-input/20 p-4 text-sm leading-7 whitespace-pre-wrap",
                      isGenerating ? "min-h-[26dvh]" : "min-h-[40dvh]",
                      coverLetter && !isGenerating && "pr-14",
                    )}
                  >
                    {coverLetter && !isGenerating && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="absolute top-3 right-3"
                            aria-label="Копировать письмо"
                            onClick={copyLetter}
                          >
                            <CopyIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Копировать</TooltipContent>
                      </Tooltip>
                    )}
                    {isGenerating ? <GeneratingLetterState /> : coverLetter}
                  </div>
                </CardContent>
              </Card>
            )}
            <Button
              size="lg"
              className="w-full"
              onClick={generateLetter}
              disabled={isGenerating || !canGenerateLetter}
            >
              <SparklesIcon data-icon="inline-start" />
              {isGenerating ? "Генерирую" : "Сгенерировать"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function CollapsibleCard({
  title,
  contentId,
  action,
  defaultOpen = true,
  children,
}: {
  title: string;
  contentId: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="gap-0">
      <CardHeader>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="group flex min-w-0 items-center gap-2 rounded-lg text-left outline-none transition-colors hover:text-foreground focus-visible:opacity-90"
          onClick={() => setIsOpen((current) => !current)}
        >
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="flex min-w-0 flex-col gap-1">
            <CardTitle>{title}</CardTitle>
          </span>
        </button>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CollapsibleContent
        id={contentId}
        isOpen={isOpen}
        contentClassName="pt-(--card-spacing)"
      >
        <CardContent>{children}</CardContent>
      </CollapsibleContent>
    </Card>
  );
}

function CollapsibleField({
  title,
  id,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg text-left outline-none transition-colors focus-visible:bg-input/30"
        onClick={onToggle}
      >
        <span className="text-sm leading-snug font-medium">{title}</span>
        <ChevronDownIcon
          className={cn(
            "mr-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
            !isOpen && "-rotate-90",
          )}
        />
      </button>
      <CollapsibleContent id={id} isOpen={isOpen} contentClassName="pt-3">
        {children}
      </CollapsibleContent>
    </div>
  );
}

function CollapsibleContent({
  id,
  isOpen,
  contentClassName,
  children,
}: {
  id: string;
  isOpen: boolean;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      aria-hidden={!isOpen}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden" inert={!isOpen}>
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}

function HistoryList({
  history,
  onSelect,
}: {
  history: CoverLetterHistoryItem[];
  onSelect: (item: CoverLetterHistoryItem) => void;
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
        <DialogClose asChild key={item.id}>
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
                {item.useEmailFormat ? "Email" : "Telegram"}
              </Badge>
              <Badge variant="outline">{getModelLabel(item.model)}</Badge>
            </span>
            <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              {item.coverLetter}
            </span>
          </button>
        </DialogClose>
      ))}
    </div>
  );
}

function GeneratingLetterState() {
  return (
    <div className="flex min-h-[inherit] flex-col justify-between gap-6 overflow-hidden">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SparklesIcon className="size-5 animate-pulse" />
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-medium">Генерирую письмо</span>
          <span className="text-xs text-muted-foreground">
            Подбираю факты из профиля под вакансию.
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="h-4 w-11/12 animate-pulse rounded-full bg-foreground/10" />
        <span className="h-4 w-10/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:120ms]" />
        <span className="h-4 w-8/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:240ms]" />
        <span className="mt-3 h-4 w-full animate-pulse rounded-full bg-foreground/10 [animation-delay:360ms]" />
        <span className="h-4 w-9/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:480ms]" />
        <span className="h-4 w-7/12 animate-pulse rounded-full bg-foreground/10 [animation-delay:600ms]" />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full w-1/3 animate-[generation-progress_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
    </div>
  );
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function serializeSettings(
  settings: CoverLetterSettingsForm | SavedLetterSettings,
) {
  return JSON.stringify(settings);
}

function getSavedLetterSettings(
  settings: CoverLetterSettingsForm,
): SavedLetterSettings {
  return {
    model: settings.model || DEFAULT_OPENROUTER_MODEL,
    language: settings.language || DEFAULT_COVER_LETTER_LANGUAGE,
    useEmailFormat: settings.useEmailFormat ?? DEFAULT_USE_EMAIL_FORMAT,
    coverLetterRules: settings.coverLetterRules.length
      ? settings.coverLetterRules
      : DEFAULT_COVER_LETTER_RULES,
  };
}

function createSettingsPayload(
  settings: SavedLetterSettings,
): CoverLetterSettingsForm {
  return {
    ...settings,
    vacancyText: "",
    additionalWishes: "",
  };
}

function getLanguageLabel(language: string) {
  return LANGUAGES.find((item) => item.value === language)?.label ?? language;
}

function getModelLabel(model: string) {
  return (
    OPENROUTER_MODEL_OPTIONS.find((item) => item.value === model)?.label ??
    model
  );
}

function formatHistoryDate(value: string) {
  const [date, time] = value.split("T");

  if (!date || !time) {
    return value;
  }

  return `${date} ${time.slice(0, 5)} UTC`;
}
