import { useNavigate } from "react-router";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="screen">
      <div className="gameover">
        <h2 className="gameover-title">404</h2>
        <p style={{ color: "#555", margin: "0 0 2rem" }}>
          찾으시는 역(페이지)이 없습니다.
        </p>
        <button className="metro-btn" onClick={() => navigate("/")}>
          <span className="arrow rot135neg">➔</span>
          <span className="label">홈으로 돌아가기</span>
        </button>
      </div>
    </section>
  );
}

export default NotFoundPage;
