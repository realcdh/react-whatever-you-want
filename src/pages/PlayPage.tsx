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
  // 뽑기용 시드(0 이상 1 미만 난수). 초기엔 역 목록 길이를 몰라 인덱스 대신 시드를 저장하고,
  // 나중에 Math.floor(pickSeed * 길이)로 실제 위치를 계산합니다. 이 값이 바뀌면 다음 역이 뽑힙니다.
  const [pickSeed, setPickSeed] = useState(() => Math.random());

  // 타이머는 "카운터를 1씩 빼는" 방식 대신 실제 시각(Date.now)으로 남은 시간을 계산합니다.
  // setTimeout/Interval은 정확한 간격을 보장하지 않아(백그라운드 스로틀링 포함) 드리프트가 쌓이는데,
  // 마감 시각(deadline)과의 차이를 매 틱 다시 계산하면 어긋나도 자동으로 보정됩니다.
  const deadlineRef = useRef<number | null>(null); // 종료 시각(ms). 일시정지 중엔 null.
  const remainingMsRef = useRef(60000); // 남은 시간(ms). 시작/재개 기준값.

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

  // 현재 역(파생 상태). pickSeed가 바뀌면 다음 역이 뽑힙니다.
  const current = useMemo(() => {
    if (words.length === 0) return null;
    return words[Math.floor(pickSeed * words.length)];
  }, [words, pickSeed]);

  // 타이머: 실제 시각 기준으로 남은 시간을 계산 → 드리프트·백그라운드 스로틀링에도 자체 보정
  useEffect(() => {
    if (loading || error || paused) return; // 로딩·오류·일시정지 중엔 정지

    // 이 구간(플레이)에 진입할 때, 남은 시간 기준으로 마감 시각을 확정
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
      // 일시정지/이탈 시 남은 시간을 저장하고 마감 시각 해제 → 재개 시 이어서 계산
      remainingMsRef.current = Math.max(0, deadline - Date.now());
      deadlineRef.current = null;
    };
  }, [loading, error, paused]);

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

  // role="status"/"alert"로 현재 상태를 스크린리더에도 전달하고, 오류 시 재시도 경로 제공
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
      setPickSeed(Math.random()); // 다음 역
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
    setPickSeed(Math.random());
    remainingMsRef.current = 60000; // 남은 시간 60초로 리셋
    deadlineRef.current = null; // 마감 시각 재설정 유도
    setPaused(false);
  }

  return (
    <section className="screen">
      <h1 className="sr-only">타이핑 게임 진행 중</h1>
      <div className="top-bar">
        {/* 점수는 변할 때만 조용히 낭독(polite), 시간은 매초 낭독되면 소음이라 label만 제공 */}
        <div aria-live="polite">SCORE: {score}</div>
        <div
          className={timeLeft <= 10 ? "time-warning" : ""}
          aria-label={`남은 시간 ${timeLeft}초`}
        >
          {timeLeft}s
        </div>
      </div>

      <div className="game-area">
        <div className="word-container">
          <StationNameplate station={current} />
        </div>
        <input
          key={pickSeed}
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
