import { useState } from "react";
import { useStations } from "../hooks/useStations.ts";
import { getLineColor } from "../constants/subwayColors.ts";

function StationsPage() {
  const { stations, loading, error, retry } = useStations();
  const [selectedLine, setSelectedLine] = useState("전체");

  // role="status": 스크린리더에게 방해되지 않게 상태 변화를 알림
  if (loading)
    return (
      <section className="stations">
        <p className="status" role="status">역 정보를 불러오는 중…</p>
      </section>
    );
  // role="alert": 오류는 즉시 알리고, 재시도 버튼으로 복구 경로 제공
  if (error)
    return (
      <section className="stations">
        <div className="status" role="alert">
          <p>역 정보를 불러오지 못했어요: {error}</p>
          <button type="button" className="retry" onClick={retry}>
            다시 시도
          </button>
        </div>
      </section>
    );

  const lines = ["전체", ...new Set(stations.map((s) => s.line))];
  const visible =
    selectedLine === "전체" ? stations : stations.filter((s) => s.line === selectedLine);

  return (
    <section className="stations">
      <h1>역 정보</h1>

      <div className="filters" role="group" aria-label="호선 필터">
        {lines.map((line) => {
          const color = line === "전체" ? "#568eba" : getLineColor(line);
          const active = selectedLine === line;
          return (
            <button
              key={line}
              type="button"
              aria-pressed={active}
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

      <p aria-live="polite">{visible.length}개 역</p>

      <ul>
        {visible.map((s) => (
          <li key={s.id}>
            <span
              aria-hidden="true"
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
