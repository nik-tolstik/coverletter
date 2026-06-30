"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import {
  type KeyboardEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  createEmptyCompany,
  createEmptyExperienceProject,
  createEmptySkillCategory,
  createEmptyStandaloneProject,
  type ExperienceCompanyForm,
  type ExperienceProjectForm,
  type ProfileFormState,
  type ProfileState,
  type SkillCategoryForm,
  type StandaloneProjectForm,
} from "@/entities/profile";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Textarea } from "@/shared/ui/textarea";

type IdentityKey = keyof ProfileFormState["identity"];
type LinkKey = keyof ProfileFormState["links"];
type LanguageEntry = {
  language: string;
  level: string;
};
type YearMonth = {
  year: string;
  month: string;
};
type CompanyMonthRange = {
  from?: YearMonth;
  to?: YearMonth;
  isCurrent?: boolean;
};
type FieldCopy = {
  placeholder: string;
};

const identityFields: Array<{ key: IdentityKey; label: string } & FieldCopy> = [
  {
    key: "name",
    label: "Имя",
    placeholder: "Иван Иванов",
  },
  {
    key: "currentPosition",
    label: "Текущая позиция",
    placeholder: "Frontend Engineer",
  },
  {
    key: "experience",
    label: "Опыт",
    placeholder: "5 лет коммерческой разработки",
  },
  {
    key: "location",
    label: "Локация",
    placeholder: "Минск, Беларусь",
  },
];

const linkFields: Array<{ key: LinkKey; label: string } & FieldCopy> = [
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "portfolio",
    label: "Портфолио",
    placeholder: "https://username.dev",
  },
  {
    key: "telegram",
    label: "Telegram",
    placeholder: "@username",
  },
];

const workFormatOptions = [
  { value: "Remote", label: "Удалённо" },
  { value: "Hybrid", label: "Гибрид" },
  { value: "Office", label: "Офис" },
];

const languageOptions = [
  { value: "Russian", label: "Русский" },
  { value: "English", label: "Английский" },
];

const languageLevelOptions = [
  { value: "Native", label: "Родной" },
  { value: "C2", label: "C2" },
  { value: "C1", label: "C1" },
  { value: "B2", label: "B2" },
  { value: "B1", label: "B1" },
  { value: "A2", label: "A2" },
  { value: "A1", label: "A1" },
];

const monthOptions = [
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
];

const companyDateYearOptions = createYearOptions();

