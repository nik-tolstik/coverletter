"use client";

import Link from "next/link";
import {
  CopyIcon,
  FileTextIcon,
  SaveIcon,
  SendIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  DEFAULT_COVER_LETTER_LANGUAGE,
  DEFAULT_COMMUNICATION_STYLE,
  DEFAULT_COVER_LETTER_RULES,
  type CoverLetterSettingsForm,
} from "@/entities/cover-letter-settings";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

const LANGUAGES = [
  { value: "Russian", label: "Русский" },
  { value: "English", label: "Английский" },
];

export function CoverLetterWorkspace({
  initialSettings,
}: {
  initialSettings: CoverLetterSettingsForm;
}) {
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [vacancyText, setVacancyText] = useState(initialSettings.vacancyText);
  const [language, setLanguage] = useState(
    initialSettings.language || DEFAULT_COVER_LETTER_LANGUAGE,
  );
  const [additionalWishes, setAdditionalWishes] = useState(
    initialSettings.additionalWishes,
  );
  const [communicationStyle, setCommunicationStyle] = useState(
    initialSettings.communicationStyle.join("\n") ||
      DEFAULT_COMMUNICATION_STYLE.join("\n"),
  );
  const [coverLetterRules, setCoverLetterRules] = useState(
    initialSettings.coverLetterRules.join("\n") ||
      DEFAULT_COVER_LETTER_RULES.join("\n"),
  );
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const currentSettings = useMemo(
    () => ({
      language,
      vacancyText,
      additionalWishes,
      communicationStyle: splitLines(communicationStyle),
      coverLetterRules: splitLines(coverLetterRules),
    }),
    [
      additionalWishes,
      communicationStyle,
      coverLetterRules,
      language,
      vacancyText,
    ],
  );
  const isSettingsDirty =
    serializeSettings(currentSettings) !== serializeSettings(savedSettings);

  function saveSettings() {
    startSaving(async () => {
      try {
        const response = await fetch("/api/cover-letter-settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            settings: currentSettings,
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

        setSavedSettings(data.settings);
        setVacancyText(data.settings.vacancyText);
        setLanguage(data.settings.language);
        setAdditionalWishes(data.settings.additionalWishes);
        setCommunicationStyle(data.settings.communicationStyle.join("\n"));
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
          error?: string;
        };

        if (!response.ok || !data.coverLetter) {
          toast.error(data.error ?? "Не удалось создать письмо.");
          return;
        }

        setCoverLetter(data.coverLetter);
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

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-normal md:text-3xl">
              Сопроводительное письмо
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Создайте письмо на основе сохранённого профиля и текста вакансии.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/profile">
                <FileTextIcon data-icon="inline-start" />
                Профиль
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid min-h-[calc(100dvh-9rem)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.8fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Настройки письма</CardTitle>
              <CardDescription>
                Язык, пожелания и контекст вакансии для этого письма.
              </CardDescription>
              <CardAction className="flex flex-wrap justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <SlidersHorizontalIcon data-icon="inline-start" />
                      Параметры текста
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Параметры текста</DialogTitle>
                      <DialogDescription>
                        Стиль и правила, которые применяются к текущему письму.
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="communication-style">
                          Стиль коммуникации
                        </FieldLabel>
                        <Textarea
                          id="communication-style"
                          placeholder="Одно пожелание по стилю на строку."
                          value={communicationStyle}
                          onChange={(event) =>
                            setCommunicationStyle(event.target.value)
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="cover-letter-rules">
                          Правила письма
                        </FieldLabel>
                        <Textarea
                          id="cover-letter-rules"
                          placeholder="Одно правило на строку."
                          value={coverLetterRules}
                          onChange={(event) =>
                            setCoverLetterRules(event.target.value)
                          }
                        />
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={saveSettings}
                        disabled={isSaving || !isSettingsDirty}
                      >
                        <SaveIcon data-icon="inline-start" />
                        {isSaving ? "Сохраняю" : "Сохранить"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={saveSettings}
                  disabled={isSaving || !isSettingsDirty}
                >
                  <SaveIcon data-icon="inline-start" />
                  {isSaving ? "Сохраняю" : "Сохранить"}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="language">Язык письма</FieldLabel>
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
                  <FieldLabel htmlFor="additional-wishes">
                    Дополнительные пожелания
                  </FieldLabel>
                  <Textarea
                    id="additional-wishes"
                    placeholder="Сделать акцент на React, продуктовой разработке и опыте с AI-инструментами."
                    value={additionalWishes}
                    onChange={(event) => setAdditionalWishes(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="vacancy-text">Текст вакансии</FieldLabel>
                  <Textarea
                    id="vacancy-text"
                    placeholder="Вставьте сюда описание вакансии, сообщение рекрутера или требования к роли."
                    value={vacancyText}
                    onChange={(event) => setVacancyText(event.target.value)}
                  />
                </Field>
                <Button onClick={generateLetter} disabled={isGenerating}>
                  <SparklesIcon data-icon="inline-start" />
                  {isGenerating ? "Создаю" : "Создать"}
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="min-h-0">
            <CardHeader>
              <CardTitle>Письмо</CardTitle>
              <CardDescription>Текстовый результат из OpenRouter.</CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  onClick={copyLetter}
                  disabled={!coverLetter}
                >
                  <CopyIcon data-icon="inline-start" />
                  Копировать
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="min-h-0">
              <Tabs defaultValue="preview" className="min-h-0">
                <TabsList>
                  <TabsTrigger value="preview">
                    <SendIcon data-icon="inline-start" />
                    Просмотр
                  </TabsTrigger>
                  <TabsTrigger value="raw">Текст</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="min-h-0">
                  <div className="min-h-[52dvh] rounded-xl border border-border bg-input/20 p-4 text-sm leading-7 whitespace-pre-wrap xl:min-h-[64dvh]">
                    {coverLetter ||
                      "Здесь появится сгенерированное сопроводительное письмо."}
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="min-h-0">
                  <Textarea
                    placeholder="Текст письма можно отредактировать после генерации."
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    className="font-mono text-sm leading-6"
                  />
                </TabsContent>
              </Tabs>
              <Separator className="mt-4" />
              <p className="mt-4 text-xs text-muted-foreground">
                Результат ограничен сохранённым профилем и контекстом вакансии.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function serializeSettings(settings: CoverLetterSettingsForm) {
  return JSON.stringify(settings);
}
