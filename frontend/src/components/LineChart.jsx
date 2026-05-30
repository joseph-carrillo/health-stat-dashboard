// frontend/src/components/LineChart.jsx
// Lightweight dependency-free SVG line chart for monthly trends.

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function LineChart({
  series = [],
  height = 260,
  color = "#0B4BAA",
  unit = "%",
  maxOverride = null,
}) {
  const width = 720;
  const padding = { top: 20, right: 20, bottom: 30, left: 44 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const points = series.filter((p) => p.value !== null && p.value !== undefined);
  const values = points.map((p) => p.value);
  const dataMax = values.length ? Math.max(...values) : 100;
  const maxY = maxOverride ?? Math.max(10, Math.ceil(dataMax / 10) * 10);

  const n = series.length || 12;
  const x = (i) => padding.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => padding.top + innerH - (v / maxY) * innerH;

  const path = series
    .map((p, i) => {
      if (p.value === null || p.value === undefined) return null;
      return `${x(i)},${y(p.value)}`;
    })
    .filter(Boolean);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const val = Math.round(maxY * f);
    return { val, yPos: padding.top + innerH - f * innerH };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={padding.left} y1={g.yPos} x2={width - padding.right} y2={g.yPos} stroke="#E2E8F0" strokeWidth="1" />
          <text x={padding.left - 8} y={g.yPos + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
            {g.val}
          </text>
        </g>
      ))}

      {series.map((p, i) => (
        <text key={i} x={x(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#94A3B8">
          {MONTH_LABELS[i]}
        </text>
      ))}

      {path.length > 1 && (
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={path.join(" ")} strokeLinejoin="round" strokeLinecap="round" />
      )}

      {series.map((p, i) =>
        p.value === null || p.value === undefined ? null : (
          <g key={`pt-${i}`}>
            <circle cx={x(i)} cy={y(p.value)} r="3.5" fill={color} />
            <title>{`Month ${p.month}: ${p.value}${unit}`}</title>
          </g>
        )
      )}
    </svg>
  );
}
