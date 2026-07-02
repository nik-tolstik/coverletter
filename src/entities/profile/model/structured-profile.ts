export type ProfileFormState = {
  identity: {
    name: string;
    currentPosition: string;
    experience: string;
    location: string;
    workFormat: string;
    languages: string;
  };
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
    telegram: string;
  };
  skills: SkillCategoryForm[];
  experience: ExperienceCompanyForm[];
  projects: StandaloneProjectForm[];
};

export type ProfileJsonState = {
  schemaVersion: 5;
  identity: {
    name: string;
    currentPosition: string;
    experience: string;
    location: string;
    workFormats: string[];
    languages: ProfileLanguageJson[];
  };
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
    telegram: string;
  };
  skills: SkillCategoryForm[];
  experience: ExperienceCompanyForm[];
  projects: StandaloneProjectForm[];
};

export type ProfileLanguageJson = {
  language: string;
  level: string;
};

export type SkillCategoryForm = {
  name: string;
  skills: string[];
};

export type ExperienceCompanyForm = {
  companyName: string;
  role: string;
  dates: string;
  domain: string;
  projects: ExperienceProjectForm[];
};

export type ExperienceProjectForm = {
  name: string;
  role: string;
  stack: string;
  workDescription: string;
};

export type StandaloneProjectForm = {
  name: string;
  role: string;
  stack: string;
  workDescription: string;
};

const legacySkillKeys = [
  "expert",
  "strong",
  "workingKnowledge",
  "familiar",
] as const;

const legacySkillCategoryLabels = new Set([
  "expert",
  "strong",
  "working knowledge",
  "familiar",
  "экспертно",
  "уверенно",
  "рабочий уровень",
  "знакомо",
]);

const migratedSkillCategoryName = "General";

export function createEmptyProfileForm(): ProfileFormState {
  return {
    identity: {
      name: "",
      currentPosition: "",
      experience: "",
      location: "",
      workFormat: "",
      languages: "",
    },
    links: {
      github: "",
      linkedin: "",
      portfolio: "",
      telegram: "",
    },
    skills: [createEmptySkillCategory()],
    experience: [createEmptyCompany()],
    projects: [createEmptyStandaloneProject()],
  };
}

export function createEmptyProfileJson(): ProfileJsonState {
  return profileFormToJson(createEmptyProfileForm());
}

export function createEmptySkillCategory(): SkillCategoryForm {
  return {
    name: "",
    skills: [""],
  };
}

export function createEmptyCompany(): ExperienceCompanyForm {
  return {
    companyName: "",
    role: "",
    dates: "",
    domain: "",
    projects: [createEmptyExperienceProject()],
  };
}

export function createEmptyExperienceProject(): ExperienceProjectForm {
  return {
    name: "",
    role: "",
    stack: "",
    workDescription: "",
  };
}

export function createEmptyStandaloneProject(): StandaloneProjectForm {
  return {
    name: "",
    role: "",
    stack: "",
    workDescription: "",
  };
}

export function parseMarkdownToProfileForm(markdown: string): ProfileFormState {
  const fallback = createEmptyProfileForm();
  const identity = readLabeledBullets(readSection(markdown, "Identity"));
  const links = readLabeledBullets(readSection(markdown, "Links"));
  const skills = readSection(markdown, "Skills");

  return {
    identity: {
      name: readLabel(identity, "Name", "Имя") ?? fallback.identity.name,
      currentPosition:
        readLabel(identity, "Current position", "Текущая позиция", "Role", "Роль") ??
        fallback.identity.currentPosition,
      experience:
        readLabel(identity, "Experience", "Опыт") ?? fallback.identity.experience,
      location:
        readLabel(identity, "Location", "Локация") ?? fallback.identity.location,
      workFormat:
        readLabel(identity, "Work format", "Формат работы") ??
        fallback.identity.workFormat,
      languages:
        readLabel(identity, "Languages", "Языки") ?? fallback.identity.languages,
    },
    links: {
      github: links["GitHub"] ?? fallback.links.github,
      linkedin: links["LinkedIn"] ?? fallback.links.linkedin,
      portfolio:
        readLabel(links, "Portfolio", "Портфолио") ?? fallback.links.portfolio,
      telegram: links["Telegram"] ?? fallback.links.telegram,
    },
    skills: readSkillCategories(skills),
    experience: readExperience(readSection(markdown, "Experience")),
    projects: readProjects(readSection(markdown, "Projects")),
  };
}

