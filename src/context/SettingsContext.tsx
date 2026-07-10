import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Settings {
  region: string;
  line: string;
  setRegion: (region: string) => void;
  setLine: (line: string) => void;
}

const SettingsContext = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState("서울 지역");
  const [line, setLine] = useState("3호선");

  return (
    <SettingsContext.Provider value={{ region, line, setRegion, setLine }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings는 SettingsProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}