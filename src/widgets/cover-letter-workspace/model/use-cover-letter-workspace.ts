"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  MAX_COVER_LETTER_HISTORY_ITEMS,
  type CoverLetterHistoryItem,
} from "@/entities/cover-letter-history";
import {
  DEFAULT_COVER_LETTER_LANGUAGE,
  DEFAULT_COVER_LETTER_RULES,
  DEFAULT_MESSAGE_FORMAT,
  DEFAULT_OPENROUTER_MODEL,
  type CoverLetterSettingsForm,
} from "@/entities/cover-letter-settings";

import {
  createGenerationReadySound,
  type GenerationReadySound,
} from "../lib/generation-ready-sound";
import { splitLines } from "../lib/rules";
import { SETTINGS_SAVE_DEBOUNCE_MS } from "./constants";
import type { LetterGenerationSettings, SavedLetterSettings } from "./types";

type SaveQueueState = {
  isRunning: boolean;
  pendingSettings: SavedLetterSettings | null;
};

export function useCoverLetterWorkspace({
  initialHistory,
  initialSettings,
}: {
  initialHistory: CoverLetterHistoryItem[];
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
  const [messageFormat, setMessageFormat] = useState(
    initialSettings.messageFormat ?? DEFAULT_MESSAGE_FORMAT,
  );
  const [coverLetterRules, setCoverLetterRules] = useState(
    initialSettings.coverLetterRules.join("\n") ||
      DEFAULT_COVER_LETTER_RULES.join("\n"),
  );
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, startGenerating] = useTransition();
  const [, startSaving] = useTransition();
  const [isClearingHistory, startClearingHistory] = useTransition();
  const saveQueueRef = useRef<SaveQueueState>({
    isRunning: false,
    pendingSettings: null,
  });
  const generationReadySoundRef = useRef<GenerationReadySound | null>(null);

  const hasLetterContent = isGenerating || Boolean(coverLetter);
  const canGenerateLetter = vacancyText.trim().length > 0;
  const currentSettings = useMemo<LetterGenerationSettings>(
    () => ({
      model,
      language,
      messageFormat,
      coverLetterRules: splitLines(coverLetterRules),
      vacancyText,
      additionalWishes,
    }),
    [
      additionalWishes,
      coverLetterRules,
      language,
      messageFormat,
      model,
      vacancyText,
    ],
  );
  const currentSavedSettings = useMemo<SavedLetterSettings>(
    () => ({
      model,
      language,
      messageFormat,
      coverLetterRules: splitLines(coverLetterRules),
    }),
    [coverLetterRules, language, messageFormat, model],
  );
  const isSettingsDirty =
    serializeSettings(currentSavedSettings) !==
    serializeSettings(savedSettings);

  const saveSettings = useCallback(
    (settingsToSave: SavedLetterSettings) => {
      saveQueueRef.current.pendingSettings = settingsToSave;

      if (saveQueueRef.current.isRunning) {
        return;
      }

      saveQueueRef.current.isRunning = true;

      startSaving(async () => {
        try {
          while (saveQueueRef.current.pendingSettings) {
            const nextSettings = saveQueueRef.current.pendingSettings;
            saveQueueRef.current.pendingSettings = null;

            try {
              const savedState = await saveLetterSettings(nextSettings);
              setSavedSettings(getSavedLetterSettings(savedState.settings));
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Настройки письма не сохранены.";
              toast.error(message);
            }
          }
        } finally {
          saveQueueRef.current.isRunning = false;
        }
      });
    },
    [startSaving],
  );

  useEffect(() => {
    if (!isSettingsDirty) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveSettings(currentSavedSettings);
    }, SETTINGS_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [currentSavedSettings, isSettingsDirty, saveSettings]);

  const generateLetter = useCallback(
    (settings: LetterGenerationSettings = currentSettings) => {
      const generationReadySound =
        generationReadySoundRef.current ?? createGenerationReadySound();
      generationReadySoundRef.current = generationReadySound;
      generationReadySound.unlock();

      startGenerating(async () => {
        try {
          const response = await fetch("/api/cover-letter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
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
          generationReadySound.play();

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
    },
    [currentSettings, startGenerating],
  );

  const repeatHistoryItem = useCallback(
    (item: CoverLetterHistoryItem) => {
      const nextRules = item.coverLetterRules.join("\n");
      const nextSettings: LetterGenerationSettings = {
        model: item.model,
        language: item.language,
        messageFormat: item.messageFormat,
        coverLetterRules: item.coverLetterRules,
        vacancyText: item.vacancyText,
        additionalWishes: item.additionalWishes,
      };

      setModel(item.model);
      setLanguage(item.language);
      setMessageFormat(item.messageFormat);
      setCoverLetterRules(nextRules);
      setVacancyText(item.vacancyText);
      setAdditionalWishes(item.additionalWishes);
      setCoverLetter(item.coverLetter);
      generateLetter(nextSettings);
    },
    [generateLetter],
  );

  const copyLetter = useCallback(async () => {
    if (!coverLetter) {
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success("Письмо скопировано.");
    } catch {
      toast.error("Не удалось скопировать письмо.");
    }
  }, [coverLetter]);

  const pasteVacancyText = useCallback(async () => {
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
  }, []);

  const clearHistory = useCallback(() => {
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
  }, [startClearingHistory]);

  return {
    history,
    vacancyText,
    setVacancyText,
    model,
    setModel,
    language,
    setLanguage,
    additionalWishes,
    setAdditionalWishes,
    messageFormat,
    setMessageFormat,
    coverLetterRules,
    setCoverLetterRules,
    coverLetter,
    isGenerating,
    isClearingHistory,
    hasLetterContent,
    canGenerateLetter,
    generateLetter,
    repeatHistoryItem,
    copyLetter,
    pasteVacancyText,
    clearHistory,
  };
}

async function saveLetterSettings(settings: SavedLetterSettings) {
  const response = await fetch("/api/cover-letter-settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ settings }),
  });
  const data = (await response.json()) as {
    settings?: CoverLetterSettingsForm;
    error?: string;
  };

  if (!response.ok || !data.settings) {
    throw new Error(data.error ?? "Настройки письма не сохранены.");
  }

  return { settings: data.settings };
}

function serializeSettings(settings: SavedLetterSettings) {
  return JSON.stringify(settings);
}

function getSavedLetterSettings(
  settings: CoverLetterSettingsForm,
): SavedLetterSettings {
  return {
    model: settings.model || DEFAULT_OPENROUTER_MODEL,
    language: settings.language || DEFAULT_COVER_LETTER_LANGUAGE,
    messageFormat: settings.messageFormat ?? DEFAULT_MESSAGE_FORMAT,
    coverLetterRules: settings.coverLetterRules.length
      ? settings.coverLetterRules
      : DEFAULT_COVER_LETTER_RULES,
  };
}
