export type YearMonth = {
  year: string;
  month?: string;
};

export type CompanyMonthRange = {
  from?: YearMonth;
  to?: YearMonth;
  isCurrent?: boolean;
};

export const monthOptions = [
  { value: "01", label: "Январь" },
  { value: "02", label: "Февраль" },
  { value: "03", label: "Март" },
  { value: "04", label: "Апрель" },
  { value: "05", label: "Май" },
  { value: "06", label: "Июнь" },
  { value: "07", label: "Июль" },
  { value: "08", label: "Август" },
  { value: "09", label: "Сентябрь" },
  { value: "10", label: "Октябрь" },
  { value: "11", label: "Ноябрь" },
  { value: "12", label: "Декабрь" },
] as const;

export const companyDateYearOptions = createYearOptions();

export function parseCompanyMonthRange(value: string): CompanyMonthRange {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return {};
  }

  const [fromValue, toValue] = splitCompanyMonthRange(normalizedValue);
  const isCurrent = toValue ? isCurrentCompanyDate(toValue) : false;

  return normalizeCompanyMonthRange({
    from: parseCompanyYearMonth(fromValue),
    to: toValue && !isCurrent ? parseCompanyYearMonth(toValue) : undefined,
    isCurrent,
  });
}

export function formatCompanyMonthRange(range: CompanyMonthRange): string {
  const normalizedRange = normalizeCompanyMonthRange(range);

  if (!normalizedRange.from) {
    return "";
  }

  if (normalizedRange.isCurrent) {
    return `${formatCompanyYearMonth(normalizedRange.from)} — Present`;
  }

  if (!normalizedRange.to) {
    return formatCompanyYearMonth(normalizedRange.from);
  }

  return `${formatCompanyYearMonth(
    normalizedRange.from,
  )} — ${formatCompanyYearMonth(normalizedRange.to)}`;
}

export function formatCompanyMonthRangeForDisplay(
  value: string,
  range: CompanyMonthRange,
): string {
  if (!value.trim()) {
    return "";
  }

  const normalizedRange = normalizeCompanyMonthRange(range);

  if (!normalizedRange.from) {
    return value;
  }

  const from = formatCompanyYearMonthForDisplay(normalizedRange.from);

  if (normalizedRange.isCurrent) {
    return `${from} — по настоящее время`;
  }

  if (normalizedRange.to) {
    return `${from} — ${formatCompanyYearMonthForDisplay(normalizedRange.to)}`;
  }

  return from;
}

export function createDefaultYearMonth(): YearMonth {
  return getCurrentYearMonth();
}

export function getAvailableMonthOptions(year?: string) {
  const currentMonth = getCurrentYearMonth();

  if (!year) {
    return monthOptions;
  }

  if (year === currentMonth.year) {
    return monthOptions.filter(
      (option) => Number(option.value) <= Number(currentMonth.month),
    );
  }

  return monthOptions;
}

function splitCompanyMonthRange(value: string): [string, string | undefined] {
  const dashRange = value.match(/^(.+?)\s*[—–]\s*(.+)$/);

  if (dashRange) {
    return [dashRange[1]?.trim() ?? "", dashRange[2]?.trim()];
  }

  const spacedHyphenRange = value.match(/^(.+?)\s+-\s+(.+)$/);

  if (spacedHyphenRange) {
    return [
      spacedHyphenRange[1]?.trim() ?? "",
      spacedHyphenRange[2]?.trim(),
    ];
  }

  const yearRange = value.match(/^(\d{4})-(\d{4})$/);

  if (yearRange) {
    return [yearRange[1] ?? "", yearRange[2]];
  }

  const currentRange = value.match(
    /^(\d{4})-(present|current|now|н\.?\s?в\.?|по настоящее время)$/i,
  );

  if (currentRange) {
    return [currentRange[1] ?? "", currentRange[2]];
  }

  return [value, undefined];
}

function parseCompanyYearMonth(value: string): YearMonth | undefined {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const isoMatch = normalizedValue.match(
    /^(\d{4})(?:-(0[1-9]|1[0-2])(?:-\d{2})?)?$/,
  );

  if (isoMatch) {
    return clampCompanyYearMonth({
      year: isoMatch[1],
      month: isoMatch[2],
    });
  }

  const ruDateMatch = normalizedValue.match(/^\d{2}\.(0[1-9]|1[0-2])\.(\d{4})$/);

  if (ruDateMatch) {
    return clampCompanyYearMonth({
      year: ruDateMatch[2],
      month: ruDateMatch[1],
    });
  }

  return undefined;
}

function formatCompanyYearMonth(value: YearMonth): string {
  return value.month ? `${value.year}-${value.month}` : value.year;
}

function formatCompanyYearMonthForDisplay(value: YearMonth): string {
  if (!value.month) {
    return value.year;
  }

  const month = monthOptions.find((option) => option.value === value.month);

  return `${month?.label ?? value.month} ${value.year}`;
}

function normalizeCompanyMonthRange(
  range: CompanyMonthRange,
): CompanyMonthRange {
  const from = range.from ? normalizeCompanyYearMonth(range.from) : undefined;
  const to = range.to ? normalizeCompanyYearMonth(range.to) : undefined;
  const normalizedTo = from && to && compareCompanyYearMonths(to, from) >= 0
    ? to
    : undefined;

  return {
    from,
    to: range.isCurrent ? undefined : normalizedTo,
    isCurrent: range.isCurrent,
  };
}

function normalizeCompanyYearMonth(value: YearMonth): YearMonth | undefined {
  const month = value.month
    ? monthOptions.find((option) => option.value === value.month)
    : undefined;

  if (!/^\d{4}$/.test(value.year) || (value.month && !month)) {
    return undefined;
  }

  return clampCompanyYearMonth({
    year: value.year,
    month: month?.value,
  });
}

function createYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let year = currentYear; year >= 1980; year -= 1) {
    years.push(String(year));
  }

  return years;
}

function clampCompanyYearMonth(value: YearMonth): YearMonth {
  const currentMonth = getCurrentYearMonth();

  if (compareCompanyYearMonths(value, currentMonth) > 0) {
    return currentMonth;
  }

  return value;
}

function compareCompanyYearMonths(left: YearMonth, right: YearMonth) {
  return (
    Number(left.year) - Number(right.year) ||
    Number(left.month ?? "00") - Number(right.month ?? "00")
  );
}

function getCurrentYearMonth(): YearMonth {
  const currentDate = new Date();

  return {
    year: String(currentDate.getFullYear()),
    month: String(currentDate.getMonth() + 1).padStart(2, "0"),
  };
}

function isCurrentCompanyDate(value: string) {
  return /^(present|current|now|н\.?\s?в\.?|по настоящее время)$/i.test(
    value.trim(),
  );
}
