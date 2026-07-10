import { useRef, useEffect } from "react";
import { subwayColors } from "../constants/subwayColors.ts";

type Point = { x: number; y: number };
type MetroLine = { color: string; points: Point[] };
type Train = {
  lineIndex: number;
  segment: number;
  progress: number;
  speed: number;
  direction: number;
};

function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let canvasW = 0;
    let canvasH = 0;
    let lines: MetroLine[] = [];
    let trains: Train[] = [];
    let rafId = 0;
    const colors = Object.values(subwayColors);

    // 화면 크기에 맞춰 노선·열차 데이터 새로 생성 (원본 로직 그대로)
    function initCanvas() {
      canvasW = window.innerWidth;
      canvasH = window.innerHeight;
      canvas.width = canvasW;
      canvas.height = canvasH;
      lines = [];
      trains = [];

      const lineCount = Math.floor(canvasW / 250) + 2;
      for (let i = 0; i < lineCount; i++) {
        const points: Point[] = [];
        const edge = Math.floor(Math.random() * 4);
        let currX = 0;
        let currY = 0;
        if (edge === 0) { currX = Math.random() * canvasW; currY = -100; }
        else if (edge === 1) { currX = canvasW + 100; currY = Math.random() * canvasH; }
        else if (edge === 2) { currX = Math.random() * canvasW; currY = canvasH + 100; }
        else { currX = -100; currY = Math.random() * canvasH; }
        points.push({ x: currX, y: currY });

        const targetX = canvasW / 2 + (Math.random() - 0.5) * (canvasW * 0.4);
        const targetY = canvasH / 2 + (Math.random() - 0.5) * (canvasH * 0.4);
        let currentDir = Math.round(Math.atan2(targetY - currY, targetX - currX) / (Math.PI / 4));

        const nodeCount = 4 + Math.floor(Math.random() * 3);
        for (let j = 0; j < nodeCount; j++) {
          const dist = 200 + Math.random() * 300;
          if (j > 0 && Math.random() > 0.7) currentDir += Math.random() > 0.5 ? 1 : -1;
          const dirAngle = currentDir * (Math.PI / 4);
          currX += Math.cos(dirAngle) * dist;
          currY += Math.sin(dirAngle) * dist;
          points.push({ x: currX, y: currY });
        }

        lines.push({ color: colors[i % colors.length], points });
        trains.push({ lineIndex: i, segment: 0, progress: 0, speed: 0.0015 + Math.random() * 0.0015, direction: 1 });
      }
    }

    // 매 프레임 그리기 (원본 로직 그대로)
    function renderFrame() {
      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.strokeStyle = line.color;
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let i = 1; i < line.points.length; i++) ctx.lineTo(line.points[i].x, line.points[i].y);
        ctx.stroke();

        ctx.lineWidth = 4;
        line.points.forEach((pt, idx) => {
          ctx.beginPath();
          if (idx === Math.floor(line.points.length / 2)) {
            ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
            ctx.fillStyle = "#f2f2e9"; ctx.fill();
            ctx.strokeStyle = "#333"; ctx.lineWidth = 6; ctx.stroke();
            ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#333"; ctx.fill();
          } else {
            ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#f2f2e9"; ctx.fill();
            ctx.strokeStyle = "#333"; ctx.stroke();
          }
        });
      });

      trains.forEach((train) => {
        const line = lines[train.lineIndex];
        if (line.points.length < 2) return;
        const p1 = line.points[train.segment];
        const p2 = line.points[train.segment + train.direction];
        if (!p2) { train.direction *= -1; train.segment += train.direction; return; }

        const tx = p1.x + (p2.x - p1.x) * train.progress;
        const ty = p1.y + (p2.y - p1.y) * train.progress;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(Math.atan2(p2.y - p1.y, p2.x - p1.x));
        ctx.fillStyle = line.color;
        ctx.beginPath(); ctx.roundRect(-16, -8, 32, 16, 4); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillRect(-8, -4, 6, 8);
        ctx.fillRect(2, -4, 6, 8);
        ctx.restore();

        train.progress += train.speed;
        if (train.progress >= 1) {
          train.progress = 0;
          train.segment += train.direction;
          if (train.segment >= line.points.length - 1 || train.segment <= 0) {
            train.direction *= -1;
            if (train.segment <= 0) train.segment = 0;
          }
        }
      });

      rafId = requestAnimationFrame(renderFrame);
    }

    initCanvas();
    renderFrame();
    window.addEventListener("resize", initCanvas);

    // 컴포넌트가 사라질 때: 애니메이션 정지 + 리스너 제거
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", initCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        filter: "blur(6px)",
        opacity: 0.7,
        pointerEvents: "none",
      }}
    />
  );
}

export default BackgroundCanvas;