import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportButton } from '@/components/layout/ImportButton';
import * as importUtils from '@/lib/project/import';
import { toast } from 'sonner';

vi.mock('@/lib/project/import', () => ({
  parseAndValidateJSON: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ImportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render import button', () => {
    render(<ImportButton />);

    const button = screen.getByRole('button', { name: /import/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('gap-2');
  });

  it('should have upload icon in button', () => {
    render(<ImportButton />);

    const button = screen.getByRole('button', { name: /import/i });
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('should have hidden file input with correct attributes', () => {
    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.json');
    expect(fileInput).toHaveStyle({ display: 'none' });
    expect(fileInput).toHaveAttribute('aria-hidden', 'true');
  });

  it('should trigger file input click when button is clicked', () => {
    const { container } = render(<ImportButton />);

    const button = screen.getByRole('button', { name: /import/i });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should show confirmation dialog for valid JSON', async () => {
    const mockValidationResult = {
      valid: true,
      errors: [],
      data: {
        timestamp: '2025-01-25T14:30:22Z',
        canvas: { width: 1200, height: 800 },
        blocks: [],
      },
    };

    (importUtils.parseAndValidateJSON as vi.Mock).mockReturnValue(mockValidationResult);

    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['{"blocks": []}'],
      'test-project.json',
      { type: 'application/json' }
    );

    // Mock file.text() method - add it if it doesn't exist
    if (!mockFile.text) {
      Object.defineProperty(mockFile, 'text', {
        value: vi.fn().mockResolvedValue('{"blocks": []}'),
      });
    } else {
      vi.spyOn(mockFile, 'text').mockResolvedValue('{"blocks": []}');
    }

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(importUtils.parseAndValidateJSON).toHaveBeenCalledWith('{"blocks": []}');
    });

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Replace Current Project?')).toBeInTheDocument();
      expect(screen.getByText('This will replace your current project. Continue?')).toBeInTheDocument();
    });

    // Should not show error for valid file
    expect(toast.error).not.toHaveBeenCalled();

    // File input should be reset
    expect(fileInput.value).toBe('');
  });

  it('should show error for invalid JSON', async () => {
    const mockValidationResult = {
      valid: false,
      errors: ['Invalid file format: expected an object'],
      data: undefined,
    };

    (importUtils.parseAndValidateJSON as vi.Mock).mockReturnValue(mockValidationResult);

    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['invalid json'],
      'test-project.json',
      { type: 'application/json' }
    );

    // Mock file.text() method - add it if it doesn't exist
    if (!mockFile.text) {
      Object.defineProperty(mockFile, 'text', {
        value: vi.fn().mockResolvedValue('invalid json'),
      });
    } else {
      vi.spyOn(mockFile, 'text').mockResolvedValue('invalid json');
    }

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid file format: expected an object');
    });

    // File input should be reset
    expect(fileInput.value).toBe('');
  });

  it('should reject non-JSON files', async () => {
    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['some text'],
      'document.txt',
      { type: 'text/plain' }
    );

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a JSON file');
    });

    // parseAndValidateJSON should not be called
    expect(importUtils.parseAndValidateJSON).not.toHaveBeenCalled();

    // File input should be reset
    expect(fileInput.value).toBe('');
  });

  it('should handle file read errors gracefully', async () => {
    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['{"blocks": []}'],
      'test-project.json',
      { type: 'application/json' }
    );

    // Mock file.text() to reject - add it if it doesn't exist
    if (!mockFile.text) {
      Object.defineProperty(mockFile, 'text', {
        value: vi.fn().mockRejectedValue(new Error('Read error')),
      });
    } else {
      vi.spyOn(mockFile, 'text').mockRejectedValue(new Error('Read error'));
    }

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    // Spy on console.error to suppress error output in tests
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to read file');
    });

    expect(consoleErrorSpy).toHaveBeenCalled();

    // File input should be reset
    expect(fileInput.value).toBe('');

    consoleErrorSpy.mockRestore();
  });

  it('should disable button while processing', async () => {
    const mockValidationResult = {
      valid: true,
      errors: [],
      data: {
        timestamp: '2025-01-25T14:30:22Z',
        canvas: { width: 1200, height: 800 },
        blocks: [],
      },
    };

    (importUtils.parseAndValidateJSON as vi.Mock).mockImplementation(() => {
      // Delay to simulate processing
      return new Promise(resolve => setTimeout(() => resolve(mockValidationResult), 100));
    });

    const { container } = render(<ImportButton />);

    const button = screen.getByRole('button', { name: /import/i });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['{"blocks": []}'],
      'test-project.json',
      { type: 'application/json' }
    );

    // Mock file.text() method - add it if it doesn't exist
    if (!mockFile.text) {
      Object.defineProperty(mockFile, 'text', {
        value: vi.fn().mockResolvedValue('{"blocks": []}'),
      });
    } else {
      vi.spyOn(mockFile, 'text').mockResolvedValue('{"blocks": []}');
    }

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Button should show processing state
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('should handle no file selection gracefully', () => {
    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate change event with no files
    Object.defineProperty(fileInput, 'files', {
      value: [],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Should not call any validation or show any errors
    expect(importUtils.parseAndValidateJSON).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should style button consistently with Header elements', () => {
    render(<ImportButton />);

    const button = screen.getByRole('button', { name: /import/i });

    expect(button).toHaveClass('gap-2');
    expect(button).toHaveAttribute('data-slot', 'button');

    // Check for variant and size classes
    const classes = button.className;
    expect(classes).toContain('h-8'); // size="sm" adds h-8
  });

  it('should handle confirmation dialog cancel', async () => {
    const mockValidationResult = {
      valid: true,
      errors: [],
      data: {
        timestamp: '2025-01-25T14:30:22Z',
        canvas: { width: 1200, height: 800 },
        blocks: [],
      },
    };

    (importUtils.parseAndValidateJSON as vi.Mock).mockReturnValue(mockValidationResult);

    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['{"blocks": []}'],
      'test-project.json',
      { type: 'application/json' }
    );

    // Mock file.text() method
    if (!mockFile.text) {
      Object.defineProperty(mockFile, 'text', {
        value: vi.fn().mockResolvedValue('{"blocks": []}'),
      });
    } else {
      vi.spyOn(mockFile, 'text').mockResolvedValue('{"blocks": []}');
    }

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Replace Current Project?')).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Replace Current Project?')).not.toBeInTheDocument();
    });
  });

  it('should handle confirmation dialog continue', async () => {
    const mockValidationResult = {
      valid: true,
      errors: [],
      data: {
        timestamp: '2025-01-25T14:30:22Z',
        canvas: { width: 1200, height: 800 },
        blocks: [],
      },
    };

    (importUtils.parseAndValidateJSON as vi.Mock).mockReturnValue(mockValidationResult);

    const { container } = render(<ImportButton />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFile = new File(
      ['{"blocks": []}'],
      'test-project.json',
      { type: 'application/json' }
    );

    // Mock file.text() method
    if (!mockFile.text) {
      Object.defineProperty(mockFile, 'text', {
        value: vi.fn().mockResolvedValue('{"blocks": []}'),
      });
    } else {
      vi.spyOn(mockFile, 'text').mockResolvedValue('{"blocks": []}');
    }

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    // Spy on console.log to verify import action
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    fireEvent.change(fileInput);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Replace Current Project?')).toBeInTheDocument();
    });

    // Click Continue button
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Replace Current Project?')).not.toBeInTheDocument();
    });

    // Should log the import action (Task 8 will implement actual import)
    expect(consoleLogSpy).toHaveBeenCalledWith('Importing project data:', mockValidationResult.data);

    consoleLogSpy.mockRestore();
  });
});