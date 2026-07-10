import { useLocation, useNavigate } from "react-router";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const score = (location.state as { score?: number } | null)?.score ?? 0;

  return (
    <section>
      <h2>운행 종료</h2>
      <p>최종 점수</p>
      <p>{score}</p>
      <button onClick={() => navigate("/")}>처음으로 돌아가기</button>
    </section>
  );
}

export default ResultPage;