// frontend/src/pages/analytics/Overview.jsx

import Navbar from "../../components/Navbar";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

// Try to match a GeoJSON ADM3_EN name to a DB location name.
// GeoJSON uses "Bago City", DB uses "City of Bago" — normalize both.
function normalizeName(name) {
  return (name || "")
    .trim()
    .toLowerCase()
    .replace(/^city of /, "")
    .replace(/ city$/, "")
    .replace(/ \(.*?\)$/, "")  // strip trailing parenthetical like "(HUC)" or "(Capital)"
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

export default function Overview() {
  const [nirGeo, setNirGeo] = useState(null);
  const [hucGeo, setHucGeo] = useState(null);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [coverageData, setCoverageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load GeoJSON files once
  useEffect(() => {
    fetch("/geojson/NIR.geojson").then((r) => r.json()).then(setNirGeo)
      .catch(() => console.error("Could not load NIR.geojson"));
    fetch("/geojson/HUC.geojson").then((r) => r.json()).then(setHucGeo)
      .catch(() => console.error("Could not load HUC.geojson"));
  }, []);

  // Fetch coverage from API whenever year/month changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    fetch(`/api/coverage-summary?year=${year}&month=${month}&indicator_code=CPAB_PCT`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setCoverageData(d.data || []))
      .catch(() => setError("Could not load coverage data."))
      .finally(() => setLoading(false));
  }, [year, month]);

  // Build lookup: normalized DB name → decimal ratio value
  const coverageLookup = useMemo(() => {
    const map = {};
    for (const entry of coverageData) {
      map[normalizeName(entry.location)] = entry.value;
    }
    return map;
  }, [coverageData]);

  // Summary counts
  const onTarget   = coverageData.filter((d) => d.value !== null && d.value >= 0.95).length;
  const nearTarget = coverageData.filter((d) => d.value !== null && d.value >= 0.80 && d.value < 0.95).length;
  const belowTarget= coverageData.filter((d) => d.value !== null && d.value < 0.80).length;
  const noData     = 63 - coverageData.filter((d) => d.value !== null).length;

  function getRatioForGeoName(geoName) {
    const key = normalizeName(geoName);
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

  // Ranking uses the raw DB data, sorted by value desc
  const ranking = [...coverageData]
    .filter((d) => d.value !== null)
    .sort((a, b) => b.value - a.value);
  const maxValue = ranking[0]?.value || 1;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Page header + period selector */}
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.pageTitle}>Analytics — Overview</h1>
            <p style={styles.pageSub}>CPAB / BCG / HepaB — Immunization Coverage</p>
          </div>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Month</label>
              <select style={styles.select} value={month}
                onChange={(e) => setMonth(Number(e.target.value))}>
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

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Summary Cards */}
        <div style={styles.cardRow}>
          <div style={{ ...styles.card, borderTop: "4px solid #0B4BAA" }}>
            <p style={styles.cardLabel}>Total LGUs</p>
            <p style={styles.cardNumber}>63</p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #16A34A" }}>
            <p style={styles.cardLabel}>On Target (≥95%)</p>
            <p style={{ ...styles.cardNumber, color: "#16A34A" }}>
              {loading ? "—" : onTarget}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #EAB308" }}>
            <p style={styles.cardLabel}>Near Target (80–94%)</p>
            <p style={{ ...styles.cardNumber, color: "#EAB308" }}>
              {loading ? "—" : nearTarget}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #DC2626" }}>
            <p style={styles.cardLabel}>Below Target (&lt;80%)</p>
            <p style={{ ...styles.cardNumber, color: "#DC2626" }}>
              {loading ? "—" : belowTarget}
            </p>
          </div>
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
                  <GeoJSON key={`nir-${year}-${month}`} data={nirGeo} style={styleFeature} onEachFeature={onEachFeature} />
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
                  <GeoJSON key={`huc-${year}-${month}`} data={hucGeo} style={styleFeature} onEachFeature={onEachFeature} />
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

        {/* Ranking */}
        <div style={styles.rankingCard}>
          <h2 style={styles.mapTitle}>LGU Ranking</h2>
          <p style={styles.mapSub}>
            {loading ? "Loading…"
              : ranking.length > 0
                ? `${ranking.length} LGUs with data — CPAB coverage, ${MONTHS.find(m => m.value === month)?.label} ${year}`
                : "No data available for this period. Upload data to see rankings."
            }
          </p>
          {ranking.length === 0 && !loading && (
            <div style={styles.noData}>
              <p>No coverage data uploaded yet for this period.</p>
            </div>
          )}
          <div style={styles.rankingList}>
            {ranking.map(({ location, value }, index) => (
              <div key={location} style={styles.rankingRow}>
                <span style={styles.rankNum}>{index + 1}</span>
                <span style={styles.rankName}>{location}</span>
                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.barFill,
                    width: `${(value / maxValue) * 100}%`,
                    backgroundColor: getCoverageColor(value),
                  }} />
                </div>
                <span style={{ ...styles.rankValue, color: getCoverageColor(value) }}>
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
            ))}
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
  filterRow: { display: "flex", gap: "16px", alignItems: "flex-end" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  filterLabel: { fontSize: "12px", fontWeight: "600", color: "#1F2A45" },
  select: { padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#ffffff", outline: "none" },
  errorBox: { backgroundColor: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" },
  cardRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  cardLabel: { fontSize: "11px", color: "#5A6A85", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  cardNumber: { fontSize: "32px", fontWeight: "700", color: "#1F2A45", margin: 0, fontFamily: "'Montserrat', sans-serif" },
  mapsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },
  mapCard: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  mapTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1F2A45", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "10px" },
  mapSub: { fontSize: "12px", color: "#5A6A85", margin: "0 0 12px 0" },
  mapBadge: { fontSize: "10px", fontWeight: "700", backgroundColor: "#DBEAFE", color: "#1D4ED8", padding: "3px 8px", borderRadius: "4px" },
  mapBox: { height: "380px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#F0F4F8" },
  mapLoading: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#5A6A85", fontSize: "14px" },
  legend: { marginTop: "10px", fontSize: "11px", color: "#5A6A85", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" },
  legendDot: { display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", marginRight: "4px" },
  rankingCard: { backgroundColor: "#ffffff", borderRadius: "10px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
  noData: { padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: "13px" },
  rankingList: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" },
  rankingRow: { display: "grid", gridTemplateColumns: "28px 200px 1fr 60px", alignItems: "center", gap: "10px" },
  rankNum: { fontSize: "12px", color: "#94A3B8", fontWeight: "700", textAlign: "right" },
  rankName: { fontSize: "13px", color: "#1F2A45", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  barTrack: { backgroundColor: "#F0F4F8", borderRadius: "4px", height: "14px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  rankValue: { fontSize: "12px", fontWeight: "700", textAlign: "right" },
};
