export interface Block {
  id: string;
  typeId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any; // Each template has its own specific props interface
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  selected: boolean;
}