import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useStations } from "../hooks/useStations.ts";
import { useSettings } from "../context/SettingsContext.tsx";
import type { Station } from "../types/station.ts";
import StationNameplate from "../components/StationNameplate.tsx";

function pickRandom(pool: Station[]): Station {
  const i = Math.floor(Math.random() * pool.length);
  return pool[i];
}

function PlayPage() {
  const { stations, loading, error } = useStations();
  const { line } = useSettings();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [current, setCurrent] = useState<Station | null>(null);
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);

  const words = useMemo(() => {
    const pool =
      line === "전체 호선" ? stations : stations.filter((s) => s.line === line);
    const seen = new Set<string>();
    return pool.filter((s) => {
      if (seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    });
  }, [stations, line]);

  useEffect(() => {
    if (words.length > 0) setCurrent(pickRandom(words));
  }, [words]);

  // 1초마다 시간 감소
  useEffect(() => {
    if (timeLeft <= 0 || paused) return;
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused]);

  useEffect(() => {
    if (timeLeft <= 0) navigate("/result", { state: { score } });
  }, [timeLeft, score, navigate]);

  // ESC 키로 일시정지 토글
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPaused((p) => !p);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) return <p>역 정보를 불러오는 중…</p>;
  if (error) return <p>오류: {error}</p>;
  if (words.length === 0) return <p>이 호선의 역 정보가 없습니다.</p>;
  if (!current) return <p>준비 중…</p>;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (paused) return;
    const val = e.target.value;
    setInput(val);
    if (current && val.trim() === current.name) {
      setScore((s) => s + 1);
      setInput("");
      setCurrent(pickRandom(words));
    }
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && current) {
      const val = input.trim();
      if (val.length > 0 && val !== current.name) {
        setInput("");
      }
    }
  }

  function restart() {
    setScore(0);
    setTimeLeft(60);
    setInput("");
    setCurrent(pickRandom(words));
    setPaused(false);
  }

  return (
    <section className="screen">
      <div className="hud">
        <span>SCORE: {score}</span>
        <span className={timeLeft <= 10 ? "time-warning" : ""}>{timeLeft}s</span>
      </div>

      <StationNameplate station={current} />

      <input
        className="type-input"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        placeholder="역 이름을 입력하세요"
        aria-label="역 이름 입력"
      />

      {paused && (
        <div className="esc-overlay" role="dialog" aria-label="일시정지 메뉴">
          <h2>일시정지</h2>
          <button className="metro-btn" onClick={() => setPaused(false)}>
            <span className="arrow">➔</span>
            <span className="label">계속하기</span>
          </button>
          <button className="metro-btn" onClick={restart}>
            <span className="arrow">➔</span>
            <span className="label">다시 시작</span>
          </button>
          <button className="metro-btn" onClick={() => navigate("/")}>
            <span className="arrow">➔</span>
            <span className="label">메인 화면으로</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default PlayPage;