import { Outlet } from "react-router";
import NavBar from "./components/NavBar.tsx";

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;