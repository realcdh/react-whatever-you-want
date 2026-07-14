// 배경 지하철 노선도: "생성" 로직과 "그리기" 로직을 절차별 순수 함수로 분리한 모듈.
// (React와 무관하게 값·캔버스만 다룹니다.)

export type Point = { x: number; y: number };
export type MetroLine = { color: string; points: Point[] };
export type Train = {
  lineIndex: number;
  segment: number;
  progress: number;
  speed: number;
  direction: number;
};

const DIR_UNIT = Math.PI / 4; // 45° — 노선은 이 단위(8방향)로만 진행

// ── 생성 ────────────────────────────────────────────────

/** 화면 가장자리(위/오른쪽/아래/왼쪽)의 랜덤 시작점 */
export function randomEdgePoint(w: number, h: number): Point {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: Math.random() * w, y: -100 }; // 위
  if (edge === 1) return { x: w + 100, y: Math.random() * h }; // 오른쪽
  if (edge === 2) return { x: Math.random() * w, y: h + 100 }; // 아래
  return { x: -100, y: Math.random() * h }; // 왼쪽
}

/** 화면 중앙(도심)을 향하는 방향을 45° 단위로 스냅한 값 */
export function snapDirToCenter(start: Point, w: number, h: number): number {
  const targetX = w / 2 + (Math.random() - 0.5) * (w * 0.4);
  const targetY = h / 2 + (Math.random() - 0.5) * (h * 0.4);
  return Math.round(Math.atan2(targetY - start.y, targetX - start.x) / DIR_UNIT);
}

/** 노선 1개의 점들: 가장자리에서 출발해 길게 뻗으며 가끔 45°씩 꺾음 */
export function buildLinePoints(w: number, h: number): Point[] {
  const start = randomEdgePoint(w, h);
  const points: Point[] = [start];
  let currX = start.x;
  let currY = start.y;
  let currentDir = snapDirToCenter(start, w, h);

  const nodeCount = 4 + Math.floor(Math.random() * 3); // 4~6 구간
  for (let j = 0; j < nodeCount; j++) {
    const dist = 200 + Math.random() * 300; // 200~500px
    if (j > 0 && Math.random() > 0.7) currentDir += Math.random() > 0.5 ? 1 : -1; // 30% 확률로 ±45°
    const dirAngle = currentDir * DIR_UNIT;
    currX += Math.cos(dirAngle) * dist;
    currY += Math.sin(dirAngle) * dist;
    points.push({ x: currX, y: currY });
  }
  return points;
}

/** 화면 너비에 맞춰 여러 노선 생성 (색은 팔레트를 순환 사용) */
export function createLines(w: number, h: number, colors: string[]): MetroLine[] {
  const lineCount = Math.floor(w / 250) + 2;
  const lines: MetroLine[] = [];
  for (let i = 0; i < lineCount; i++) {
    lines.push({ color: colors[i % colors.length], points: buildLinePoints(w, h) });
  }
  return lines;
}

/** 노선 수만큼 열차 생성 */
export function createTrains(count: number): Train[] {
  const trains: Train[] = [];
  for (let i = 0; i < count; i++) {
    trains.push({
      lineIndex: i,
      segment: 0,
      progress: 0,
      speed: 0.0015 + Math.random() * 0.0015,
      direction: 1,
    });
  }
  return trains;
}

// ── 그리기 ──────────────────────────────────────────────

/** 노선 1개 그리기: 트랙 + 역 기호(가운데는 큰 환승역) */
export function drawLine(ctx: CanvasRenderingContext2D, line: MetroLine): void {
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
}

/** 열차 1개 그리기 + 다음 프레임을 위해 위치 전진 (train 값을 갱신) */
export function drawTrain(ctx: CanvasRenderingContext2D, line: MetroLine, train: Train): void {
  if (line.points.length < 2) return;
  const p1 = line.points[train.segment];
  const p2 = line.points[train.segment + train.direction];
  if (!p2) {
    train.direction *= -1;
    train.segment += train.direction;
    return;
  }

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
}
