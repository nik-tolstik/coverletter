"use client";

import Image from "next/image";
import { SparklesIcon } from "lucide-react";

import type { CoverLetterHistoryItem } from "@/entities/cover-letter-history";
import type { CoverLetterSettingsForm } from "@/entities/cover-letter-settings";
import { Button } from "@/shared/ui/button";
import { UserMenu } from "@/widgets/app-navigation";

import { useCoverLetterWorkspace } from "../model/use-cover-letter-workspace";
import { AdditionalWishesCard } from "./additional-wishes-card";
import { CoverLetterRulesCard } from "./cover-letter-rules-card";
import { GeneratedLetterCard } from "./generated-letter-card";
import { HistoryDialog } from "./history-dialog";
import { SettingsCard } from "./settings-card";
import { VacancyCard } from "./vacancy-card";

export function CoverLetterWorkspace({
  initialHistory = [],
  initialSettings,
  userEmail,
}: {
  initialHistory?: CoverLetterHistoryItem[];
  initialSettings: CoverLetterSettingsForm;
  userEmail: string;
}) {
  const workspace = useCoverLetterWorkspace({
    initialHistory,
    initialSettings,
  });

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-190 flex-col gap-5 px-4 pt-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <div className="flex min-w-0 items-center justify-center gap-3 px-1">
          <Image
            src="/icon.svg"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-xl"
            priority
          />
          <span className="min-w-0 font-heading text-xl font-bold">
            Coverletter
          </span>
        </div>

        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4">
          <h1 className="min-w-0 font-heading text-xl font-semibold">
            Генератор
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <HistoryDialog
              history={workspace.history}
              isClearingHistory={workspace.isClearingHistory}
              isGenerating={workspace.isGenerating}
              onClear={workspace.clearHistory}
              onRepeat={workspace.repeatHistoryItem}
            />
            <UserMenu email={userEmail} />
          </div>
        </header>

        <section className="grid grid-cols-1 content-start gap-5">
          <div className="flex min-h-0 flex-col gap-5">
            <SettingsCard
              model={workspace.model}
              language={workspace.language}
              messageFormat={workspace.messageFormat}
              onModelChange={workspace.setModel}
              onLanguageChange={workspace.setLanguage}
              onMessageFormatChange={workspace.setMessageFormat}
            />

            <CoverLetterRulesCard
              value={workspace.coverLetterRules}
              onValueChange={workspace.setCoverLetterRules}
            />

            <AdditionalWishesCard
              value={workspace.additionalWishes}
              onValueChange={workspace.setAdditionalWishes}
            />
          </div>

          <div className="flex min-h-0 flex-col gap-5">
            <VacancyCard
              value={workspace.vacancyText}
              onValueChange={workspace.setVacancyText}
              onPaste={workspace.pasteVacancyText}
            />

            {workspace.hasLetterContent ? (
              <GeneratedLetterCard
                key={workspace.isGenerating ? "generating" : "ready"}
                coverLetter={workspace.coverLetter}
                loading={workspace.isGenerating}
                onCopy={workspace.copyLetter}
              />
            ) : null}

            <Button
              size="lg"
              className="w-full"
              onClick={() => workspace.generateLetter()}
              disabled={workspace.isGenerating || !workspace.canGenerateLetter}
            >
              <SparklesIcon data-icon="inline-start" />
              {workspace.isGenerating ? "Генерирую" : "Сгенерировать"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
