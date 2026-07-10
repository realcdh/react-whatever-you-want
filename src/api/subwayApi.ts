import type { Station } from "../types/station.ts";

interface RawStationRow {
  STATION_CD: string;
  STATION_NM: string;
  STATION_NM_ENG: string;
  STATION_NM_CHN: string;
  STATION_NM_JPN: string;
  LINE_NUM: string;
}

interface SubwayApiResponse {
  SearchSTNBySubwayLineInfo?: {
    list_total_count: number;
    RESULT: { CODE: string; MESSAGE: string };
    row: RawStationRow[];
  };
  RESULT?: { CODE: string; MESSAGE: string };
}

const API_KEY = import.meta.env.VITE_SEOUL_API_KEY;

// 앞자리 0 제거
function normalizeLine(lineNum: string): string {
  return lineNum.replace(/^0/, "");
}

export async function fetchStations(): Promise<Station[]> {
  const url = `/subwayApi/${API_KEY}/json/SearchSTNBySubwayLineInfo/1/1000/`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`네트워크 오류: ${res.status}`);
  }

  const data: SubwayApiResponse = await res.json();
  const body = data.SearchSTNBySubwayLineInfo;

  if (!body || body.RESULT.CODE !== "INFO-000") {
    const message = body?.RESULT.MESSAGE ?? data.RESULT?.MESSAGE ?? "알 수 없는 오류";
    throw new Error(message);
  }
  
  return body.row.map((r) => ({
    id: r.STATION_CD,
    name: r.STATION_NM,
    nameEng: r.STATION_NM_ENG,
    nameChn: r.STATION_NM_CHN,
    nameJpn: r.STATION_NM_JPN,
    line: normalizeLine(r.LINE_NUM),
  }));
}