import { ComponentType } from 'react';

export interface BlockTemplate {
  typeId: string;
  name: string;
  category: string;
  thumbnail: string;
  dependencies: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultProps: any; // Each template defines its own props interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>; // Templates have varied prop structures
  defaultWidth: number;
  defaultHeight: number;
  minimumWidth: number;
  minimumHeight: number;
}