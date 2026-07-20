import { useState, useEffect, useMemo, useRef } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useStations } from "../hooks/useStations.ts";
import { useSettings } from "../context/SettingsContext.tsx";
import type { Station } from "../types/station.ts";
import StationNameplate from "../components/StationNameplate.tsx";

function PlayPage() {
  const { stations, loading, error, retry } = useStations();
  const { line } = useSettings();
  const navigate = useNavigate();

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  const [pickSeed, setPickSeed] = useState(() => Math.random());

  const deadlineRef = useRef<number | null>(null);
  const remainingMsRef = useRef(60000);
  const inputRef = useRef<HTMLInputElement>(null);
  const resumeBtnRef = useRef<HTMLButtonElement>(null);

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

  const current = useMemo(() => {
    if (words.length === 0) return null;
    return words[Math.floor(pickSeed * words.length)];
  }, [words, pickSeed]);

  useEffect(() => {
    if (loading || error || paused) return;
    let deadline = deadlineRef.current;
    if (deadline === null) {
      deadline = Date.now() + remainingMsRef.current;
      deadlineRef.current = deadline;
    }

    const id = setInterval(() => {
      const remainingMs = Math.max(0, deadline - Date.now());
      setTimeLeft(Math.ceil(remainingMs / 1000));
      if (remainingMs <= 0) clearInterval(id);
    }, 200);

    return () => {
      clearInterval(id);
      remainingMsRef.current = Math.max(0, deadline - Date.now());
      deadlineRef.current = null;
    };
  }, [loading, error, paused]);

  useEffect(() => {
    if (timeLeft <= 0) navigate("/result", { state: { score } });
  }, [timeLeft, score, navigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPaused((p) => !p);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (paused) resumeBtnRef.current?.focus();
    else inputRef.current?.focus();
  }, [paused]);

  if (loading)
    return (
      <section className="screen">
        <p className="status" role="status">역 정보를 불러오는 중…</p>
      </section>
    );
  if (error)
    return (
      <section className="screen">
        <div className="status" role="alert">
          <p>역 정보를 불러오지 못했어요: {error}</p>
          <button type="button" className="retry" onClick={retry}>
            다시 시도
          </button>
        </div>
      </section>
    );
  if (words.length === 0)
    return (
      <section className="screen">
        <p className="status" role="status">이 호선의 역 정보가 없습니다.</p>
      </section>
    );
  if (!current)
    return (
      <section className="screen">
        <p className="status" role="status">준비 중…</p>
      </section>
    );

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (paused) return;
    const val = e.target.value;
    setInput(val);
    if (current && val.trim() === current.name) {
      setScore((s) => s + 1);
      setInput("");
      setPickSeed(Math.random());
    }
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && current) {
      const val = input.trim();
      if (val.length > 0 && val !== current.name) setInput("");
    }
  }

  function restart() {
    setScore(0);
    setTimeLeft(60);
    setInput("");
    setPickSeed(Math.random());
    remainingMsRef.current = 60000;
    deadlineRef.current = null;
    setPaused(false);
  }

  return (
    <section className="screen">
      <h1 className="sr-only">타이핑 게임 진행 중</h1>
      <div className="top-bar">
        <div className="hud-left">
          <button
            type="button"
            className="pause-btn"
            onClick={() => setPaused(true)}
            aria-label="일시정지"
          >
            ❚❚
          </button>
          <span aria-live="polite">SCORE: {score}</span>
        </div>
        <div
          role="timer"
          className={timeLeft <= 10 ? "time-warning" : ""}
          aria-label={`남은 시간 ${timeLeft}초`}
        >
          {timeLeft}s
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {timeLeft <= 10 && timeLeft > 0 ? "10초 남았습니다" : ""}
      </div>

      <div className="game-area">
        <div className="word-container">
          <StationNameplate station={current} />
        </div>
        <input
          key={pickSeed}
          ref={inputRef}
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
        <div className="esc-overlay" role="dialog" aria-modal="true" aria-label="일시정지 메뉴">
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
            <button ref={resumeBtnRef} className="metro-btn" onClick={() => setPaused(false)}>
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
