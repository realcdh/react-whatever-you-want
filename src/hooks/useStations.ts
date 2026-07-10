import { useState, useEffect } from "react";
import type { Station } from "../types/station.ts";
import { fetchStations } from "../api/subwayApi.ts";

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false; // 화면을 벗어난 뒤 상태 변경 방지

    fetchStations()
      .then((data) => {
        if (!ignore) setStations(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { stations, loading, error };
}
