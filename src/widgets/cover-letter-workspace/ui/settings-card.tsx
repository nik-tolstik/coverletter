import type { MessageFormat } from "@/entities/cover-letter-settings";
import { Card, CardContent } from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { LanguageSelect } from "@/shared/ui/language-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { MESSAGE_FORMAT_OPTIONS } from "../model/constants";
import { ModelSelect } from "./model-select";

export function SettingsCard({
  model,
  language,
  messageFormat,
  onModelChange,
  onLanguageChange,
  onMessageFormatChange,
}: {
  model: string;
  language: string;
  messageFormat: MessageFormat;
  onModelChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onMessageFormatChange: (value: MessageFormat) => void;
}) {
  return (
    <Card>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="openrouter-model">Модель</FieldLabel>
              <ModelSelect
                id="openrouter-model"
                value={model}
                onValueChange={onModelChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="language">Язык</FieldLabel>
              <LanguageSelect
                id="language"
                value={language}
                onValueChange={onLanguageChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="message-format">Формат</FieldLabel>
              <Select
                value={messageFormat}
                onValueChange={(value) =>
                  onMessageFormatChange(value as MessageFormat)
                }
              >
                <SelectTrigger id="message-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MESSAGE_FORMAT_OPTIONS.map((item) => (
                      <SelectItem value={item.value} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
