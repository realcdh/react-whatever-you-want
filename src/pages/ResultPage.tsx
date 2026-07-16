import { useLocation, useNavigate } from "react-router";

function hasScore(state: unknown): state is { score: number } {
  if (typeof state !== "object" || state === null) return false;
  if (!("score" in state)) return false;
  return typeof state.score === "number";
}

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state: unknown = location.state;
  const score = hasScore(state) ? state.score : 0;

  return (
    <section className="screen">
      <div className="gameover">
        <h2 className="gameover-title">운행 종료</h2>
        <div className="score-card">
          <div className="card-label">최종 점수</div>
          <div className="card-value">{score}</div>
        </div>
        <button className="metro-btn" onClick={() => navigate("/")}>
          <span className="arrow rot135neg">➔</span>
          <span className="label">처음으로 돌아가기</span>
        </button>
      </div>
    </section>
  );
}

export default ResultPage;
