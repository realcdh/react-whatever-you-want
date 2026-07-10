import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.tsx";
import HomePage from "./pages/HomePage.tsx";
import PlayPage from "./pages/PlayPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";
import StationsPage from "./pages/StationsPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="play" element={<PlayPage />} />
          <Route path="result" element={<ResultPage />} />
          <Route path="stations" element={<StationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);