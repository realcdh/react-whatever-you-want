import { Outlet } from "react-router";
import BackgroundCanvas from "./components/BackgroundCanvas.tsx";

function App() {
  return (
    <>
      <BackgroundCanvas />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;
