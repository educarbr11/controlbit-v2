export const CMD_COLOR_MAP: Record<string, string> = {
  F: '#00C851',
  T: '#FF2D2D',
  E: '#0066FF',
  D: '#0066FF',
  B: '#FF6B00',
  P: '#7B2FFF',
};

export function getCmdColor(cmd: string): string {
  return CMD_COLOR_MAP[cmd] || '#FFE500';
}
