// frontend/src/pages/analytics/Overview.jsx

import Navbar from "../../components/Navbar";
import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  buildCoverageLookup,
  resolveGeoLookupKey,
} from "../../utils/locationNames";
import {
  DEFAULT_OVERVIEW_INDICATOR,
  findOverviewIndicator,
  OVERVIEW_INDICATOR_GROUPS,
  CHILD_CARE_SUBAREAS,
} from "../../config/overviewIndicators";

// Every Child Care KPI code across the four sub-areas (fetched in one batch
// when the card is expanded).
const CC_ALL_CODES = CHILD_CARE_SUBAREAS.flatMap((s) =>
  s.options.map((o) => o.code)
);

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" },   { value: 4, label: "April" },
  { value: 5, label: "May" },     { value: 6, label: "June" },
  { value: 7, label: "July" },    { value: 8, label: "August" },
  { value: 9, label: "September" },{ value: 10, label: "October" },
  { value: 11, label: "November" },{ value: 12, label: "December" },
];

// PCT values are stored as decimal ratios (0.915 = 91.5%)
function getCoverageColor(ratio) {
  if (ratio === null || ratio === undefined) return "#CBD5E1";
  if (ratio >= 0.95) return "#16A34A";
  if (ratio >= 0.80) return "#EAB308";
  return "#DC2626";
}

