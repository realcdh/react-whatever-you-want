import { useNavigate } from "react-router";
import { useSettings } from "../context/SettingsContext.tsx";

const REGIONS = ["수도권 전체", "서울 지역", "경기/인천"];
const LINES = ["전체 호선", "1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선"];

function HomePage() {
  const { region, line, setRegion, setLine } = useSettings();
  const navigate = useNavigate();

  // 목록에서 다음 항목으로 순환
  function cycle(list: string[], current: string): string {
    const nextIndex = (list.indexOf(current) + 1) % list.length;
    return list[nextIndex];
  }

  return (
    <section>
      <h1>Typing Metro</h1>

      <button onClick={() => navigate("/play")}>시작</button>
      <button onClick={() => setRegion(cycle(REGIONS, region))}>
        지역 : {region}
      </button>
      <button onClick={() => setLine(cycle(LINES, line))}>
        호선 : {line}
      </button>
    </section>
  );
}

export default HomePage;