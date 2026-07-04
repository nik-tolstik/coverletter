"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  useClearCoverLetterHistoryMutation,
  useCoverLetterHistoryQuery,
  type CoverLetterHistoryItem,
  type CoverLetterHistoryState,
} from "@/entities/cover-letter-history";
import {
  DEFAULT_COVER_LETTER_LANGUAGE,
  DEFAULT_COVER_LETTER_RULES,
  DEFAULT_MESSAGE_FORMAT,
  DEFAULT_OPENROUTER_MODEL,
  type CoverLetterSettingsForm,
  type CoverLetterSettingsState,
  useCoverLetterSettingsQuery,
  useSaveCoverLetterSettingsMutation,
} from "@/entities/cover-letter-settings";
import { useGenerateCoverLetterMutation } from "@/features/generate-cover-letter";
import { ApiError } from "@/shared/api/http-client";

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
  userEmail,
  initialHistory,
  initialSettings,
}: {
  userEmail: string;
  initialHistory: CoverLetterHistoryState;
  initialSettings: CoverLetterSettingsState;
}) {
  const initialSettingsForm = initialSettings.settings;

  const settingsQuery = useCoverLetterSettingsQuery({
    initialSettings,
    userEmail,
  });
  const historyQuery = useCoverLetterHistoryQuery({
    initialHistory,
    userEmail,
  });
  const { mutateAsync: saveSettingsMutateAsync } =
    useSaveCoverLetterSettingsMutation(userEmail);
  const {
    mutateAsync: generateLetterMutateAsync,
    isPending: isGenerating,
  } = useGenerateCoverLetterMutation(userEmail);
  const {
    mutateAsync: clearHistoryMutateAsync,
    isPending: isClearingHistory,
  } = useClearCoverLetterHistoryMutation(userEmail);

  const [vacancyText, setVacancyText] = useState("");
  const [model, setModel] = useState(
    initialSettingsForm.model || DEFAULT_OPENROUTER_MODEL,
  );
  const [language, setLanguage] = useState(
    initialSettingsForm.language || DEFAULT_COVER_LETTER_LANGUAGE,
  );
  const [additionalWishes, setAdditionalWishes] = useState("");
  const [messageFormat, setMessageFormat] = useState(
    initialSettingsForm.messageFormat ?? DEFAULT_MESSAGE_FORMAT,
  );
  const [coverLetterRules, setCoverLetterRules] = useState(
    initialSettingsForm.coverLetterRules.join("\n") ||
      DEFAULT_COVER_LETTER_RULES.join("\n"),
  );
  const [coverLetter, setCoverLetter] = useState("");
  const saveQueueRef = useRef<SaveQueueState>({
    isRunning: false,
    pendingSettings: null,
  });
  const generationReadySoundRef = useRef<GenerationReadySound | null>(null);

  const history = historyQuery.data.history;
  const savedSettings = useMemo(
    () => getSavedLetterSettings(settingsQuery.data.settings),
    [settingsQuery.data.settings],
  );
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
    serializeSettings(currentSavedSettings) !== serializeSettings(savedSettings);

  const flushSettingsSaveQueue = useCallback(async () => {
    if (saveQueueRef.current.isRunning) {
      return;
    }

    saveQueueRef.current.isRunning = true;

    try {
      while (saveQueueRef.current.pendingSettings) {
        const nextSettings = saveQueueRef.current.pendingSettings;
        saveQueueRef.current.pendingSettings = null;

        try {
          await saveSettingsMutateAsync(nextSettings);
        } catch (error) {
          toast.error(
            readApiErrorMessage(error, "Настройки письма не сохранены."),
          );
        }
      }
    } finally {
      saveQueueRef.current.isRunning = false;
    }
  }, [saveSettingsMutateAsync]);

  const saveSettings = useCallback(
    (settingsToSave: SavedLetterSettings) => {
      saveQueueRef.current.pendingSettings = settingsToSave;
      void flushSettingsSaveQueue();
    },
    [flushSettingsSaveQueue],
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
    async (settings: LetterGenerationSettings = currentSettings) => {
      const generationReadySound =
        generationReadySoundRef.current ?? createGenerationReadySound();
      generationReadySoundRef.current = generationReadySound;
      generationReadySound.unlock();

      try {
        const data = await generateLetterMutateAsync(settings);

        setCoverLetter(data.coverLetter);
        generationReadySound.play();

        if (data.historySaved === false) {
          toast.warning("Письмо создано, но история не сохранена.");
          return;
        }

        toast.success("Письмо создано.");
      } catch (error) {
        toast.error(readApiErrorMessage(error, "Не удалось создать письмо."));
      }
    },
    [currentSettings, generateLetterMutateAsync],
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
      void generateLetter(nextSettings);
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
    clearHistoryMutateAsync()
      .then(() => {
        toast.success("История писем очищена.");
      })
      .catch((error: unknown) => {
        toast.error(readApiErrorMessage(error, "История писем не очищена."));
      });
  }, [clearHistoryMutateAsync]);

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

function readApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
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
