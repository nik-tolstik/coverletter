"use client";

import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";

import {
  createDefaultYearMonth,
  formatCompanyMonthRange,
  formatCompanyMonthRangeForDisplay,
  parseCompanyMonthRange,
  type CompanyMonthRange,
  type YearMonth,
} from "@/features/edit-profile/model/company-date-range";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Separator } from "@/shared/ui/separator";

import { MonthYearSelectGroup } from "./month-year-select-group";

export type CompanyDatesFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function CompanyDatesField({
  id,
  label,
  value,
  onChange,
}: CompanyDatesFieldProps) {
  const [open, setOpen] = useState(false);
  const range = parseCompanyMonthRange(value);
  const buttonLabel = formatCompanyMonthRangeForDisplay(value, range);

  function updateRange(nextRange: CompanyMonthRange) {
    onChange(formatCompanyMonthRange(nextRange));
  }

  function updateMonthRangePoint(
    point: "from" | "to",
    key: keyof YearMonth,
    nextValue: string,
  ) {
    const currentPoint =
      range[point] ??
      (key === "year" ? { year: nextValue } : createDefaultYearMonth());

    updateRange({
      ...range,
      [point]: {
        ...currentPoint,
        [key]: nextValue,
      },
      isCurrent: point === "to" ? false : range.isCurrent,
    });
  }

  function markAsCurrent() {
    if (!range.from) {
      return;
    }

    updateRange({
      from: range.from,
      isCurrent: true,
    });
    setOpen(false);
  }

  function clearValue() {
    onChange("");
    setOpen(false);
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !buttonLabel && "text-muted-foreground",
            )}
          >
            <CalendarIcon data-icon="inline-start" />
            {buttonLabel || "Выберите период"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <FieldGroup className="grid gap-4 p-4">
            <MonthYearSelectGroup
              label="Начало"
              idPrefix={`${id}-from`}
              value={range.from}
              onMonthChange={(nextMonth) =>
                updateMonthRangePoint("from", "month", nextMonth)
              }
              onYearChange={(nextYear) =>
                updateMonthRangePoint("from", "year", nextYear)
              }
            />
            <MonthYearSelectGroup
              label="Конец"
              idPrefix={`${id}-to`}
              value={range.to}
              disabled={range.isCurrent || !range.from}
              onMonthChange={(nextMonth) =>
                updateMonthRangePoint("to", "month", nextMonth)
              }
              onYearChange={(nextYear) =>
                updateMonthRangePoint("to", "year", nextYear)
              }
            />
          </FieldGroup>
          <Separator />
          <div className="flex flex-wrap gap-2 p-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={markAsCurrent}
              disabled={!range.from}
            >
              По настоящее время
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearValue}
              disabled={!value}
            >
              <XIcon data-icon="inline-start" />
              Очистить
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
