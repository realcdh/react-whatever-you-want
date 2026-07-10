export interface Station {
  id: string; // 역 고유 키
  name: string; // 한글 역명
  nameEng: string; // 영어 역명
  nameChn: string; // 중국어 역명
  nameJpn: string; // 일본어 역명
  line: string; // 호선 정규화
}