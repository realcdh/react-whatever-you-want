import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useStations } from "../hooks/useStations.ts";
import { useSettings } from "../context/SettingsContext.tsx";
import type { Station } from "../types/station.ts";

// 배열에서 랜덤으로 하나 뽑기
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

  // 선택한 호선에 맞는 역 목록 준비
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
    if (timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  // 시간이 다 되면 결과 페이지로 점수 전달
  useEffect(() => {
    if (timeLeft <= 0) navigate("/result", { state: { score } });
  }, [timeLeft, score, navigate]);

  if (loading) return <p>역 정보를 불러오는 중…</p>;
  if (error) return <p>오류: {error}</p>;
  if (words.length === 0) return <p>이 호선의 역 정보가 없습니다.</p>;
  if (!current) return <p>준비 중…</p>;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    if (current && val.trim() === current.name) {
      setScore((s) => s + 1);
      setInput("");
      setCurrent(pickRandom(words));
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && current) {
      const val = input.trim();
      if (val.length > 0 && val !== current.name) {
        setInput(""); // 오답이면 초기화
      }
    }
  }

  return (
    <section>
      <div>
        <span>SCORE: {score}</span>
        <span> · {timeLeft}s</span>
      </div>

      <div>
        <span>{current.line}</span> <strong>{current.name}</strong>
        <div>
          {current.nameEng} | {current.nameChn} | {current.nameJpn}
        </div>
      </div>

      <input
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        placeholder="Type Hurry!"
        aria-label="역 이름 입력"
      />
    </section>
  );
}

export default PlayPage;