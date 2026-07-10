import type { Station } from "../types/station.ts";
import { getLineColor } from "../constants/subwayColors.ts";

function lineBadge(line: string): string {
  return /^\d+호선$/.test(line) ? line.replace("호선", "") : line;
}

function StationNameplate({ station }: { station: Station }) {
  const color = getLineColor(station.line);

  return (
    <div className="nameplate">
      <div className="nameplate-bar" style={{ backgroundColor: color }} />
      <div className="nameplate-pill" style={{ borderColor: color }}>
        <div className="nameplate-badge" style={{ backgroundColor: color }}>
          {lineBadge(station.line)}
        </div>
        <div className="nameplate-text">
          <div className="nameplate-name">{station.name}</div>
          <div className="nameplate-sub">
            <span>{station.nameEng}</span>
            <span className="sep">|</span>
            <span>{station.nameChn}</span>
            <span className="sep">|</span>
            <span>{station.nameJpn}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StationNameplate;