import { useRef, useEffect } from "react";
import { useLocation } from "react-router";
import { subwayColors } from "../constants/subwayColors.ts";
import type { MetroLine, Train } from "../utils/metroMap.ts";
import { createLines, createTrains, drawLine, drawTrain } from "../utils/metroMap.ts";

function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pathname } = useLocation();
  const playing = pathname === "/play";

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    // 이 아래로는 null 이 아님이 확정됩니다(클로저 안에서도 유지).
    const canvas = canvasEl;
    const ctx = context;

    let lines: MetroLine[] = [];
    let trains: Train[] = [];
    let rafId = 0;
    const colors = Object.values(subwayColors);

    // 화면 크기에 맞춰 노선·열차 데이터 새로 생성
    function initCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lines = createLines(canvas.width, canvas.height, colors);
      trains = createTrains(lines.length);
    }

    // 매 프레임: 지우고 → 노선들 → 열차들 그리기
    function renderFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      lines.forEach((line) => drawLine(ctx, line));
      trains.forEach((train) => drawTrain(ctx, lines[train.lineIndex], train));
      rafId = requestAnimationFrame(renderFrame);
    }

    initCanvas();
    renderFrame();
    window.addEventListener("resize", initCanvas);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", initCanvas);
    };
  }, []);

  // 원본 #bg-wrapper: 게임 중(/play)에는 더 강하게 블러 처리
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        filter: playing ? "blur(16px)" : "blur(6px)",
        opacity: playing ? 0.4 : 0.7,
        transition: "filter 1s ease-in-out, opacity 1s ease-in-out",
        pointerEvents: "none",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

export default BackgroundCanvas;
