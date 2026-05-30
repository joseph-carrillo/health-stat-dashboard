// frontend/src/pages/analytics/Overview.jsx
// Regional overview: choropleth maps + LGU ranking driven by live coverage.

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/Navbar";
import { getCoverage, getIndicators } from "../../services/api";
import { MONTHS, YEARS, coverageColor } from "../../services/constants";

const DEFAULT_INDICATOR = "CPAB_PCT";

export default function Overview() {
  const [nirGeo, setNirGeo] = useState(null);
  const [hucGeo, setHucGeo] = useState(null);

  const [indicators, setIndicators] = useState([]);
  const [indicatorCode, setIndicatorCode] = useState(DEFAULT_INDICATOR);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);

  const [coverageByName, setCoverageByName] = useState({});
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load GeoJSON once.
  useEffect(() => {
    fetch("/geojson/NIR.geojson").then((r) => r.json()).then(setNirGeo).catch(() => {});
    fetch("/geojson/HUC.geojson").then((r) => r.json()).then(setHucGeo).catch(() => {});
  }, []);

  // Load the list of percentage indicators for the selector.
  useEffect(() => {
    getIndicators()
      .then((res) => {
        const pct = (res.indicators || []).filter(
          (i) => i.formula_type === "percentage"
        );
        setIndicators(pct);
        if (!pct.find((i) => i.code === DEFAULT_INDICATOR) && pct[0]) {
          setIndicatorCode(pct[0].code);
        }
      })
      .catch(() => {});
  }, []);

  // Load coverage whenever the selection changes.
  useEffect(() => {
    if (!indicatorCode) return;
    let active = true;
    setLoading(true);
    getCoverage({
      indicator_code: indicatorCode,
      year,
      period_type: "monthly",
      period_value: month,
    })
      .then((res) => {
        if (!active) return;
        const byName = {};
        (res.data || []).forEach((d) => {
          byName[d.location] = d.value;
        });
        setCoverageByName(byName);
        const ranked = (res.data || [])
          .filter((d) => d.value !== null)
          .sort((a, b) => b.value - a.value);
        setRanking(ranked);
      })
      .catch(() => {
        if (active) {
          setCoverageByName({});
          setRanking([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [indicatorCode, year, month]);

  function styleFeature(feature) {
    const name = feature.properties.ADM3_EN || "";
    return {
      fillColor: coverageColor(coverageByName[name]),
      fillOpacity: 0.7,
      color: "#ffffff",
      weight: 1,
    };
  }

  function onEachFeature(feature, layer) {
    const name = feature.properties.ADM3_EN || "Unknown";
    const coverage = coverageByName[name];
    const display = coverage !== undefined ? `${coverage}%` : "No data";
    layer.bindTooltip(`${name}: ${display}`, { sticky: true });
  }

  const values = Object.values(coverageByName).filter((v) => v !== null && v !== undefined);
  const onTarget = values.filter((v) => v >= 95).length;
  const nearTarget = values.filter((v) => v >= 80 && v < 95).length;
  const belowTarget = values.filter((v) => v < 80).length;
  const maxValue = ranking[0]?.value || 100;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>
        {/* Filters */}
        <div style={styles.filterBar}>
          <select
            style={styles.select}
            value={indicatorCode}
            onChange={(e) => setIndicatorCode(e.target.value)}
          >
            {indicators.map((i) => (
              <option key={i.code} value={i.code}>
                {i.name}
              </option>
            ))}
          </select>
          <select style={styles.select} value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select style={styles.select} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {loading && <span style={styles.loadingTag}>Loading...</span>}
        </div>

        {/* Summary Cards */}
        <div style={styles.cardRow}>
          <Card label="LGUs With Data" value={values.length} border="#0B4BAA" />
          <Card label="On Target (≥95%)" value={onTarget} border="#16A34A" color="#16A34A" />
          <Card label="Near Target (80–94%)" value={nearTarget} border="#EAB308" color="#EAB308" />
          <Card label="Below Target (<80%)" value={belowTarget} border="#DC2626" color="#DC2626" />
        </div>

        {/* Maps */}
        <div style={styles.mapsRow}>
          <MapCard title="Negros Island Region" badge="REGIONAL" sub="LGUs across the region" geo={nirGeo} bounds={[[9.0, 122.3], [11.0, 123.5]]} styleFeature={styleFeature} onEachFeature={onEachFeature} />
          <MapCard title="Bacolod City" badge="HUC" badgeColors={{ bg: "#EDE9FE", color: "#6D28D9" }} sub="Highly Urbanized City — barangays" geo={hucGeo} bounds={[[10.55, 122.88], [10.75, 123.05]]} styleFeature={styleFeature} onEachFeature={onEachFeature} />
        </div>

        {/* Ranking */}
        <div style={styles.rankingCard}>
          <h2 style={styles.mapTitle}>LGU Ranking</h2>
          <p style={styles.mapSub}>LGUs ranked by coverage rate</p>
          <div style={styles.rankingList}>
            {ranking.length === 0 && <p style={styles.mapSub}>No data for this selection.</p>}
            {ranking.map((row, index) => (
              <div key={row.psgc} style={styles.rankingRow}>
                <span style={styles.rankNum}>{index + 1}</span>
                <span style={styles.rankName}>{row.location}</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${(row.value / maxValue) * 100}%`, backgroundColor: coverageColor(row.value) }} />
                </div>
                <span style={{ ...styles.rankValue, color: coverageColor(row.value) }}>
                  {row.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, border, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${border}` }}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardNumber, color: color || "#1F2A45" }}>{value}</p>
    </div>
  );
}

function MapCard({ title, badge, badgeColors, sub, geo, bounds, styleFeature, onEachFeature }) {
  const badgeStyle = badgeColors
    ? { ...styles.mapBadge, background: badgeColors.bg, color: badgeColors.color }
    : styles.mapBadge;
  return (
    <div style={styles.mapCard}>
      <h2 style={styles.mapTitle}>
        {title}
        <span style={badgeStyle}>{badge}</span>
      </h2>
      <p style={styles.mapSub}>{sub}</p>
      <div style={styles.mapBox}>
        {geo ? (
          <MapContainer style={{ height: "100%", width: "100%" }} bounds={bounds} scrollWheelZoom={false} key={JSON.stringify(bounds)}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            <GeoJSON data={geo} style={styleFeature} onEachFeature={onEachFeature} />
          </MapContainer>
        ) : (
          <div style={styles.mapLoading}>Loading map...</div>
        )}
      </div>
      <div style={styles.legend}>
        <span style={{ ...styles.legendDot, background: "#16A34A" }} /> On Target (≥95%)
        <span style={{ ...styles.legendDot, background: "#EAB308", marginLeft: 12 }} /> Near (80–94%)
        <span style={{ ...styles.legendDot, background: "#DC2626", marginLeft: 12 }} /> Below (&lt;80%)
        <span style={{ ...styles.legendDot, background: "#CBD5E1", marginLeft: 12 }} /> No Data
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#F0F4F8", fontFamily: "'Barlow', sans-serif" },
  body: { padding: "24px 32px", marginLeft: "240px" },
  filterBar: { display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" },
  select: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#1F2A45", backgroundColor: "#fff", outline: "none", minWidth: "160px" },
  loadingTag: { fontSize: "12px", color: "#5A6A85" },
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
  rankingList: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" },
  rankingRow: { display: "grid", gridTemplateColumns: "28px 180px 1fr 52px", alignItems: "center", gap: "10px" },
  rankNum: { fontSize: "12px", color: "#94A3B8", fontWeight: "700", textAlign: "right" },
  rankName: { fontSize: "13px", color: "#1F2A45", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  barTrack: { backgroundColor: "#F0F4F8", borderRadius: "4px", height: "14px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
  rankValue: { fontSize: "12px", fontWeight: "700", textAlign: "right" },
};
