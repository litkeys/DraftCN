'use client';

import React, { useState, useMemo } from 'react';
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
import {
  generateReactProject,
  downloadReactProject,
  generateReactExportFilename,
} from '@/lib/project/react-export';
import { toast } from 'sonner';

export function ExportButton() {
  const blocks = useAppStore((state) => state.blocks);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportReact = async () => {
    try {
      // Set loading state
      setIsExporting(true);

      // Validate blocks exist
      if (!blocks || blocks.length === 0) {
        toast.error('No blocks to export. Please add some blocks to the canvas first.');
        return;
      }

      // Generate the React project ZIP
      const blob = await generateReactProject(blocks);

      // Validate ZIP blob was created
      if (!blob || blob.size === 0) {
        toast.error('Failed to create ZIP file. The project archive is empty.');
        return;
      }

      // Generate filename with timestamp
      const filename = generateReactExportFilename();

      // Trigger download
      downloadReactProject(blob, filename);

      // Show success notification
      toast.success('React project exported successfully');
    } catch (error) {
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to export React project';

      if (error instanceof Error) {
        if (error.message.includes('template')) {
          errorMessage = 'Failed to process templates. Some components may be missing.';
        } else if (error.message.includes('ZIP') || error.message.includes('compress')) {
          errorMessage = 'Failed to create ZIP archive. Please try again.';
        } else if (error.message.includes('memory') || error.message.includes('size')) {
          errorMessage = 'Project too large to export. Try removing some blocks.';
        } else if (error.message) {
          // Use the actual error message if it's informative
          errorMessage = `Export failed: ${error.message}`;
        }
      }

      toast.error(errorMessage);
      console.error('React export error:', error);
    } finally {
      // Reset loading state
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportReact}>
          Export to React
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}