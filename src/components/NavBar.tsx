import { useState } from "react";
import { NavLink, useLocation } from "react-router";

function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === "/play") return null;

  return (
    <nav className="navbar" aria-label="주요 메뉴">
      <button
        type="button"
        className="navbar-toggle"
        aria-expanded={open}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="navbar-dot" />
        <span className="navbar-dot square" />
      </button>

      {open && (
        <div className="navbar-menu">
          <NavLink to="/" end onClick={() => setOpen(false)}>
            홈 / 게임
          </NavLink>
          <NavLink to="/stations" onClick={() => setOpen(false)}>
            역 정보
          </NavLink>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
