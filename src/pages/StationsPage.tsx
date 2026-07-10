import { useState } from "react";
import { useStations } from "../hooks/useStations.ts";

function StationsPage() {
  const { stations, loading, error } = useStations();
  const [selectedLine, setSelectedLine] = useState("전체");

  if (loading) return <p>불러오는 중…</p>;
  if (error) return <p>오류: {error}</p>;

  // 중복 없는 호선 목록
  const lines = ["전체", ...new Set(stations.map((s) => s.line))];

  // 선택된 호선으로 필터
  const visible =
    selectedLine === "전체"
      ? stations
      : stations.filter((s) => s.line === selectedLine);

  return (
    <section>
      <h1>역 정보</h1>

      <div>
        {lines.map((line) => (
          <button key={line} onClick={() => setSelectedLine(line)}>
            {line}
          </button>
        ))}
      </div>

      <p>{visible.length}개 역</p>

      <ul>
        {visible.map((s) => (
          <li key={s.id}>
            {s.line} · {s.name} ({s.nameEng})
          </li>
        ))}
      </ul>
    </section>
  );
}

export default StationsPage;