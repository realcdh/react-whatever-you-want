export type Point = { x: number; y: number };
export type MetroLine = { color: string; points: Point[] };
export type Train = {
  lineIndex: number;
  segment: number;
  progress: number;
  speed: number;
  direction: number;
};