export function parseMarkdownToProfileJson(markdown: string): ProfileJsonState {
  return profileFormToJson(parseMarkdownToProfileForm(markdown));
}

export function normalizeProfileJson(input: unknown): ProfileJsonState {
  if (!isRecord(input)) {
    return createEmptyProfileJson();
  }

  const fallback = createEmptyProfileJson();
  const identity = readRecord(input.identity);
  const links = readRecord(input.links);

  return {
    schemaVersion: 5,
    identity: {
      name: readString(identity.name),
      currentPosition: readString(identity.currentPosition),
      experience: readString(identity.experience),
      location: readString(identity.location),
      workFormats: readStringArray(identity.workFormats),
      languages: readLanguagesJson(identity.languages),
    },
    links: {
      github: readString(links.github),
      linkedin: readString(links.linkedin),
      portfolio: readString(links.portfolio),
      telegram: readString(links.telegram),
    },
    skills: readSkillCategoriesJson(input.skills, fallback.skills),
    experience: readExperienceJson(input.experience, fallback.experience),
    projects: readProjectsJson(input.projects, fallback.projects),
  };
}

export function profileJsonToForm(profile: ProfileJsonState): ProfileFormState {
  return {
    identity: {
      name: profile.identity.name,
      currentPosition: profile.identity.currentPosition,
      experience: profile.identity.experience,
      location: profile.identity.location,
      workFormat: profile.identity.workFormats.join(", "),
      languages: profile.identity.languages
        .map((item) => formatLanguageValue(item.language, item.level))
        .join(", "),
    },
    links: profile.links,
    skills: profile.skills,
    experience: profile.experience,
    projects: profile.projects,
  };
}

export function profileFormToJson(profile: ProfileFormState): ProfileJsonState {
  return {
    schemaVersion: 5,
    identity: {
      name: writeLineValue(profile.identity.name),
      currentPosition: writeLineValue(profile.identity.currentPosition),
      experience: writeLineValue(profile.identity.experience),
      location: writeLineValue(profile.identity.location),
      workFormats: readDelimitedValues(profile.identity.workFormat),
      languages: readLanguageEntries(profile.identity.languages),
    },
    links: {
      github: writeLineValue(profile.links.github),
      linkedin: writeLineValue(profile.links.linkedin),
      portfolio: writeLineValue(profile.links.portfolio),
      telegram: writeLineValue(profile.links.telegram),
    },
    skills: normalizeSkillCategories(profile.skills),
    experience: profile.experience.map((company) => ({
      companyName: writeLineValue(company.companyName),
      role: writeLineValue(company.role),
      dates: writeLineValue(company.dates),
      domain: writeLineValue(company.domain),
      projects: ensureExperienceProjects(company.projects).map((project) => ({
        name: writeLineValue(project.name),
        role: writeLineValue(project.role),
        stack: writeLineValue(project.stack),
        workDescription: writeTextValue(project.workDescription),
      })),
    })),
    projects: profile.projects.map((project) => ({
      name: writeLineValue(project.name),
      role: writeLineValue(project.role),
      stack: writeLineValue(project.stack),
      workDescription: writeTextValue(project.workDescription),
    })),
  };
}

export function profileJsonToMarkdown(profile: ProfileJsonState) {
  return serializeProfileFormToMarkdown(profileJsonToForm(profile));
}

export function serializeProfileFormToMarkdown(profile: ProfileFormState) {
  return `# Profile

## Identity

- Name: ${writeLineValue(profile.identity.name)}
- Current position: ${writeLineValue(profile.identity.currentPosition)}
- Experience: ${writeLineValue(profile.identity.experience)}
- Location: ${writeLineValue(profile.identity.location)}
- Work format: ${writeLineValue(profile.identity.workFormat)}
- Languages: ${writeLineValue(profile.identity.languages)}

## Links

- GitHub: ${writeLineValue(profile.links.github)}
- LinkedIn: ${writeLineValue(profile.links.linkedin)}
- Portfolio: ${writeLineValue(profile.links.portfolio)}
- Telegram: ${writeLineValue(profile.links.telegram)}

## Skills

${writeSkillCategories(profile.skills)}

## Experience

${writeExperience(profile.experience)}

## Projects

${writeProjects(profile.projects)}
`;
}

