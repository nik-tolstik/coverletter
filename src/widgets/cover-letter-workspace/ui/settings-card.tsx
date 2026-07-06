import { Card, CardContent } from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { LanguageSelect } from "@/shared/ui/language-select";

import { ModelSelect } from "./model-select";

export function SettingsCard({
  model,
  language,
  onModelChange,
  onLanguageChange,
}: {
  model: string;
  language: string;
  onModelChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
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
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
