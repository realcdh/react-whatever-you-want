import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { SettingsProvider } from "./context/SettingsContext.tsx";
import App from "./App.tsx";
import HomePage from "./pages/HomePage.tsx";
import PlayPage from "./pages/PlayPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";
import StationsPage from "./pages/StationsPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="play" element={<PlayPage />} />
            <Route path="result" element={<ResultPage />} />
            <Route path="stations" element={<StationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  </StrictMode>,
);