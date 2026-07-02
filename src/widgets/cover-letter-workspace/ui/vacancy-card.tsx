import { ClipboardPasteIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Field, FieldGroup } from "@/shared/ui/field";
import { Textarea } from "@/shared/ui/textarea";

export function VacancyCard({
  value,
  onValueChange,
  onPaste,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onPaste: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Текст вакансии</CardTitle>
        <CardAction>
          <Button type="button" variant="outline" size="sm" onClick={onPaste}>
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
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
