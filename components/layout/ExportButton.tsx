'use client';

import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store';
import {
  exportProject,
  generateExportFilename,
  downloadJSON,
} from '@/lib/project/export';

export function ExportButton() {
  const blocks = useAppStore((state) => state.blocks);

  /**
   * Calculate canvas dimensions based on blocks
   * This mirrors the logic in Canvas.tsx
   */
  const canvasDimensions = useMemo(() => {
    const baseWidth = 1200;
    const baseMinHeight = 1200;

    // Calculate height based on blocks
    let worldHeight = baseMinHeight;
    if (blocks.length > 0) {
      // Find the lowest point of all blocks in world coordinates
      const lowestPoint = Math.max(
        ...blocks.map((block) => block.y + block.height)
      );
      worldHeight = Math.max(baseMinHeight, lowestPoint + 1200);
    }

    // Return world dimensions (not screen dimensions) for export
    return {
      width: baseWidth,
      height: worldHeight,
    };
  }, [blocks]);

  const handleExportJSON = () => {
    // Generate the project data
    const projectData = exportProject(blocks, canvasDimensions);

    // Generate filename with timestamp
    const filename = generateExportFilename();

    // Trigger download
    downloadJSON(projectData, filename);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}