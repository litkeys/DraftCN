import { Block } from './block';

export interface CanvasState {
  blocks: Block[];
  selectedBlockIds: string[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
}