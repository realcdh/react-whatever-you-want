export const DEFAULT_LINE_COLOR = "#666666";

export const subwayColors: Record<string, string> = {
  // 1~9호선 (원본 preview.html 색상 유지)
  "1호선": "#2B3990",
  "2호선": "#3CB44A",
  "3호선": "#F06F28",
  "4호선": "#2C9EDE",
  "5호선": "#8936E0",
  "6호선": "#B67A26",
  "7호선": "#5A6E24",
  "8호선": "#E51E6E",
  "9호선": "#C8A730",
  // 광역·경전철 (공식 색상에 가깝게)
  "수인분당선": "#F5A200",
  "경의선": "#77C4A3",
  "경춘선": "#0C8E72",
  "신분당선": "#D31145",
  "서해선": "#8FC31F",
  "공항철도": "#0090D2",
  "경강선": "#003DA5",
  "인천선": "#7CA8D5",
  "인천2호선": "#ED8B00",
  "의정부경전철": "#FDA600",
  "용인경전철": "#509F22",
  "우이신설경전철": "#B7C452",
  "신림선": "#6789CA",
  "김포도시철도": "#AD8605",
  "GTX-A": "#935EA3",
};

// 맵에 없는 노선이 와도 안전하게 색을 돌려주는 헬퍼
export function getLineColor(line: string): string {
  return subwayColors[line] ?? DEFAULT_LINE_COLOR;
}