export default function Overview() {
  const [nirGeo, setNirGeo] = useState(null);
  const [hucGeo, setHucGeo] = useState(null);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1); // Jan 2026 — latest committed Immunization period in DB
  const [indicatorCode, setIndicatorCode] = useState(DEFAULT_OVERVIEW_INDICATOR);
  const [coverageData, setCoverageData] = useState([]);
  const [mapPeriod, setMapPeriod] = useState(null);
  const [attention, setAttention] = useState(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [programsData, setProgramsData] = useState(null);
  // Child Care expandable card: open state + regional rollups for every
  // sub-area KPI, keyed by indicator code.
  const [ccExpanded, setCcExpanded] = useState(false);
  const [ccData, setCcData] = useState({});
  const mapRef = useRef(null);

  // Load GeoJSON files once
  useEffect(() => {
    fetch("/geojson/NIR.geojson").then((r) => r.json()).then(setNirGeo)
      .catch(() => console.error("Could not load NIR.geojson"));
    fetch("/geojson/HUC.geojson").then((r) => r.json()).then(setHucGeo)
      .catch(() => console.error("Could not load HUC.geojson"));
  }, []);

  // Tier-1 at-a-glance grid: one card per program, latest period per program.
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/overview/programs?year=${year}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then(setProgramsData)
      .catch(() => setProgramsData(null));
  }, [year]);

  // Child Care sub-area rollups: when expanded, fetch every sub-area KPI in one
  // batch (frequency-agnostic — each resolves its own latest period).
  useEffect(() => {
    if (!ccExpanded) return;
    const token = localStorage.getItem("token");
    let cancelled = false;
    fetch(
      `/api/overview/indicators?codes=${encodeURIComponent(CC_ALL_CODES.join(","))}&year=${year}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setCcData(d?.indicators || {}); })
      .catch(() => { if (!cancelled) setCcData({}); });
    return () => { cancelled = true; };
  }, [ccExpanded, year]);

  // Clicking a program card drills the map/ranking into its flagship indicator.
  function handleProgramClick(p) {
    if (!p.flagship_code || p.regional_pct == null) return;
    setIndicatorCode(p.flagship_code);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Drill the map into a sub-area's selected indicator.
  function handleSubAreaDrill(code) {
    setIndicatorCode(code);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Fetch coverage from API whenever year/month changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    fetch(
      `/api/coverage-summary?year=${year}&month=${month}&indicator_code=${encodeURIComponent(indicatorCode)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((r) => {
        if (!r.ok) throw new Error("coverage fetch failed");
        return r.json();
      })
      .then((d) => {
        setCoverageData(d.data || []);
        setMapPeriod({ label: d.period_label, type: d.period_type });
      })
      .catch(() => setError("Could not load coverage data."))
      .finally(() => setLoading(false));
  }, [year, month, indicatorCode]);

  const mapIsMonthly = !mapPeriod || mapPeriod.type === "monthly";
  const mapPeriodLabel = mapPeriod?.label || (mapIsMonthly ? `${MONTHS[month - 1]?.label} ${year}` : `${year}`);

  // Needs-attention panel: bottom LGUs, >100% DQC flags, dropped-off LGUs for
  // the selected map indicator (frequency-agnostic — its latest reported period).
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(
      `/api/overview/needs-attention?indicator_code=${encodeURIComponent(indicatorCode)}&year=${year}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then(setAttention)
      .catch(() => setAttention(null));
  }, [indicatorCode, year]);

  const selectedIndicator = findOverviewIndicator(indicatorCode);

  const coverageLookup = useMemo(
    () => buildCoverageLookup(coverageData),
    [coverageData]
  );

  function getRatioForGeoName(geoName) {
    const key = resolveGeoLookupKey(geoName, coverageLookup);
    return coverageLookup[key] ?? null;
  }

  function styleFeature(feature) {
    const ratio = getRatioForGeoName(feature.properties.ADM3_EN || "");
    return {
      fillColor: getCoverageColor(ratio),
      fillOpacity: 0.75,
      color: "#ffffff",
      weight: 1,
    };
  }

  function onEachFeature(feature, layer) {
    const name = feature.properties.ADM3_EN || "Unknown";
    const ratio = getRatioForGeoName(name);
    const display = ratio !== null ? `${(ratio * 100).toFixed(1)}%` : "No data";
    layer.bindTooltip(`${name}: ${display}`, { sticky: true });
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Page header + period selector */}
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.pageTitle}>Analytics — Overview</h1>
            <p style={styles.pageSub}>
              Regional program performance at a glance — drill into any indicator on the maps below.
            </p>
          </div>
          <div style={styles.filterWrap}>
            <span style={styles.filterCaption}>Map filters</span>
            <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Indicator</label>
              <select
                style={styles.select}
                value={indicatorCode}
                onChange={(e) => setIndicatorCode(e.target.value)}
              >
                {OVERVIEW_INDICATOR_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => (
                      <option key={o.code} value={o.code}>{o.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Month</label>
              <select
                style={{ ...styles.select, ...(mapIsMonthly ? {} : styles.selectDisabled) }}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                disabled={!mapIsMonthly}
                title={mapIsMonthly ? "" : "This indicator is not monthly — showing its latest reported period"}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Year</label>
              <select style={styles.select} value={year}
                onChange={(e) => setYear(Number(e.target.value))}>
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            </div>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* TIER 1 — at-a-glance program performance grid */}
        {programsData && (
          <>
            <p style={styles.glanceNote}>
              Each program shows its headline coverage for its latest reported period in {year}. Click a program with data to drill into the map below.
            </p>
            <div style={styles.programGrid}>
              {programsData.programs.map((p) => {
                const pct = p.regional_pct == null ? null : Math.round(p.regional_pct * 1000) / 10;
                const color = getCoverageColor(p.regional_pct);
                const isChildCare = p.program_code === "CHILD_CARE";
                const clickable = isChildCare || (p.flagship_code && p.regional_pct != null);
                return (
                  <div
                    key={p.program_code}
                    onClick={() => (isChildCare ? setCcExpanded((v) => !v) : handleProgramClick(p))}
                    style={{
                      ...styles.programCard,
                      borderTop: `4px solid ${color}`,
                      cursor: clickable ? "pointer" : "default",
                      ...(isChildCare && ccExpanded ? styles.programCardActive : {}),
                    }}
                    title={
                      isChildCare
                        ? (ccExpanded ? "Hide sub-areas" : "Show Child Care sub-areas")
                        : (clickable ? `View ${p.flagship_label} on the map` : "")
                    }
                  >
                    <p style={styles.programName}>
                      {p.program_name}
                      {isChildCare && <span style={styles.caret}>{ccExpanded ? "▲" : "▼"}</span>}
                    </p>
                    <p style={{ ...styles.programValue, color: pct == null ? "#94A3B8" : "#0F172A" }}>
                      {pct == null ? "—" : `${pct}%`}
                    </p>
                    <p style={styles.programSub}>
                      {p.flagship_label}
                      {p.period_label ? ` · ${p.period_label}` : ""}
                    </p>
                    {pct == null ? (
                      <p style={styles.programNote}>
                        {p.locations_reporting === 0 ? "no data yet" : "metric not reported"}
                      </p>
                    ) : (
                      <p style={styles.programNote}>
                        {p.locations_reporting}/{p.total_locations} LGUs · ▲{p.on_target} on-target · ⛔{p.below_target} below
                      </p>
                    )}
                    {isChildCare && (
                      <p style={styles.programNote}>
                        {ccExpanded ? "click to collapse" : "click to see 4 sub-areas"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Child Care sub-area detail — expandable: every KPI per sub-area */}
            {ccExpanded && (
              <div style={styles.subAreaPanel}>
                <p style={styles.subAreaPanelTitle}>
                  Child Care · all indicators by sub-area — click any value to map it
                </p>
                <div style={styles.subAreaGrid}>
                  {CHILD_CARE_SUBAREAS.map((s) => (
                    <div key={s.key} style={styles.subAreaCard}>
                      <p style={styles.subAreaName}>
                        {s.label}
                        <span style={styles.subAreaCount}>{s.options.length}</span>
                      </p>
                      <ul style={styles.kpiList}>
                        {s.options.map((o) => {
                          const d = ccData[o.code];
                          const ratio = d ? d.regional_pct : null;
                          const pct = ratio == null ? null : Math.round(ratio * 1000) / 10;
                          const hasData = pct != null;
                          return (
                            <li
                              key={o.code}
                              style={{ ...styles.kpiRow, cursor: hasData ? "pointer" : "default" }}
                              onClick={() => hasData && handleSubAreaDrill(o.code)}
                              title={
                                hasData
                                  ? `${d.period_label} · ${d.locations_reporting}/${d.total_locations} LGUs · view on the map`
                                  : "No data yet"
                              }
                            >
                              <span style={styles.kpiLabel}>{o.label}</span>
                              <span
                                style={{
                                  ...styles.kpiValue,
                                  color: hasData ? getCoverageColor(ratio) : "#CBD5E1",
                                }}
                              >
                                {hasData ? `${pct}%` : "—"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Maps section header — reflects the Map filters at the top of the page */}
        <div style={styles.mapsHeader} ref={mapRef}>
          <h2 style={styles.mapsHeaderTitle}>
            Coverage map —{" "}
            {selectedIndicator.group
              ? `${selectedIndicator.group} · ${selectedIndicator.label}`
              : "Child Care — Immunization"}
          </h2>
          <span style={styles.periodTag}>Showing: {mapPeriodLabel}</span>
        </div>

        {/* Two Maps */}
        <div style={styles.mapsRow}>
          <div style={styles.mapCard}>
            <h2 style={styles.mapTitle}>
              Negros Island Region
              <span style={styles.mapBadge}>REGIONAL</span>
            </h2>
            <p style={styles.mapSub}>63 LGUs across 3 provinces</p>
            <div style={styles.mapBox}>
              {nirGeo ? (
                <MapContainer
                  style={{ height: "100%", width: "100%" }}
                  bounds={[[9.0, 122.3], [11.0, 123.5]]}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  <GeoJSON key={`nir-${year}-${month}-${indicatorCode}`} data={nirGeo} style={styleFeature} onEachFeature={onEachFeature} />
                </MapContainer>
              ) : (
                <div style={styles.mapLoading}>Loading map…</div>
              )}
            </div>
            <div style={styles.legend}>
              <span style={{ ...styles.legendDot, background: "#16A34A" }} /> On Target (≥95%)
              <span style={{ ...styles.legendDot, background: "#EAB308", marginLeft: 12 }} /> Near (80–94%)
              <span style={{ ...styles.legendDot, background: "#DC2626", marginLeft: 12 }} /> Below (&lt;80%)
              <span style={{ ...styles.legendDot, background: "#CBD5E1", marginLeft: 12 }} /> No Data
            </div>
          </div>

          <div style={styles.mapCard}>
            <h2 style={styles.mapTitle}>
              Bacolod City
              <span style={{ ...styles.mapBadge, background: "#EDE9FE", color: "#6D28D9" }}>HUC</span>
            </h2>
            <p style={styles.mapSub}>61 barangays — Highly Urbanized City</p>
            <div style={styles.mapBox}>
              {hucGeo ? (
                <MapContainer
                  style={{ height: "100%", width: "100%" }}
                  bounds={[[10.55, 122.88], [10.75, 123.05]]}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                  <GeoJSON key={`huc-${year}-${month}-${indicatorCode}`} data={hucGeo} style={styleFeature} onEachFeature={onEachFeature} />
                </MapContainer>
              ) : (
                <div style={styles.mapLoading}>Loading map…</div>
              )}
            </div>
            <div style={styles.legend}>
              <span style={{ ...styles.legendDot, background: "#16A34A" }} /> On Target (≥95%)
              <span style={{ ...styles.legendDot, background: "#EAB308", marginLeft: 12 }} /> Near (80–94%)
              <span style={{ ...styles.legendDot, background: "#DC2626", marginLeft: 12 }} /> Below (&lt;80%)
              <span style={{ ...styles.legendDot, background: "#CBD5E1", marginLeft: 12 }} /> No Data
            </div>
          </div>
        </div>

        {/* NEEDS ATTENTION — scoped to the selected map indicator */}
        {attention && attention.reporting_count > 0 && (
          <div style={styles.attnPanel}>
            <div style={styles.attnHeader}>
              <h2 style={styles.attnTitle}>⚠ Needs Attention</h2>
              <span style={styles.attnSub}>
                {selectedIndicator.group
                  ? `${selectedIndicator.group} · ${selectedIndicator.label}`
                  : "Child Care — Immunization"}{" "}
                · {attention.period_label || mapPeriodLabel} ·{" "}
                {attention.reporting_count}/{attention.total_locations} LGUs reporting
              </span>
            </div>
            <div style={styles.attnGrid}>
              {/* Lowest coverage */}
              <div style={styles.attnCard}>
                <p style={styles.attnCardTitle}>Lowest coverage (below 80%)</p>
                {attention.bottom.length === 0 ? (
                  <p style={styles.attnEmpty}>None below target 🎉</p>
                ) : (
                  <ul style={styles.attnList}>
                    {attention.bottom.map((r) => (
                      <li key={r.location} style={styles.attnItem}>
                        <span>
                          {r.location}
                          {r.is_huc && <span style={styles.hucTag}>HUC</span>}
                        </span>
                        <span style={{ ...styles.attnPct, color: getCoverageColor(r.pct) }}>
                          {(r.pct * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Data-quality flags: over 100% */}
              <div style={styles.attnCard}>
                <p style={styles.attnCardTitle}>Data quality — over 100%</p>
                {attention.over_100.length === 0 ? (
                  <p style={styles.attnEmpty}>No values over 100% ✓</p>
                ) : (
                  <>
                    <ul style={styles.attnList}>
                      {attention.over_100.map((r) => (
                        <li key={r.location} style={styles.attnItem}>
                          <span>
                            {r.location}
                            {r.is_huc && <span style={styles.hucTag}>HUC</span>}
                          </span>
                          <span style={{ ...styles.attnPct, color: "#DC2626" }}>
                            {(r.pct * 100).toFixed(1)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p style={styles.attnHint}>
                      Over 100% usually means a data-entry error — check the source file.
                    </p>
                  </>
                )}
              </div>

              {/* Stopped reporting since prior period */}
              <div style={styles.attnCard}>
                <p style={styles.attnCardTitle}>
                  Stopped reporting
                  {attention.prior_period_label ? ` since ${attention.prior_period_label}` : ""}
                </p>
                {!attention.prior_period_label ? (
                  <p style={styles.attnEmpty}>No prior period to compare</p>
                ) : attention.dropped.length === 0 ? (
                  <p style={styles.attnEmpty}>All prior reporters still reporting ✓</p>
                ) : (
                  <ul style={styles.attnList}>
                    {attention.dropped.map((name) => (
                      <li key={name} style={styles.attnItem}>
                        <span>{name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "24px 32px", marginLeft: "240px" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  pageTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "22px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0" },
  pageSub: { fontSize: "13px", color: "#5A6A85", margin: 0 },
  filterWrap: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" },
  filterCaption: { fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" },
  filterRow: { display: "flex", gap: "16px", alignItems: "flex-end" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  filterLabel: { fontSize: "12px", fontWeight: "600", color: "#1F2A45" },
  select: { padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#ffffff", outline: "none" },
  selectDisabled: { backgroundColor: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" },
  periodTag: { marginLeft: "10px", padding: "2px 8px", backgroundColor: "#EFF6FF", color: "#2563EB", borderRadius: "4px", fontSize: "12px", fontWeight: 600 },
  errorBox: { backgroundColor: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  glanceNote: { fontSize: "12px", color: "#5A6A85", margin: "0 0 12px 0", fontStyle: "italic" },
  programGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginBottom: "24px" },
  programCard: { backgroundColor: "#fff", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  programName: { fontSize: "12px", fontWeight: "700", color: "#64748B", margin: 0, minHeight: "32px" },
  programValue: { fontSize: "28px", fontWeight: "800", margin: "6px 0 0" },
  programSub: { fontSize: "12px", color: "#475569", margin: "2px 0 0" },
  programNote: { fontSize: "11px", color: "#94A3B8", margin: "8px 0 0" },
  programCardActive: { boxShadow: "0 0 0 2px #0B4BAA, 0 2px 8px rgba(0,0,0,0.07)" },
  caret: { fontSize: "10px", color: "#0B4BAA", marginLeft: "6px" },
  subAreaPanel: { backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px 18px", marginBottom: "24px" },
  subAreaPanelTitle: { fontSize: "12px", fontWeight: "700", color: "#475569", margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: "0.5px" },
  subAreaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" },
  subAreaCard: { backgroundColor: "#fff", borderRadius: "8px", padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  subAreaName: { fontSize: "12px", fontWeight: "700", color: "#1F2A45", margin: "0 0 8px 0", display: "flex", alignItems: "center", justifyContent: "space-between" },
  subAreaCount: { fontSize: "10px", fontWeight: "700", color: "#64748B", backgroundColor: "#EEF2F7", borderRadius: "10px", padding: "1px 7px" },
  kpiList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" },
  kpiRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "5px 0", borderTop: "1px solid #F1F5F9" },
  kpiLabel: { fontSize: "12px", color: "#475569", lineHeight: 1.3 },
  kpiValue: { fontSize: "13px", fontWeight: "800", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  mapsHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" },
  mapsHeaderTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1F2A45", margin: 0 },
  attnPanel: { backgroundColor: "#fff", border: "1px solid #FCD9B6", borderRadius: "10px", padding: "18px 20px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  attnHeader: { display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "14px", flexWrap: "wrap" },
  attnTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "700", color: "#B45309", margin: 0 },
  attnSub: { fontSize: "12px", color: "#5A6A85" },
  attnGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" },
  attnCard: { backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "12px 14px" },
  attnCardTitle: { fontSize: "11px", fontWeight: "700", color: "#475569", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.4px" },
  attnList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" },
  attnItem: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#1F2A45" },
  attnPct: { fontWeight: "700", fontVariantNumeric: "tabular-nums" },
  attnEmpty: { fontSize: "12px", color: "#94A3B8", margin: 0 },
  attnHint: { fontSize: "11px", color: "#94A3B8", margin: "10px 0 0", lineHeight: 1.4 },
  hucTag: { marginLeft: "6px", backgroundColor: "#EDE9FE", color: "#7C3AED", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "3px" },
  mapsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },
  mapCard: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  mapTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "10px" },
  mapSub: { fontSize: "12px", color: "#5A6A85", margin: "0 0 12px 0" },
  mapBadge: { fontSize: "10px", fontWeight: "700", backgroundColor: "#DBEAFE", color: "#1D4ED8", padding: "3px 8px", borderRadius: "4px" },
  mapBox: { height: "380px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#F0F4F8" },
  mapLoading: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#5A6A85", fontSize: "14px" },
  legend: { marginTop: "10px", fontSize: "11px", color: "#5A6A85", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" },
  legendDot: { display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", marginRight: "4px" },
};
