import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";

export function AdditionalWishesCard({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Дополнительные пожелания</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          id="additional-wishes"
          aria-label="Дополнительные пожелания"
          placeholder="Сделать акцент на React, продуктовой разработке и опыте с AI-инструментами."
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      </CardContent>
    </Card>
  );
}
