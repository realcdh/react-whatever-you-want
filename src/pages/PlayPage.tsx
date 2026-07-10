import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useStations } from "../hooks/useStations.ts";
import { useSettings } from "../context/SettingsContext.tsx";
import type { Station } from "../types/station.ts";
import StationNameplate from "../components/StationNameplate.tsx";

function PlayPage() {
  const { stations, loading, error } = useStations();
  const { line } = useSettings();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  // 0~1 사이 난수. 이 값 + 단어 풀로 현재 역을 "결정적으로" 고릅니다.
  const [pickIndex, setPickIndex] = useState(() => Math.random());

  // 선택한 호선으로 단어 풀 만들기 (중복 역명 제거)
  const words = useMemo(() => {
    const pool =
      line === "전체 호선" ? stations : stations.filter((s) => s.line === line);
    const seen = new Set<string>();
    const result: Station[] = [];
    for (const s of pool) {
      if (!seen.has(s.name)) {
        seen.add(s.name);
        result.push(s);
      }
    }
    return result;
  }, [stations, line]);

  // 현재 역(파생 상태). pickIndex가 바뀌면 다음 역이 뽑힙니다.
  const current = useMemo(() => {
    if (words.length === 0) return null;
    return words[Math.floor(pickIndex * words.length)];
  }, [words, pickIndex]);

  // 1초마다 시간 감소 (0이거나 일시정지면 멈춤)
  useEffect(() => {
    if (timeLeft <= 0 || paused) return;
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused]);

  // 시간이 다 되면 결과 페이지로 점수 전달
  useEffect(() => {
    if (timeLeft <= 0) navigate("/result", { state: { score } });
  }, [timeLeft, score, navigate]);

  // ESC로 일시정지 토글 (창 전체에서 감지)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPaused((p) => !p);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) return <section className="screen"><p>역 정보를 불러오는 중…</p></section>;
  if (error) return <section className="screen"><p>오류: {error}</p></section>;
  if (words.length === 0) return <section className="screen"><p>이 호선의 역 정보가 없습니다.</p></section>;
  if (!current) return <section className="screen"><p>준비 중…</p></section>;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (paused) return;
    const val = e.target.value;
    setInput(val);
    if (current && val.trim() === current.name) {
      setScore((s) => s + 1);
      setInput("");
      setPickIndex(Math.random()); // 다음 역
    }
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && current) {
      const val = input.trim();
      if (val.length > 0 && val !== current.name) setInput(""); // 오답이면 초기화
    }
  }

  function restart() {
    setScore(0);
    setTimeLeft(60);
    setInput("");
    setPickIndex(Math.random());
    setPaused(false);
  }

  return (
    <section className="screen">
      <div className="top-bar">
        <div>SCORE: {score}</div>
        <div className={timeLeft <= 10 ? "time-warning" : ""}>{timeLeft}s</div>
      </div>

      <div className="game-area">
        <div className="word-container">
          <StationNameplate station={current} />
        </div>
        <input
          className="type-input"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          placeholder="Type Hurry!"
          aria-label="역 이름 입력"
        />
      </div>

      {paused && (
        <div className="esc-overlay" role="dialog" aria-label="일시정지 메뉴">
          <div className="esc-hub">
            <div className="esc-line1" />
            <div className="esc-line2" />
            <div className="esc-orbit">
              <div className="esc-train1" />
              <div className="esc-train2" />
            </div>
            <div className="esc-center" />
          </div>
          <h2 className="esc-title">일시정지</h2>
          <div className="esc-menu-list">
            <button className="metro-btn" onClick={() => setPaused(false)}>
              <span className="arrow">➔</span>
              <span className="label">계속하기</span>
            </button>
            <button className="metro-btn" onClick={restart}>
              <span className="arrow rot135neg">➔</span>
              <span className="label">다시 시작</span>
            </button>
            <button className="metro-btn" onClick={() => navigate("/")}>
              <span className="arrow rot180">➔</span>
              <span className="label">메인 화면으로</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default PlayPage;
