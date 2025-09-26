import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportProject,
  generateExportFilename,
  downloadJSON,
  type ProjectData,
} from '@/lib/project/export';
import type { Block } from '@/types';

describe('exportProject', () => {
  const mockBlocks: Block[] = [
    {
      id: 'block-1',
      typeId: 'template-1',
      props: { text: 'Hello World' },
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
      props: { color: 'blue' },
      x: 400,
      y: 500,
      width: 200,
      height: 100,
      z: 2,
      selected: true,
    },
  ];

  const mockCanvasDimensions = {
    width: 1200,
    height: 1800,
  };

  it('should include all blocks with complete state', () => {
    const result = exportProject(mockBlocks, mockCanvasDimensions);

    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0]).toEqual({
      id: 'block-1',
      typeId: 'template-1',
      props: { text: 'Hello World' },
      x: 100,
      y: 200,
      width: 300,
      height: 150,
      z: 1,
      selected: false,
    });
    expect(result.blocks[1]).toEqual({
      id: 'block-2',
      typeId: 'template-2',
      props: { color: 'blue' },
      x: 400,
      y: 500,
      width: 200,
      height: 100,
      z: 2,
      selected: true,
    });
  });

  it('should include canvas dimensions', () => {
    const result = exportProject(mockBlocks, mockCanvasDimensions);

    expect(result.canvas).toEqual({
      width: 1200,
      height: 1800,
    });
  });

  it('should include project metadata with ISO timestamp', () => {
    const beforeTime = new Date().toISOString();
    const result = exportProject(mockBlocks, mockCanvasDimensions);
    const afterTime = new Date().toISOString();

    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(beforeTime).getTime()
    );
    expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
      new Date(afterTime).getTime()
    );
  });

  it('should not include UI state properties', () => {
    const result = exportProject(mockBlocks, mockCanvasDimensions);
    const resultString = JSON.stringify(result);

    expect(resultString).not.toContain('zoom');
    expect(resultString).not.toContain('pan');
    expect(resultString).not.toContain('panX');
    expect(resultString).not.toContain('panY');
  });

  it('should handle empty blocks array', () => {
    const result = exportProject([], mockCanvasDimensions);

    expect(result.blocks).toEqual([]);
    expect(result.canvas).toEqual(mockCanvasDimensions);
    expect(result.timestamp).toBeDefined();
  });

  it('should preserve all block properties', () => {
    const complexBlock: Block = {
      id: 'complex-block',
      typeId: 'complex-template',
      props: {
        nested: {
          property: 'value',
          array: [1, 2, 3],
        },
      },
      x: 50,
      y: 75,
      width: 400,
      height: 600,
      z: 10,
      selected: false,
    };

    const result = exportProject([complexBlock], mockCanvasDimensions);

    expect(result.blocks[0]).toEqual(complexBlock);
  });
});

describe('generateExportFilename', () => {
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date('2025-01-25T14:30:22');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate filename with correct timestamp format', () => {
    const filename = generateExportFilename();

    expect(filename).toBe('draftcn-project-2025-01-25-143022.json');
  });

  it('should pad single digit values with zero', () => {
    const testDate = new Date('2025-03-05T09:05:07');
    vi.setSystemTime(testDate);

    const filename = generateExportFilename();

    expect(filename).toBe('draftcn-project-2025-03-05-090507.json');
  });

  it('should handle midnight correctly', () => {
    const testDate = new Date('2025-12-31T00:00:00');
    vi.setSystemTime(testDate);

    const filename = generateExportFilename();

    expect(filename).toBe('draftcn-project-2025-12-31-000000.json');
  });

  it('should handle end of year correctly', () => {
    const testDate = new Date('2025-12-31T23:59:59');
    vi.setSystemTime(testDate);

    const filename = generateExportFilename();

    expect(filename).toBe('draftcn-project-2025-12-31-235959.json');
  });
});

describe('downloadJSON', () => {
  let createElementSpy: vi.SpyInstance;
  let clickSpy: ReturnType<typeof vi.fn>;
  let mockLink: HTMLAnchorElement;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    clickSpy = vi.fn();
    mockLink = {
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement;

    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockLink);

    // Mock URL methods in global scope
    originalCreateObjectURL = globalThis.URL.createObjectURL;
    originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-blob');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.URL.createObjectURL = originalCreateObjectURL;
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('should create and trigger download with correct filename', () => {
    const mockData: ProjectData = {
      timestamp: '2025-01-25T14:30:22Z',
      canvas: { width: 1200, height: 800 },
      blocks: [],
    };

    downloadJSON(mockData, 'test-project.json');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe('test-project.json');
    expect(mockLink.href).toBe('blob:http://localhost/test-blob');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should create blob with correct JSON content', () => {
    const mockData: ProjectData = {
      timestamp: '2025-01-25T14:30:22Z',
      canvas: { width: 1200, height: 800 },
      blocks: [
        {
          id: 'test-block',
          typeId: 'test-template',
          props: {},
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          z: 1,
          selected: false,
        },
      ],
    };

    downloadJSON(mockData, 'test.json');

    const createObjectURLMock = globalThis.URL.createObjectURL as ReturnType<typeof vi.fn>;
    const blobCall = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blobCall.type).toBe('application/json');
  });

  it('should clean up object URL after download', () => {
    const mockData: ProjectData = {
      timestamp: '2025-01-25T14:30:22Z',
      canvas: { width: 1200, height: 800 },
      blocks: [],
    };

    downloadJSON(mockData, 'cleanup-test.json');

    const revokeObjectURLMock = globalThis.URL.revokeObjectURL as ReturnType<typeof vi.fn>;
    expect(revokeObjectURLMock).toHaveBeenCalledWith(
      'blob:http://localhost/test-blob'
    );
  });

  it('should format JSON with proper indentation', () => {
    const mockData: ProjectData = {
      timestamp: '2025-01-25T14:30:22Z',
      canvas: { width: 1200, height: 800 },
      blocks: [],
    };

    // Mock Blob constructor to capture arguments
    const originalBlob = globalThis.Blob;
    let capturedBlobArgs: [string[], BlobPropertyBag | undefined] = [[], undefined];
    globalThis.Blob = class MockBlob {
      constructor(blobParts: string[], options?: BlobPropertyBag) {
        capturedBlobArgs = [blobParts, options];
      }
    } as unknown as typeof Blob;

    downloadJSON(mockData, 'format-test.json');

    const expectedJSON = JSON.stringify(mockData, null, 2);
    expect(capturedBlobArgs[0]).toEqual([expectedJSON]);
    expect(capturedBlobArgs[1]).toEqual({ type: 'application/json' });

    globalThis.Blob = originalBlob;
  });
});