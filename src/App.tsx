import { Outlet } from "react-router";
import NavBar from "./components/NavBar.tsx";
import BackgroundCanvas from "./components/BackgroundCanvas.tsx";

function App() {
  return (
    <>
      <BackgroundCanvas />
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;