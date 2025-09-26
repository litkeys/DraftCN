import type { Block } from '@/types';

/**
 * Project data structure for export
 */
export interface ProjectData {
  timestamp: string;
  canvas: {
    width: number;
    height: number;
  };
  blocks: Block[];
}

/**
 * Export project data for saving as JSON
 * Gathers all blocks and canvas dimensions, excluding UI state
 * @param blocks - Array of all blocks to export
 * @param canvasDimensions - Canvas width and height
 * @returns Complete project data structure
 */
export function exportProject(
  blocks: Block[],
  canvasDimensions: { width: number; height: number }
): ProjectData {
  const projectData: ProjectData = {
    timestamp: new Date().toISOString(),
    canvas: {
      width: canvasDimensions.width,
      height: canvasDimensions.height,
    },
    blocks: blocks.map((block) => ({
      id: block.id,
      typeId: block.typeId,
      props: block.props,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      z: block.z,
      selected: block.selected,
    })),
  };

  return projectData;
}

/**
 * Generate filename with timestamp format
 * @returns Filename string in format draftcn-project-YYYY-MM-DD-HHmmss.json
 */
export function generateExportFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `draftcn-project-${year}-${month}-${day}-${hours}${minutes}${seconds}.json`;
}

/**
 * Download JSON data as a file
 * @param data - The project data to download
 * @param filename - The filename to use for the download
 */
export function downloadJSON(data: ProjectData, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}