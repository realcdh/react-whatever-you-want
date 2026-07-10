import { useState } from "react";
import { useStations } from "../hooks/useStations.ts";
import { getLineColor } from "../constants/subwayColors.ts";

function StationsPage() {
  const { stations, loading, error } = useStations();
  const [selectedLine, setSelectedLine] = useState("전체");

  if (loading) return <p style={{ padding: "5rem" }}>불러오는 중…</p>;
  if (error) return <p style={{ padding: "5rem" }}>오류: {error}</p>;

  const lines = ["전체", ...new Set(stations.map((s) => s.line))];
  const visible =
    selectedLine === "전체" ? stations : stations.filter((s) => s.line === selectedLine);

  return (
    <section className="stations">
      <h1>역 정보</h1>

      <div className="filters">
        {lines.map((line) => {
          const color = line === "전체" ? "#568eba" : getLineColor(line);
          const active = selectedLine === line;
          return (
            <button
              key={line}
              onClick={() => setSelectedLine(line)}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                border: "2px solid #333",
                background: active ? color : "#fff",
                color: active ? "#fff" : "#333",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {line}
            </button>
          );
        })}
      </div>

      <p>{visible.length}개 역</p>

      <ul>
        {visible.map((s) => (
          <li key={s.id}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: getLineColor(s.line),
                marginRight: 8,
              }}
            />
            {s.line} · {s.name} ({s.nameEng})
          </li>
        ))}
      </ul>
    </section>
  );
}

export default StationsPage;