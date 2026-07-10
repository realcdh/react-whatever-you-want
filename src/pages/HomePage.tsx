import { useNavigate } from "react-router";
import { useSettings } from "../context/SettingsContext.tsx";

const REGIONS = ["수도권 전체", "서울 지역", "경기/인천"];
const LINES = ["전체 호선", "1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선"];

function HomePage() {
  const { region, line, setRegion, setLine } = useSettings();
  const navigate = useNavigate();

  function cycle(list: string[], current: string): string {
    const nextIndex = (list.indexOf(current) + 1) % list.length;
    return list[nextIndex];
  }

  return (
    <section className="screen" style={{ alignItems: "flex-start", paddingLeft: "min(8vw, 6rem)" }}>
      <h1 className="title">Typing Metro</h1>

      <button className="metro-btn" onClick={() => navigate("/play")}>
        <span className="arrow">➔</span>
        <span className="label">시작</span>
      </button>
      <button className="metro-btn" onClick={() => setRegion(cycle(REGIONS, region))}>
        <span className="arrow">➔</span>
        <span className="label">지역 : {region}</span>
      </button>
      <button className="metro-btn" onClick={() => setLine(cycle(LINES, line))}>
        <span className="arrow">➔</span>
        <span className="label">호선 : {line}</span>
      </button>
    </section>
  );
}

export default HomePage;