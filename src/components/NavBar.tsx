import { NavLink } from "react-router";

function NavBar() {
  return (
    <nav>
      <NavLink to="/">홈/게임</NavLink>
      {" | "}
      <NavLink to="/stations">역 정보</NavLink>
    </nav>
  );
}

export default NavBar;
