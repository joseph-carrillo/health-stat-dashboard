import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function getCoverageColor(percent) {
  if (percent === null || percent === undefined) return "#CBD5E1";
  if (percent >= 95) return "#16A34A";
  if (percent >= 80) return "#EAB308";
  return "#DC2626";
}

const mockCoverage = {
  "Bacolod City (Capital)": 97,
  "Bago City": 88,
  "Cadiz City": 72,
  "Escalante City": 91,
  "Himamaylan City": 65,
  "Kabankalan City": 94,
  "La Carlota City": 83,
  "Sagay City": 78,
  "San Carlos City": 96,
  "Silay City": 89,
  "Talisay City": 71,
  "Victorias City": 85,
  "Binalbagan": 90,
  "Calatrava": 68,
  "Candoni": 74,
  "Cauayan": 82,
  "Enrique B. Magalona": 93,
  "Hinigaran": 87,
  "Hinobaan": 76,
  "Ilog": 95,
  "Isabela": 69,
  "La Castellana": 88,
  "Manapla": 92,
  "Moises Padilla": 73,
  "Murcia": 86,
  "Pontevedra": 91,
  "Pulupandan": 97,
  "Salvador Benedicto": 79,
  "San Enrique": 84,
  "Toboso": 88,
  "Valladolid": 93,
  "Dumaguete City": 96,
  "Bayawan City": 81,
  "Canlaon City": 70,
  "Guihulngan City": 85,
  "Tanjay City": 92,
  "Amlan": 77,
  "Ayungon": 83,
  "Bacong": 89,
  "Basay": 66,
  "Bindoy": 74,
  "Dauin": 91,
  "Jimalalud": 78,
  "La Libertad": 86,
  "Mabinay": 72,
  "Manjuyod": 88,
  "Pamplona": 94,
  "San Jose": 80,
  "Santa Catalina": 69,
  "Siaton": 75,
  "Sibulan": 93,
  "Tayasan": 87,
  "Valencia": 95,
  "Vallehermoso": 82,
  "Zamboanguita": 90,
  "Siquijor": 88,
  "Enrique Villanueva": 79,
  "Larena": 92,
  "Lazi": 85,
  "Maria": 91,
  "San Juan": 83,
};

export default function Overview() {
  const [nirGeo, setNirGeo] = useState(null);
  const [hucGeo, setHucGeo] = useState(null);

  useEffect(() => {
    fetch("/geojson/NIR.geojson")
      .then((r) => r.json())
      .then(setNirGeo)
      .catch(() => console.error("Could not load NIR.geojson"));

    fetch("/geojson/HUC.geojson")
      .then((r) => r.json())
      .then(setHucGeo)
      .catch(() => console.error("Could not load HUC.geojson"));
  }, []);

  function styleFeature(feature) {
    const name = feature.properties.ADM3_EN || "";
    return {
      fillColor: getCoverageColor(mockCoverage[name]),
      fillOpacity: 0.7,
      color: "#ffffff",
      weight: 1,
    };
  }

  function onEachFeature(feature, layer) {
    const name = feature.properties.ADM3_EN || "Unknown";
    const coverage = mockCoverage[name];
    const display = coverage !== undefined ? `${coverage}%` : "No data";
    layer.bindTooltip(`${name}: ${display}`, { sticky: true });
  }

  const ranking = Object.entries(mockCoverage).sort((a, b) => b[1] - a[1]);
  const maxValue = ranking[0]?.[1] || 100;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* Summary Cards */}
        <div style={styles.cardRow}>
          <div style={{ ...styles.card, borderTop: "4px solid #0B4BAA" }}>
            <p style={styles.cardLabel}>Total LGUs</p>
            <p style={styles.cardNumber}>63</p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #16A34A" }}>
            <p style={styles.cardLabel}>On Target (≥95%)</p>
            <p style={{ ...styles.cardNumber, color: "#16A34A" }}>
              {Object.values(mockCoverage).filter((v) => v >= 95).length}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #EAB308" }}>
            <p style={styles.cardLabel}>Near Target (80–94%)</p>
            <p style={{ ...styles.cardNumber, color: "#EAB308" }}>
              {Object.values(mockCoverage).filter((v) => v >= 80 && v < 95).length}
            </p>
          </div>
          <div style={{ ...styles.card, borderTop: "4px solid #DC2626" }}>
            <p style={styles.cardLabel}>Below Target (&lt;80%)</p>
            <p style={{ ...styles.cardNumber, color: "#DC2626" }}>
              {Object.values(mockCoverage).filter((v) => v < 80).length}
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
                  <GeoJSON data={nirGeo} style={styleFeature} onEachFeature={onEachFeature} />
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
                  <GeoJSON data={hucGeo} style={styleFeature} onEachFeature={onEachFeature} />
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
        </div>

        {/* Ranking */}
        <div style={styles.rankingCard}>
          <h2 style={styles.mapTitle}>LGU Ranking</h2>
          <p style={styles.mapSub}>LGUs ranked by coverage rate</p>
          <div style={styles.rankingList}>
            {ranking.map(([name, value], index) => (
              <div key={name} style={styles.rankingRow}>
                <span style={styles.rankNum}>{index + 1}</span>
                <span style={styles.rankName}>{name}</span>
                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.barFill,
                    width: `${(value / maxValue) * 100}%`,
                    backgroundColor: getCoverageColor(value),
                  }} />
                </div>
                <span style={{ ...styles.rankValue, color: getCoverageColor(value) }}>
                  {value}%
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
  body: { padding: "24px 32px", marginLeft: "240px"},
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