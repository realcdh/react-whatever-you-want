import type { Station } from "../types/station.ts";
import { getLineColor } from "../constants/subwayColors.ts";

// "3호선" → "3", 이름 노선(수인분당선 등)은 그대로
function lineBadge(line: string): string {
  return /^\d+호선$/.test(line) ? line.replace("호선", "") : line;
}

function StationNameplate({ station }: { station: Station }) {
  const color = getLineColor(station.line);
  const numbered = /^\d+호선$/.test(station.line);

  return (
    <div className="nameplate">
      <div className="nameplate-bar" style={{ backgroundColor: color }} aria-hidden="true" />
      <div className="nameplate-pill" style={{ borderColor: color }}>
        {/* 배지엔 "3"만 보이지만, 스크린리더는 "3호선"으로 읽도록 aria-label 지정 */}
        <div
          className={numbered ? "nameplate-badge" : "nameplate-badge named"}
          style={{ backgroundColor: color }}
          aria-label={station.line}
        >
          {lineBadge(station.line)}
        </div>
        <div className="nameplate-text">
          <div className="nameplate-name">{station.name}</div>
          {/* 다국어 역명: lang을 명시해 스크린리더가 올바른 발음으로 읽도록, 구분선은 장식 처리 */}
          <div className="nameplate-sub">
            <span lang="en">{station.nameEng}</span>
            <span className="sep" aria-hidden="true">|</span>
            <span lang="zh">{station.nameChn}</span>
            <span className="sep" aria-hidden="true">|</span>
            <span lang="ja">{station.nameJpn}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StationNameplate;
