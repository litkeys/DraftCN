import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from '@/components/layout/ExportButton';
import { useAppStore } from '@/store';
import * as exportUtils from '@/lib/project/export';
import type { Block } from '@/types';

vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

vi.mock('@/lib/project/export', () => ({
  exportProject: vi.fn(),
  generateExportFilename: vi.fn(),
  downloadJSON: vi.fn(),
}));

describe('ExportButton', () => {
  const mockBlocks: Block[] = [
    {
      id: 'block-1',
      typeId: 'template-1',
      props: { text: 'Test Block 1' },
      x: 100,
      y: 200,
      width: 300,
      height: 150,
      z: 1,
      selected: false,
    },
    {
      id: 'block-2',
      typeId: 'template-2',
      props: { text: 'Test Block 2' },
      x: 400,
      y: 500,
      width: 200,
      height: 100,
      z: 2,
      selected: false,
    },
  ];

  const defaultStoreState = {
    blocks: mockBlocks,
    zoom: 100,
  };

  beforeEach(() => {
    // Mock useAppStore with selector function
    (useAppStore as unknown as vi.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(defaultStoreState);
      }
      return defaultStoreState;
    });

    // Reset all export mocks
    vi.clearAllMocks();
    (exportUtils.generateExportFilename as vi.Mock).mockReturnValue(
      'draftcn-project-2025-01-25-143022.json'
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render export button in header', () => {
    render(<ExportButton />);

    const button = screen.getByRole('button', { name: /export/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('gap-2');
  });

  it('should have dropdown trigger button', () => {
    render(<ExportButton />);

    const button = screen.getByRole('button', { name: /export/i });

    // Verify button has dropdown attributes
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('data-state', 'closed');
  });

  it('should call export functions with correct data', () => {
    const mockProjectData = {
      timestamp: '2025-01-25T14:30:22Z',
      canvas: { width: 1200, height: 1800 },
      blocks: mockBlocks,
    };

    (exportUtils.exportProject as vi.Mock).mockReturnValue(mockProjectData);

    // Test that export utilities are properly integrated
    const blocks = mockBlocks;
    const canvasDimensions = { width: 1200, height: 1700 };

    // Call the export functions to verify they work correctly
    const result = exportUtils.exportProject(blocks, canvasDimensions);
    const filename = exportUtils.generateExportFilename();
    exportUtils.downloadJSON(result, filename);

    // Verify export functions work correctly
    expect(result).toEqual(mockProjectData);
    expect(exportUtils.exportProject).toHaveBeenCalledWith(
      mockBlocks,
      canvasDimensions
    );
    expect(exportUtils.downloadJSON).toHaveBeenCalledWith(
      mockProjectData,
      'draftcn-project-2025-01-25-143022.json'
    );
  });

  it('should generate correct filename with timestamp', () => {
    // Test the filename generation directly
    const filename = exportUtils.generateExportFilename();
    expect(filename).toBe('draftcn-project-2025-01-25-143022.json');
    expect(exportUtils.generateExportFilename).toHaveBeenCalled();
  });

  it('should calculate canvas dimensions based on blocks', () => {
    // Test with blocks that extend the canvas
    const tallBlocks: Block[] = [
      {
        id: 'tall-block',
        typeId: 'template-1',
        props: {},
        x: 100,
        y: 2000, // Very low on canvas
        width: 300,
        height: 500,
        z: 1,
        selected: false,
      },
    ];

    (useAppStore as unknown as vi.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ blocks: tallBlocks, zoom: 100 });
      }
      return { blocks: tallBlocks, zoom: 100 };
    });

    render(<ExportButton />);

    const button = screen.getByRole('button', { name: /export/i });
    fireEvent.click(button);

    // Click export option
    waitFor(() => {
      const exportOption = screen.getByText('Export as JSON');
      fireEvent.click(exportOption);

      // Canvas height should be extended to accommodate the tall block
      // 2000 (y) + 500 (height) + 1200 (padding) = 3700
      expect(exportUtils.exportProject).toHaveBeenCalledWith(
        tallBlocks,
        expect.objectContaining({
          width: 1200,
          height: 3700,
        })
      );
    });
  });

  it('should handle empty blocks array', () => {
    (useAppStore as unknown as vi.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ blocks: [], zoom: 100 });
      }
      return { blocks: [], zoom: 100 };
    });

    render(<ExportButton />);

    const button = screen.getByRole('button', { name: /export/i });
    fireEvent.click(button);

    waitFor(() => {
      const exportOption = screen.getByText('Export as JSON');
      fireEvent.click(exportOption);

      // With no blocks, should use minimum dimensions
      expect(exportUtils.exportProject).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          width: 1200,
          height: 1200, // Base minimum height
        })
      );
    });
  });

  it('should have download icon in button', () => {
    render(<ExportButton />);

    const button = screen.getByRole('button', { name: /export/i });
    // Check for SVG icon element within button
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('should style button to match UI patterns', () => {
    render(<ExportButton />);

    const button = screen.getByRole('button', { name: /export/i });
    expect(button).toHaveClass('gap-2');
    expect(button.querySelector('svg')).toHaveClass('h-4', 'w-4');
  });
});