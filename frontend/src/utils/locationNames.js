// Match GeoJSON ADM3_EN labels to DB location names (Overview maps).

export function normalizeLocationName(name) {
  return (name || "")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^city of /, "")
    .replace(/ \(.*?\)/g, "")
    .replace(/ city$/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Geo label (normalized) → DB key (normalized) when automatic match fails
const GEO_TO_DB_KEY = {
  "bacolod city": "bacolod",
  "salvador benedicto": "don salvador benedicto",
  "dumaguete city": "dumaguete",
};

export function resolveGeoLookupKey(geoDisplayName, lookup) {
  const normalized = normalizeLocationName(geoDisplayName);
  const candidates = [
    GEO_TO_DB_KEY[normalized],
    normalized,
  ].filter(Boolean);

  for (const key of candidates) {
    if (lookup[key] !== undefined) return key;
  }
  return normalized;
}

export function buildCoverageLookup(coverageData) {
  const map = {};
  for (const entry of coverageData) {
    const key = normalizeLocationName(entry.location);
    map[key] = entry.value;
  }
  return map;
}
