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

// Initial sub-area selections: each sub-area's default flagship indicator.
const CC_DEFAULT_SEL = Object.fromEntries(
  CHILD_CARE_SUBAREAS.map((s) => [s.key, s.default])
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [programsData, setProgramsData] = useState(null);
  // Child Care expandable card: open state, per-sub-area indicator selection,
  // and per-sub-area regional rollups keyed by sub-area key.
  const [ccExpanded, setCcExpanded] = useState(false);
  const [ccSel, setCcSel] = useState(CC_DEFAULT_SEL);
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

  // Child Care sub-area rollups: when expanded, fetch each selected indicator's
  // regional summary (frequency-agnostic — resolves each indicator's latest period).
  useEffect(() => {
    if (!ccExpanded) return;
    const token = localStorage.getItem("token");
    let cancelled = false;
    Promise.all(
      CHILD_CARE_SUBAREAS.map((s) => {
        const code = ccSel[s.key];
        return fetch(
          `/api/overview/indicator?indicator_code=${encodeURIComponent(code)}&year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => [s.key, d])
          .catch(() => [s.key, null]);
      })
    ).then((entries) => {
      if (!cancelled) setCcData(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [ccExpanded, ccSel, year]);

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

            {/* Child Care sub-area detail — expandable */}
            {ccExpanded && (
              <div style={styles.subAreaPanel}>
                <p style={styles.subAreaPanelTitle}>
                  Child Care sub-areas · pick an indicator per area
                </p>
                <div style={styles.subAreaGrid}>
                  {CHILD_CARE_SUBAREAS.map((s) => {
                    const d = ccData[s.key];
                    const ratio = d ? d.regional_pct : null;
                    const pct = ratio == null ? null : Math.round(ratio * 1000) / 10;
                    const color = getCoverageColor(ratio);
                    return (
                      <div key={s.key} style={{ ...styles.subAreaCard, borderTop: `4px solid ${color}` }}>
                        <p style={styles.subAreaName}>{s.label}</p>
                        <select
                          style={styles.subAreaSelect}
                          value={ccSel[s.key]}
                          onChange={(e) =>
                            setCcSel((prev) => ({ ...prev, [s.key]: e.target.value }))
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          {s.options.map((o) => (
                            <option key={o.code} value={o.code}>{o.label}</option>
                          ))}
                        </select>
                        <p
                          style={{ ...styles.subAreaValue, color: pct == null ? "#94A3B8" : "#0F172A" }}
                          onClick={() => pct != null && handleSubAreaDrill(ccSel[s.key])}
                          title={pct != null ? "View on the map" : ""}
                        >
                          {pct == null ? "—" : `${pct}%`}
                        </p>
                        {d == null ? (
                          <p style={styles.subAreaNote}>loading…</p>
                        ) : pct == null ? (
                          <p style={styles.subAreaNote}>no data yet</p>
                        ) : (
                          <p style={styles.subAreaNote}>
                            {d.period_label ? `${d.period_label} · ` : ""}
                            {d.locations_reporting}/{d.total_locations} LGUs · ▲{d.on_target} · ⛔{d.below_target}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
  subAreaName: { fontSize: "12px", fontWeight: "700", color: "#1F2A45", margin: "0 0 8px 0" },
  subAreaSelect: { width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", color: "#1F2A45", backgroundColor: "#fff", outline: "none" },
  subAreaValue: { fontSize: "24px", fontWeight: "800", margin: "8px 0 0", cursor: "pointer" },
  subAreaNote: { fontSize: "11px", color: "#94A3B8", margin: "6px 0 0" },
  mapsHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" },
  mapsHeaderTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1F2A45", margin: 0 },
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
