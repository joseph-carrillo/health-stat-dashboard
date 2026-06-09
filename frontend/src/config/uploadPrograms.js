// Upload helpers — filename matching and period labels.

export const QUARTERS = [
  { value: 1, label: "Q1 (Jan–Mar)" },
  { value: 2, label: "Q2 (Apr–Jun)" },
  { value: 3, label: "Q3 (Jul–Sep)" },
  { value: 4, label: "Q4 (Oct–Dec)" },
];

export function normalizeMatchText(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function filenameMatchesTemplate(filename, pattern) {
  if (!pattern || !filename) return true;
  return normalizeMatchText(filename).includes(normalizeMatchText(pattern));
}

export function filenameMismatchMessage(filename, template) {
  if (!template?.source_file_pattern) return "";
  if (filenameMatchesTemplate(filename, template.source_file_pattern)) return "";
  return (
    `The file "${filename}" does not match ${template.label}. ` +
    `Expected the filename to contain "${template.source_file_pattern}".`
  );
}

export function findCatalogProgram(catalog, programCode) {
  return catalog?.programs?.find((p) => p.code === programCode) || null;
}

export function findCatalogSubProgram(program, subProgramName) {
  return program?.sub_programs?.find((s) => s.name === subProgramName) || null;
}

export function findCatalogTemplate(subProgram, templateId) {
  return subProgram?.templates?.find((t) => t.id === templateId) || null;
}

/** FHSIS immunization file order: 1, 4, 5, 6, 7, 8 (no files 2–3 in this program). */
export function templateFileNumber(template) {
  if (template?.sort_order != null) return template.sort_order;
  if (template?.file_number != null) return template.file_number;
  const match = (template?.label || "").match(/File\s+(\d+)/i);
  return match ? Number(match[1]) : 9999;
}

export function sortTemplatesByFhsisFile(templates = []) {
  return [...templates].sort((a, b) => {
    const diff = templateFileNumber(a) - templateFileNumber(b);
    return diff !== 0 ? diff : (a.label || "").localeCompare(b.label || "");
  });
}

export function getDefaultUploadSelection(catalog) {
  if (!catalog?.programs?.length) return null;

  for (const program of catalog.programs) {
    for (const subProgram of program.sub_programs) {
      const template = subProgram.templates?.[0];
      if (template) {
        return {
          programCode: program.code,
          subProgramName: subProgram.name,
          templateId: template.id,
        };
      }
    }
  }

  const program = catalog.programs[0];
  return {
    programCode: program.code,
    subProgramName: program.sub_programs[0]?.name || "",
    templateId: "",
  };
}

export function periodLabel(frequency, periodValue, year, months) {
  if (frequency === "quarterly") {
    return `${QUARTERS.find((q) => q.value === periodValue)?.label || `Q${periodValue}`} ${year}`;
  }
  if (frequency === "annual") {
    return `${year}`;
  }
  const monthLabel = months.find((m) => m.value === periodValue)?.label || "";
  return `${monthLabel} ${year}`.trim();
}