export function ProfileEditorPage({
  initialProfile,
}: {
  initialProfile: ProfileState;
}) {
  const [profile, setProfile] = useState(() => initialProfile.profile);
  const [savedProfile, setSavedProfile] = useState(() => initialProfile.profile);
  const [isPending, startTransition] = useTransition();
  const profileSnapshot = useMemo(() => serializeProfile(profile), [profile]);
  const savedProfileSnapshot = useMemo(
    () => serializeProfile(savedProfile),
    [savedProfile],
  );
  const isDirty = profileSnapshot !== savedProfileSnapshot;

  function saveProfile() {
    if (!isDirty || isPending) {
      return;
    }

    const profileToSave = profile;

    startTransition(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile: profileToSave,
          }),
        });
        const data = (await response.json()) as {
          error?: string;
          profile?: ProfileFormState;
        };

        if (!response.ok) {
          toast.error(data.error ?? "Профиль не сохранён.");
          return;
        }

        const nextSavedProfile = data.profile ?? profileToSave;

        setSavedProfile(nextSavedProfile);
        setProfile((currentProfile) =>
          serializeProfile(currentProfile) === serializeProfile(profileToSave)
            ? nextSavedProfile
            : currentProfile,
        );
        toast.success("Профиль сохранён.");
      } catch {
        toast.error("Профиль не сохранён. Проверьте подключение к хранилищу.");
      }
    });
  }

  function cancelChanges() {
    setProfile(savedProfile);
  }

  function updateIdentity(key: IdentityKey, value: string) {
    setProfile((current) => ({
      ...current,
      identity: {
        ...current.identity,
        [key]: value,
      },
    }));
  }

  function updateLink(key: LinkKey, value: string) {
    setProfile((current) => ({
      ...current,
      links: {
        ...current.links,
        [key]: value,
      },
    }));
  }

  function updateSkillCategory(
    index: number,
    nextCategory: SkillCategoryForm,
  ) {
    setProfile((current) => ({
      ...current,
      skills: current.skills.map((category, categoryIndex) =>
        categoryIndex === index ? nextCategory : category,
      ),
    }));
  }

  function addSkillCategory() {
    setProfile((current) => ({
      ...current,
      skills: [...current.skills, createEmptySkillCategory()],
    }));
  }

  function removeSkillCategory(index: number) {
    setProfile((current) => ({
      ...current,
      skills: removeAt(
        current.skills,
        index,
        createEmptySkillCategory(),
      ),
    }));
  }

  function updateCompany(index: number, nextCompany: ExperienceCompanyForm) {
    setProfile((current) => ({
      ...current,
      experience: current.experience.map((company, companyIndex) =>
        companyIndex === index ? nextCompany : company,
      ),
    }));
  }

  function addCompany() {
    setProfile((current) => ({
      ...current,
      experience: [...current.experience, createEmptyCompany()],
    }));
  }

  function removeCompany(index: number) {
    setProfile((current) => ({
      ...current,
      experience: removeAt(current.experience, index, createEmptyCompany()),
    }));
  }

  function updateStandaloneProject(
    index: number,
    nextProject: StandaloneProjectForm,
  ) {
    setProfile((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) =>
        projectIndex === index ? nextProject : project,
      ),
    }));
  }

  function addStandaloneProject() {
    setProfile((current) => ({
      ...current,
      projects: [...current.projects, createEmptyStandaloneProject()],
    }));
  }

  function removeStandaloneProject(index: number) {
    setProfile((current) => ({
      ...current,
      projects: removeAt(
        current.projects,
        index,
        createEmptyStandaloneProject(),
      ),
    }));
  }

  return (
    <main className="min-h-dvh bg-background">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8",
          isDirty && "pb-36 md:pb-32",
        )}
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Button asChild variant="ghost" size="sm" className="w-fit">
              <Link href="/">
                <ArrowLeftIcon data-icon="inline-start" />
                Генератор
              </Link>
            </Button>
            <h1 className="font-heading text-2xl font-semibold tracking-normal md:text-3xl">
              Профиль
            </h1>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Личные данные</CardTitle>
            <CardDescription>Основные факты о кандидате.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              {identityFields.map((field) => (
                <TextInputField
                  key={field.key}
                  id={`identity-${field.key}`}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={profile.identity[field.key]}
                  onChange={(value) => updateIdentity(field.key, value)}
                />
              ))}
              <WorkFormatField
                value={profile.identity.workFormat}
                onChange={(value) => updateIdentity("workFormat", value)}
              />
              <LanguagesField
                value={profile.identity.languages}
                onChange={(value) => updateIdentity("languages", value)}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ссылки</CardTitle>
            <CardDescription>Публичные ссылки для контекста профиля.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-5 md:grid-cols-2">
              {linkFields.map((field) => (
                <TextInputField
                  key={field.key}
                  id={`link-${field.key}`}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={profile.links[field.key]}
                  onChange={(value) => updateLink(field.key, value)}
                />
              ))}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Навыки</CardTitle>
            <CardDescription>
              Группируйте навыки по собственным категориям. Один навык на строку.
            </CardDescription>
            <CardAction>
              <Button variant="outline" onClick={addSkillCategory}>
                <PlusIcon data-icon="inline-start" />
                Категория
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {profile.skills.map((category, categoryIndex) => (
              <SkillCategoryEditor
                key={categoryIndex}
                category={category}
                index={categoryIndex}
                onChange={(nextCategory) =>
                  updateSkillCategory(categoryIndex, nextCategory)
                }
                onRemove={() => removeSkillCategory(categoryIndex)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Опыт</CardTitle>
            <CardDescription>
              Компании и проекты с ролью, стеком и описанием вклада.
            </CardDescription>
            <CardAction>
              <Button variant="outline" onClick={addCompany}>
                <PlusIcon data-icon="inline-start" />
                Компания
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            {profile.experience.map((company, companyIndex) => (
              <CompanyEditor
                key={companyIndex}
                company={company}
                index={companyIndex}
                onChange={(nextCompany) =>
                  updateCompany(companyIndex, nextCompany)
                }
                onRemove={() => removeCompany(companyIndex)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Отдельные проекты</CardTitle>
            <CardDescription>
              Личные проекты, open-source или важные проекты.
            </CardDescription>
            <CardAction>
              <Button variant="outline" onClick={addStandaloneProject}>
                <PlusIcon data-icon="inline-start" />
                Проект
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            {profile.projects.map((project, projectIndex) => (
              <StandaloneProjectEditor
                key={projectIndex}
                project={project}
                index={projectIndex}
                onChange={(nextProject) =>
                  updateStandaloneProject(projectIndex, nextProject)
                }
                onRemove={() => removeStandaloneProject(projectIndex)}
              />
            ))}
          </CardContent>
        </Card>

      </div>

      {isDirty && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
            <p className="text-sm font-medium">
              Есть несохранённые изменения
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={cancelChanges}
                disabled={isPending}
              >
                <XIcon data-icon="inline-start" />
                Отменить
              </Button>
              <Button type="button" onClick={saveProfile} disabled={isPending}>
                <SaveIcon data-icon="inline-start" />
                {isPending ? "Сохраняю" : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SkillCategoryEditor({
  category,
  index,
  onChange,
  onRemove,
}: {
  category: SkillCategoryForm;
  index: number;
  onChange: (category: SkillCategoryForm) => void;
  onRemove: () => void;
}) {
  function updateCategoryName(name: string) {
    onChange({
      ...category,
      name,
    });
  }

  function updateSkills(skills: string[]) {
    onChange({
      ...category,
      skills,
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-medium">
          Категория {index + 1}
        </h2>
        <Button variant="destructive" onClick={onRemove}>
          <Trash2Icon data-icon="inline-start" />
          Удалить
        </Button>
      </div>
      <FieldGroup className="grid gap-5 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <TextInputField
          id={`skill-category-${index}-name`}
          label="Название категории"
          placeholder="Frontend"
          value={category.name}
          onChange={updateCategoryName}
        />
        <TagInputField
          id={`skill-category-${index}-skills`}
          label="Навыки"
          placeholder="React"
          value={category.skills}
          onChange={updateSkills}
        />
      </FieldGroup>
    </section>
  );
}

function CompanyEditor({
  company,
  index,
  onChange,
  onRemove,
}: {
  company: ExperienceCompanyForm;
  index: number;
  onChange: (company: ExperienceCompanyForm) => void;
  onRemove: () => void;
}) {
  function updateCompanyField(
    key: keyof Omit<ExperienceCompanyForm, "projects">,
    value: string,
  ) {
    onChange({
      ...company,
      [key]: value,
    });
  }

  function updateProject(projectIndex: number, project: ExperienceProjectForm) {
    onChange({
      ...company,
      projects: company.projects.map((currentProject, currentIndex) =>
        currentIndex === projectIndex ? project : currentProject,
      ),
    });
  }

  function addProject() {
    onChange({
      ...company,
      projects: [...company.projects, createEmptyExperienceProject()],
    });
  }

  function removeProject(projectIndex: number) {
    onChange({
      ...company,
      projects: removeAt(
        company.projects,
        projectIndex,
        createEmptyExperienceProject(),
      ),
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-medium">
          Компания {index + 1}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={addProject}>
            <PlusIcon data-icon="inline-start" />
            Проект
          </Button>
          <Button variant="destructive" onClick={onRemove}>
            <Trash2Icon data-icon="inline-start" />
            Удалить
          </Button>
        </div>
      </div>

      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <TextInputField
          id={`company-${index}-name`}
          label="Компания"
          placeholder="Acme Corp"
          value={company.companyName}
          onChange={(value) => updateCompanyField("companyName", value)}
        />
        <TextInputField
          id={`company-${index}-role`}
          label="Роль"
          placeholder="Frontend Engineer"
          value={company.role}
          onChange={(value) => updateCompanyField("role", value)}
        />
        <CompanyDatesField
          id={`company-${index}-dates`}
          label="Даты"
          value={company.dates}
          onChange={(value) => updateCompanyField("dates", value)}
        />
        <TextInputField
          id={`company-${index}-domain`}
          label="Домен"
          placeholder="FinTech"
          value={company.domain}
          onChange={(value) => updateCompanyField("domain", value)}
        />
        <TextInputField
          id={`company-${index}-team`}
          label="Команда"
          placeholder="6 разработчиков, дизайнер и продакт"
          value={company.team}
          onChange={(value) => updateCompanyField("team", value)}
        />
      </FieldGroup>

      {company.projects.map((project, projectIndex) => (
        <ExperienceProjectEditor
          key={projectIndex}
          project={project}
          companyIndex={index}
          projectIndex={projectIndex}
          onChange={(nextProject) => updateProject(projectIndex, nextProject)}
          onRemove={() => removeProject(projectIndex)}
        />
      ))}
    </section>
  );
}

function ExperienceProjectEditor({
  project,
  companyIndex,
  projectIndex,
  onChange,
  onRemove,
}: {
  project: ExperienceProjectForm;
  companyIndex: number;
  projectIndex: number;
  onChange: (project: ExperienceProjectForm) => void;
  onRemove: () => void;
}) {
  function updateProjectField(
    key: keyof ExperienceProjectForm,
    value: string,
  ) {
    onChange({
      ...project,
      [key]: value,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-sm font-medium">
          Проект {projectIndex + 1}
        </h3>
        <Button variant="destructive" size="sm" onClick={onRemove}>
          <Trash2Icon data-icon="inline-start" />
          Удалить
        </Button>
      </div>
      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <TextInputField
          id={`company-${companyIndex}-project-${projectIndex}-name`}
          label="Название проекта"
          placeholder="Личный кабинет"
          value={project.name}
          onChange={(value) => updateProjectField("name", value)}
        />
        <TextInputField
          id={`company-${companyIndex}-project-${projectIndex}-role`}
          label="Роль"
          placeholder="Frontend Engineer"
          value={project.role}
          onChange={(value) => updateProjectField("role", value)}
        />
        <TagInputField
          id={`company-${companyIndex}-project-${projectIndex}-stack`}
          label="Стек"
          placeholder="React, TypeScript, GraphQL"
          value={parseTagValue(project.stack)}
          onChange={(value) =>
            updateProjectField("stack", formatTagValue(value))
          }
        />
      </FieldGroup>
      <TextAreaField
        id={`company-${companyIndex}-project-${projectIndex}-work`}
        label="Чем занимался"
        placeholder="Опишите свободным текстом, что делали на проекте, за что отвечали и какие результаты важны."
        value={project.workDescription}
        onChange={(value) => updateProjectField("workDescription", value)}
      />
    </div>
  );
}

function StandaloneProjectEditor({
  project,
  index,
  onChange,
  onRemove,
}: {
  project: StandaloneProjectForm;
  index: number;
  onChange: (project: StandaloneProjectForm) => void;
  onRemove: () => void;
}) {
  function updateProjectField(
    key: keyof StandaloneProjectForm,
    value: string,
  ) {
    onChange({
      ...project,
      [key]: value,
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-medium">
          Проект {index + 1}
        </h2>
        <Button variant="destructive" onClick={onRemove}>
          <Trash2Icon data-icon="inline-start" />
          Удалить
        </Button>
      </div>

      <FieldGroup className="grid gap-5 md:grid-cols-2">
        <TextInputField
          id={`standalone-project-${index}-name`}
          label="Название проекта"
          placeholder="Coverletter"
          value={project.name}
          onChange={(value) => updateProjectField("name", value)}
        />
        <TextInputField
          id={`standalone-project-${index}-role`}
          label="Роль"
          placeholder="Автор проекта"
          value={project.role}
          onChange={(value) => updateProjectField("role", value)}
        />
        <TagInputField
          id={`standalone-project-${index}-stack`}
          label="Стек"
          placeholder="Next.js, TypeScript, API"
          value={parseTagValue(project.stack)}
          onChange={(value) =>
            updateProjectField("stack", formatTagValue(value))
          }
        />
      </FieldGroup>
      <TextAreaField
        id={`standalone-project-${index}-work`}
        label="Чем занимался"
        placeholder="Опишите свободным текстом, что сделали, какие решения принимали и почему проект важен."
        value={project.workDescription}
        onChange={(value) => updateProjectField("workDescription", value)}
      />
    </section>
  );
}

function TextInputField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function TagInputField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const tags = normalizeTags(value);

  function commitTags(nextTags: string[]) {
    onChange(normalizeTags(nextTags));
  }

  function addDraftTag(text: string) {
    const nextTags = parseTagInput(text);

    if (!nextTags.length) {
      return;
    }

    commitTags([...tags, ...nextTags]);
    setDraft("");
  }

  function removeTag(index: number) {
    commitTags(tags.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === ";") {
      event.preventDefault();
      addDraftTag(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && tags.length) {
      event.preventDefault();
      removeTag(tags.length - 1);
    }
  }

  function handleInputChange(nextValue: string) {
    if (!/[,\n;]/.test(nextValue)) {
      setDraft(nextValue);
      return;
    }

    const parts = nextValue.split(/[,\n;]/);
    const completedTags = parseTagInput(parts.slice(0, -1).join(","));
    const nextDraft = parts.at(-1) ?? "";

    if (completedTags.length) {
      commitTags([...tags, ...completedTags]);
    }

    setDraft(nextDraft);
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-4xl border border-input bg-input/30 px-2 py-1 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        {tags.map((tag, index) => (
          <Badge
            variant="secondary"
            className="h-6 gap-1 rounded-4xl px-2 text-sm"
            key={`${tag}-${index}`}
          >
            {tag}
            <button
              type="button"
              aria-label={`Удалить ${tag}`}
              className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[2px] focus-visible:ring-ring/60"
              onClick={() => removeTag(index)}
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={tags.length ? "" : placeholder}
          className="h-7 min-w-28 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground md:text-sm"
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addDraftTag(draft)}
        />
      </div>
    </Field>
  );
}

function CompanyDatesField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
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
    const currentPoint = range[point] ?? createDefaultYearMonth();

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

function MonthYearSelectGroup({
  label,
  idPrefix,
  value,
  disabled,
  onMonthChange,
  onYearChange,
}: {
  label: string;
  idPrefix: string;
  value?: YearMonth;
  disabled?: boolean;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}) {
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
          <SelectTrigger id={`${idPrefix}-month`} className="w-full">
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
          <SelectTrigger id={`${idPrefix}-year`} className="w-full">
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

function WorkFormatField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedFormats = parseWorkFormatValues(value);

  function toggleFormat(format: string) {
    const nextFormats = selectedFormats.includes(format)
      ? selectedFormats.filter((item) => item !== format)
      : [...selectedFormats, format];

    onChange(formatWorkFormatValues(nextFormats));
  }

  return (
    <Field className="md:col-span-2">
      <FieldLabel>Формат работы</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {workFormatOptions.map((item) => {
          const isSelected = selectedFormats.includes(item.value);

          return (
            <Button
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFormat(item.value)}
              aria-pressed={isSelected}
              className={isSelected ? "ring-2 ring-ring/35" : undefined}
              key={item.value}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </Field>
  );
}

function LanguagesField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [languages, setLanguages] = useState(() => parseLanguagesValue(value));

  function commit(nextLanguages: LanguageEntry[]) {
    setLanguages(nextLanguages);
    onChange(formatLanguagesValue(nextLanguages));
  }

  function updateLanguage(index: number, nextLanguage: string) {
    commit(
      languages.map((item, currentIndex) =>
        currentIndex === index ? { ...item, language: nextLanguage } : item,
      ),
    );
  }

  function updateLevel(index: number, nextLevel: string) {
    commit(
      languages.map((item, currentIndex) =>
        currentIndex === index ? { ...item, level: nextLevel } : item,
      ),
    );
  }

  function addLanguage() {
    commit([...languages, createEmptyLanguageEntry()]);
  }

  function removeLanguage(index: number) {
    commit(removeAt(languages, index, createEmptyLanguageEntry()));
  }

  return (
    <Field className="md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FieldLabel>Языки</FieldLabel>
        <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
          <PlusIcon data-icon="inline-start" />
          Добавить
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {languages.map((item, index) => (
          <div
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            key={index}
          >
            <Field>
              <FieldLabel htmlFor={`identity-language-${index}`}>
                Язык
              </FieldLabel>
              <Select
                value={item.language || undefined}
                onValueChange={(nextLanguage) =>
                  updateLanguage(index, nextLanguage)
                }
              >
                <SelectTrigger
                  id={`identity-language-${index}`}
                  className="w-full"
                >
                  <SelectValue placeholder="Язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {languageOptions.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`identity-language-level-${index}`}>
                Уровень
              </FieldLabel>
              <Select
                value={item.level || undefined}
                onValueChange={(nextLevel) => updateLevel(index, nextLevel)}
              >
                <SelectTrigger
                  id={`identity-language-level-${index}`}
                  className="w-full"
                >
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {languageLevelOptions.map((option) => (
                      <SelectItem value={option.value} key={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeLanguage(index)}
              className="md:self-end"
              aria-label={`Удалить язык ${index + 1}`}
              disabled={languages.length === 1}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
    </Field>
  );
}

function TextAreaField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function parseCompanyMonthRange(value: string): CompanyMonthRange {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return {};
  }

  const parts = normalizedValue.split(/\s+[—–-]\s+/);
  const from = parseCompanyYearMonth(parts[0] ?? "");
  const to = isCurrentCompanyDate(parts[1] ?? "")
    ? undefined
    : parseCompanyYearMonth(parts[1] ?? "");

  return {
    from,
    to,
    isCurrent: isCurrentCompanyDate(parts[1] ?? ""),
  };
}

function formatCompanyMonthRange(range: CompanyMonthRange) {
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

function formatCompanyMonthRangeForDisplay(
  value: string,
  range: CompanyMonthRange,
) {
  if (!value.trim()) {
    return "";
  }

  if (!range.from) {
    return value;
  }

  const from = formatCompanyYearMonthForDisplay(range.from);

  if (range.isCurrent) {
    return `${from} — по настоящее время`;
  }

  if (range.to) {
    return `${from} — ${formatCompanyYearMonthForDisplay(range.to)}`;
  }

  return from;
}

function parseCompanyYearMonth(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const isoMatch = normalizedValue.match(/^(\d{4})(?:-(\d{2})(?:-\d{2})?)?$/);

  if (isoMatch) {
    return clampCompanyYearMonth({
      year: isoMatch[1],
      month: isoMatch[2] ?? "01",
    });
  }

  const ruDateMatch = normalizedValue.match(/^\d{2}\.(\d{2})\.(\d{4})$/);

  if (ruDateMatch) {
    return clampCompanyYearMonth({
      year: ruDateMatch[2],
      month: ruDateMatch[1],
    });
  }

  return undefined;
}

function formatCompanyYearMonth(value: YearMonth) {
  return `${value.year}-${value.month}`;
}

function formatCompanyYearMonthForDisplay(value: YearMonth) {
  const month = monthOptions.find((option) => option.value === value.month);

  return `${month?.label ?? value.month} ${value.year}`;
}

function normalizeCompanyMonthRange(
  range: CompanyMonthRange,
): CompanyMonthRange {
  return {
    ...range,
    from: range.from ? clampCompanyYearMonth(range.from) : undefined,
    to: range.to ? clampCompanyYearMonth(range.to) : undefined,
  };
}

function createDefaultYearMonth(): YearMonth {
  const currentMonth = getCurrentYearMonth();

  return {
    year: currentMonth.year,
    month: currentMonth.month,
  };
}

function createYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let year = currentYear; year >= 1980; year -= 1) {
    years.push(String(year));
  }

  return years;
}

function getAvailableMonthOptions(year?: string) {
  const currentMonth = getCurrentYearMonth();

  if (!year || year === currentMonth.year) {
    return monthOptions.filter(
      (option) => Number(option.value) <= Number(currentMonth.month),
    );
  }

  return monthOptions;
}

function clampCompanyYearMonth(value: YearMonth): YearMonth {
  const currentMonth = getCurrentYearMonth();

  if (isFutureCompanyYearMonth(value, currentMonth)) {
    return currentMonth;
  }

  return value;
}

function isFutureCompanyYearMonth(value: YearMonth, currentMonth: YearMonth) {
  return (
    Number(value.year) > Number(currentMonth.year) ||
    (value.year === currentMonth.year &&
      Number(value.month) > Number(currentMonth.month))
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

function parseTagValue(value: string) {
  return parseTagInput(value);
}

function formatTagValue(value: string[]) {
  return normalizeTags(value).join(", ");
}

function parseTagInput(value: string) {
  return normalizeTags(value.split(/\s*(?:,|;|\n)\s*/));
}

function normalizeTags(value: string[]) {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of value) {
    const tag = item.replace(/\s+/g, " ").trim();
    const normalizedTag = tag.toLowerCase();

    if (!tag || seen.has(normalizedTag)) {
      continue;
    }

    seen.add(normalizedTag);
    tags.push(tag);
  }

  return tags;
}

function parseWorkFormatValues(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [];
  }

  return workFormatOptions
    .filter((item) =>
      normalizedValue.toLowerCase().includes(item.value.toLowerCase()),
    )
    .map((item) => item.value);
}

function formatWorkFormatValues(values: string[]) {
  return values.join(", ");
}

function createEmptyLanguageEntry(): LanguageEntry {
  return { language: "", level: "" };
}

function parseLanguagesValue(value: string): LanguageEntry[] {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return [createEmptyLanguageEntry()];
  }

  const entries = normalizedValue
    .split(/\s*(?:,|;|\n)\s*/)
    .map(parseLanguageEntry)
    .filter((item) => item.language || item.level);

  return entries.length ? entries : [createEmptyLanguageEntry()];
}

function parseLanguageEntry(value: string): LanguageEntry {
  const language = languageOptions.find((item) =>
    value.toLowerCase().includes(item.value.toLowerCase()),
  )?.value;
  const level = languageLevelOptions.find((item) =>
    value.toLowerCase().includes(item.value.toLowerCase()),
  )?.value;

  return {
    language: language ?? "",
    level: level ?? "",
  };
}

function formatLanguagesValue(languages: LanguageEntry[]) {
  return languages
    .filter((item) => item.language || item.level)
    .map((item) => formatLanguageValue(item.language, item.level))
    .join(", ");
}

function formatLanguageValue(language: string, level: string) {
  if (language && level) {
    return `${language} - ${level}`;
  }

  return language || level;
}

function serializeProfile(profile: ProfileFormState) {
  return JSON.stringify(profile);
}

function removeAt<T>(items: T[], index: number, fallback: T) {
  const nextItems = items.filter((_, currentIndex) => currentIndex !== index);

  return nextItems.length ? nextItems : [fallback];
}
