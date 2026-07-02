"use client";

import {
  companyDateYearOptions,
  getAvailableMonthOptions,
  type YearMonth,
} from "@/features/edit-profile/model/company-date-range";
import { Field, FieldLabel } from "@/shared/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export type MonthYearSelectGroupProps = {
  label: string;
  idPrefix: string;
  value?: YearMonth;
  disabled?: boolean;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
};

export function MonthYearSelectGroup({
  label,
  idPrefix,
  value,
  disabled,
  onMonthChange,
  onYearChange,
}: MonthYearSelectGroupProps) {
  const availableMonthOptions = getAvailableMonthOptions(value?.year);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-2">
        <Select
          value={value?.month}
          onValueChange={onMonthChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${idPrefix}-month`}
            className="w-full"
            aria-label={`${label}, месяц`}
          >
            <SelectValue placeholder="Месяц" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {availableMonthOptions.map((option) => (
                <SelectItem value={option.value} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={value?.year}
          onValueChange={onYearChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${idPrefix}-year`}
            className="w-full"
            aria-label={`${label}, год`}
          >
            <SelectValue placeholder="Год" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {companyDateYearOptions.map((year) => (
                <SelectItem value={year} key={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </Field>
  );
}