function readSection(markdown: string, name: string) {
  const escapedName = escapeRegExp(name);
  const match = markdown.match(
    new RegExp(`^## ${escapedName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "m"),
  );

  return match?.[1]?.trim() ?? "";
}

function readLabeledBullets(section: string) {
  return Object.fromEntries(
    section
      .split("\n")
      .map((line) => line.match(/^\s*-\s*([^:]+?)\s*:\s*(.*)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1], match[2]?.trim() ?? ""]),
  );
}

function readLabel(labels: Record<string, string>, ...aliases: string[]) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeLabel(alias);
    const match = Object.entries(labels).find(
      ([label]) => normalizeLabel(label) === normalizedAlias,
    );

    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function normalizeLabel(label: string) {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

function readBullets(section: string) {
  return section
    .split("\n")
    .map((line) => line.match(/^- ?(.*)$/)?.[1]?.trim())
    .filter((value): value is string => value !== undefined);
}

function readExperience(section: string) {
  return splitHeadingBlocks(section, 3).map(({ title, body }) => {
    const firstProjectIndex = body.search(/\n#### /);
    const companyMeta =
      firstProjectIndex >= 0 ? body.slice(0, firstProjectIndex) : body;
    const projectsBody =
      firstProjectIndex >= 0 ? body.slice(firstProjectIndex + 1) : "";
    const labels = readLabeledBullets(companyMeta);
    const projectBlocks = projectsBody
      ? splitHeadingBlocks(projectsBody, 4)
      : [];

    return {
      companyName: title === "Company Name" ? "" : title,
      role: readLabel(labels, "Role", "Роль") ?? "",
      dates: readLabel(labels, "Dates", "Даты") ?? "",
      domain: readLabel(labels, "Domain", "Домен") ?? "",
      projects: ensureExperienceProjects(
        projectBlocks.map(({ title: projectTitle, body: projectBody }) => {
          const projectLabels = readLabeledBullets(projectBody);
          const context = readLabel(projectLabels, "Context", "Контекст") ?? "";
          const role =
            readLabel(projectLabels, "Role", "Роль", "My role", "Моя роль") ??
            "";
          const tasks = readNestedBullets(projectBody, "Tasks", "Задачи");
          const results = readNestedBullets(projectBody, "Results", "Результаты");
          const workDescription =
            readLabeledBlock(
              projectBody,
              "What I did",
              "Описание",
              "Work",
            ) ||
            buildProjectWorkDescription({
              context,
              tasks,
              results,
            });

          return {
            name: projectTitle.replace(/^Project:\s*/, "") === "Project Name"
              ? ""
              : projectTitle.replace(/^Project:\s*/, ""),
            role,
            stack: readLabel(projectLabels, "Stack", "Стек") ?? "",
            workDescription,
          };
        }),
      ),
    };
  });
}

function readProjects(section: string) {
  return splitHeadingBlocks(section, 3).map(({ title, body }) => {
    const labels = readLabeledBullets(body);
    const context = readLabel(labels, "Context", "Контекст") ?? "";
    const contributions = readNestedBullets(
      body,
      "My contribution",
      "Мой вклад",
    );
    const relevance = readLabel(labels, "Relevance", "Релевантность") ?? "";
    const workDescription =
      readLabeledBlock(
        body,
        "What I did",
        "Описание",
        "Work",
      ) ||
      buildProjectWorkDescription({
        context,
        tasks: contributions,
        relevance,
      });

    return {
      name: title === "Project Name" ? "" : title,
      role: readLabel(labels, "Role", "Роль", "Type", "Тип") ?? "",
      stack: readLabel(labels, "Stack", "Стек") ?? "",
      workDescription,
    };
  });
}

function readSkillCategories(section: string) {
  const categories = splitHeadingBlocks(section, 3).map(({ title, body }) => ({
    name: title === "Category Name" ? "" : title,
    skills: ensureList(readBullets(body)),
  }));

  if (isLegacySkillCategoryList(categories)) {
    return [
      {
        name: migratedSkillCategoryName,
        skills: ensureList(
          deduplicateList(categories.flatMap((category) => category.skills)),
        ),
      },
    ];
  }

  return categories;
}

function readNestedBullets(section: string, ...labels: string[]) {
  const match = labels
    .map((label) =>
      section.match(
        new RegExp(`^- ${escapeRegExp(label)}:\\s*\\n((?:\\s+-.*\\n?)*)`, "m"),
      ),
    )
    .find(Boolean);

  return (match?.[1] ?? "")
    .split("\n")
    .map((line) => line.match(/^\s+- ?(.*)$/)?.[1]?.trim())
    .filter((value): value is string => value !== undefined);
}

function readLabeledBlock(section: string, ...labels: string[]) {
  const lines = section.split("\n");

  for (const label of labels) {
    const normalizedLabel = normalizeLabel(label);
    const startIndex = lines.findIndex((line) => {
      const match = line.match(/^\s*-\s*([^:]+?)\s*:/);

      return match ? normalizeLabel(match[1]) === normalizedLabel : false;
    });

    if (startIndex === -1) {
      continue;
    }

    const firstLine = lines[startIndex] ?? "";
    const firstValue = firstLine.replace(/^\s*-\s*[^:]+?\s*:\s*/, "");
    const continuation: string[] = [];

    for (const line of lines.slice(startIndex + 1)) {
      if (/^\s*-\s*[^:]+?\s*:/.test(line) || /^#{1,6}\s+/.test(line)) {
        break;
      }

      if (/^\s{2,}/.test(line) || !line.trim()) {
        continuation.push(line.replace(/^\s{2}/, ""));
      } else {
        break;
      }
    }

    return writeTextValue([firstValue, ...continuation].join("\n"));
  }

  return "";
}

function splitHeadingBlocks(section: string, level: 3 | 4) {
  const heading = "#".repeat(level);
  const matches = [...section.matchAll(new RegExp(`^${heading} (.+)$`, "gm"))];

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? section.length;

    return {
      title: match[1].trim(),
      body: section.slice(start, end).trim(),
    };
  });
}

function writeExperience(companies: ExperienceCompanyForm[]) {
  return companies
    .map((company) => {
      const companyName = company.companyName || "Company Name";

      return `### ${writeHeadingValue(companyName)}

- Role: ${writeLineValue(company.role)}
- Dates: ${writeLineValue(company.dates)}
- Domain: ${writeLineValue(company.domain)}

${ensureExperienceProjects(company.projects)
  .map((project) => `#### Project: ${writeHeadingValue(project.name || "Project Name")}

- Role: ${writeLineValue(project.role)}
- Stack: ${writeLineValue(project.stack)}
${writeLabeledBlock("What I did", project.workDescription)}`)
  .join("\n\n")}`;
    })
    .join("\n\n");
}

function writeProjects(projects: StandaloneProjectForm[]) {
  return projects
    .map((project) => `### ${writeHeadingValue(project.name || "Project Name")}

- Role: ${writeLineValue(project.role)}
- Stack: ${writeLineValue(project.stack)}
${writeLabeledBlock("What I did", project.workDescription)}`)
    .join("\n\n");
}

function writeSkillCategories(categories: SkillCategoryForm[]) {
  return categories
    .map((category) => `### ${writeHeadingValue(category.name || "Category Name", "Category Name")}

${writeBullets(category.skills)}`)
    .join("\n\n");
}

function writeBullets(items: string[]) {
  const normalizedItems = normalizeList(items);

  return normalizedItems.length
    ? normalizedItems.map((item) => `- ${item}`).join("\n")
    : "-";
}

function writeLabeledBlock(label: string, value: string) {
  const normalizedValue = writeTextValue(value);

  if (!normalizedValue) {
    return `- ${label}:`;
  }

  if (!normalizedValue.includes("\n")) {
    return `- ${label}: ${normalizedValue}`;
  }

  return `- ${label}:\n${normalizedValue
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")}`;
}

function normalizeList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function deduplicateList(items: string[]) {
  return Array.from(new Set(normalizeList(items)));
}

function normalizeSkillCategories(categories: SkillCategoryForm[]) {
  const normalizedCategories = categories
    .map((category) => ({
      name: writeLineValue(category.name),
      skills: normalizeList(category.skills),
    }))
    .filter((category) => category.name || category.skills.length)
    .map((category) => ({
      ...category,
      skills: ensureList(category.skills),
    }));

  return normalizedCategories;
}

function writeLineValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function writeTextValue(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function writeHeadingValue(value: string, fallback = "Project Name") {
  return writeLineValue(value) || fallback;
}

function ensureList(items: string[]) {
  return items.length ? items : [""];
}

function ensureExperienceProjects(projects: ExperienceProjectForm[]) {
  return projects.length ? projects : [createEmptyExperienceProject()];
}

function readDelimitedValues(value: string) {
  return value
    .split(/\s*(?:,|;|\n)\s*/)
    .map(writeLineValue)
    .filter(Boolean);
}

function readLanguageEntries(value: string): ProfileLanguageJson[] {
  return readDelimitedValues(value)
    .map((entry) => {
      const [language = "", level = ""] = entry
        .split(/\s+-\s+|\s*:\s*/)
        .map(writeLineValue);

      return { language, level };
    })
    .filter((item) => item.language || item.level);
}

function formatLanguageValue(language: string, level: string) {
  if (language && level) {
    return `${language} - ${level}`;
  }

  return language || level;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readRecord(input: unknown) {
  return isRecord(input) ? input : {};
}

function readString(input: unknown) {
  return typeof input === "string" ? writeLineValue(input) : "";
}

function readText(input: unknown) {
  return typeof input === "string" ? writeTextValue(input) : "";
}

function readStringArray(input: unknown) {
  return Array.isArray(input)
    ? input.map(readString).filter(Boolean)
    : [];
}

function readLanguagesJson(input: unknown): ProfileLanguageJson[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      const language = readRecord(item);

      return {
        language: readString(language.language),
        level: readString(language.level),
      };
    })
    .filter((item) => item.language || item.level);
}

function readSkillCategoriesJson(
  input: unknown,
  fallback: SkillCategoryForm[],
) {
  if (Array.isArray(input)) {
    const categories = input
      .map((item) => {
        const category = readRecord(item);

        return {
          name: readString(category.name),
          skills: ensureList(readStringArray(category.skills)),
        };
      })
      .filter(
        (category) => category.name || normalizeList(category.skills).length,
      );

    return categories;
  }

  const legacySkills = readLegacySkillGroups(input);

  if (legacySkills.length) {
    return [
      {
        name: migratedSkillCategoryName,
        skills: ensureList(deduplicateList(legacySkills)),
      },
    ];
  }

  return fallback;
}

function readExperienceJson(
  input: unknown,
  fallback: ExperienceCompanyForm[],
) {
  if (!Array.isArray(input)) {
    return fallback;
  }

  const companies = input
    .map((item) => {
      const company = readRecord(item);

      return {
        companyName: readString(company.companyName),
        role: readString(company.role),
        dates: readString(company.dates),
        domain: readString(company.domain),
        projects: readExperienceProjectsJson(company.projects),
      };
    });

  return companies;
}

function readExperienceProjectsJson(input: unknown) {
  if (!Array.isArray(input)) {
    return [createEmptyExperienceProject()];
  }

  const projects = input.map((item) => {
    const project = readRecord(item);
    const context = readString(project.context);
    const tasks = readStringArray(project.tasks);
    const results = readStringArray(project.results);
    const workDescription =
      readText(project.workDescription) ||
      buildProjectWorkDescription({
        context,
        tasks,
        results,
      });

    return {
      name: readString(project.name),
      role: readString(project.role) || readString(project.myRole),
      stack: readString(project.stack),
      workDescription,
    };
  });

  return ensureExperienceProjects(projects);
}

function readProjectsJson(input: unknown, fallback: StandaloneProjectForm[]) {
  if (!Array.isArray(input)) {
    return fallback;
  }

  const projects = input.map((item) => {
    const project = readRecord(item);
    const context = readString(project.context);
    const link = readString(project.link);
    const contributions = readStringArray(project.contributions);
    const relevance = readString(project.relevance);
    const workDescription =
      readText(project.workDescription) ||
      buildProjectWorkDescription({
        link,
        context,
        tasks: contributions,
        relevance,
      });

    return {
      name: readString(project.name),
      role: readString(project.role) || readString(project.type),
      stack: readString(project.stack),
      workDescription,
    };
  });

  return projects;
}

function readLegacySkillGroups(input: unknown) {
  const skills = readRecord(input);

  return legacySkillKeys.flatMap((key) => readStringArray(skills[key]));
}

function buildProjectWorkDescription({
  link,
  context,
  tasks,
  results,
  relevance,
}: {
  link?: string;
  context?: string;
  tasks?: string[];
  results?: string[];
  relevance?: string;
}) {
  return [
    link ? `Link: ${link}` : "",
    context ? `Context: ${context}` : "",
    ...(tasks?.length ? tasks.map((task) => `- ${task}`) : []),
    ...(results?.length ? results.map((result) => `Result: ${result}`) : []),
    relevance ? `Relevance: ${relevance}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function isLegacySkillCategoryList(categories: SkillCategoryForm[]) {
  return (
    categories.length > 0 &&
    categories.every((category) =>
      legacySkillCategoryLabels.has(normalizeLabel(category.name)),
    )
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
