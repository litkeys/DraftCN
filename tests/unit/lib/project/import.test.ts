import { describe, it, expect } from 'vitest';
import {
  validateProjectData,
  parseAndValidateJSON,
  type ValidationResult,
} from '@/lib/project/import';
import type { Block } from '@/types';
import type { ProjectData } from '@/lib/project/export';

describe('validateProjectData', () => {
  const validBlock: Block = {
    id: 'block-1',
    typeId: 'template-1',
    props: { text: 'Hello' },
    x: 100,
    y: 200,
    width: 300,
    height: 150,
    z: 1,
    selected: false,
  };

  const validProjectData: ProjectData = {
    timestamp: '2025-01-25T14:30:22Z',
    canvas: {
      width: 1200,
      height: 800,
    },
    blocks: [validBlock],
  };

  describe('Valid Data', () => {
    it('should validate correct project data', () => {
      const result = validateProjectData(validProjectData);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual(validProjectData);
    });

    it('should validate project with empty blocks array', () => {
      const data = {
        blocks: [],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate project with multiple blocks', () => {
      const data = {
        blocks: [
          validBlock,
          {
            ...validBlock,
            id: 'block-2',
            x: 400,
            y: 500,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate project without optional fields', () => {
      const data = {
        blocks: [validBlock],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Invalid Format', () => {
    it('should reject non-object data', () => {
      const result = validateProjectData('not an object');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid file format: expected an object');
    });

    it('should reject null data', () => {
      const result = validateProjectData(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid file format: expected an object');
    });

    it('should reject array data', () => {
      const result = validateProjectData([]);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid file format: expected an object');
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject data without blocks field', () => {
      const data = {
        timestamp: '2025-01-25T14:30:22Z',
        canvas: { width: 1200, height: 800 },
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: blocks');
    });

    it('should reject blocks that is not an array', () => {
      const data = {
        blocks: 'not an array',
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid blocks field: expected an array');
    });
  });

  describe('Invalid Block Structure', () => {
    it('should reject block missing id', () => {
      const data = {
        blocks: [
          {
            typeId: 'template-1',
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Block at index 0 missing or invalid id');
    });

    it('should reject block missing typeId', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Block at index 0 missing or invalid typeId');
    });

    it('should reject block missing coordinates', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            typeId: 'template-1',
            width: 300,
            height: 150,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('x coordinate'))).toBe(true);
      expect(result.errors.some(e => e.includes('y coordinate'))).toBe(true);
    });

    it('should reject block with invalid dimensions', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            typeId: 'template-1',
            x: 100,
            y: 200,
            width: 'not a number',
            height: -50,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('width'))).toBe(true);
      expect(result.errors.some(e => e.includes('height'))).toBe(true);
    });

    it('should reject block with non-numeric z-index', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            typeId: 'template-1',
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            z: 'not a number',
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Block at index 0 missing or invalid z-index');
    });

    it('should reject block that is not an object', () => {
      const data = {
        blocks: ['not an object'],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Block at index 0 is not an object');
    });

    it('should report errors for multiple invalid blocks', () => {
      const data = {
        blocks: [
          { id: 'block-1' }, // Missing most fields
          'not an object',
          null,
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });

  describe('Optional Fields Validation', () => {
    it('should validate correct canvas dimensions', () => {
      const data = {
        blocks: [],
        canvas: {
          width: 1200,
          height: 800,
        },
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid canvas object', () => {
      const data = {
        blocks: [],
        canvas: 'not an object',
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid canvas field: expected an object');
    });

    it('should reject invalid canvas dimensions', () => {
      const data = {
        blocks: [],
        canvas: {
          width: 'not a number',
          height: true,
        },
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('canvas.width'))).toBe(true);
      expect(result.errors.some(e => e.includes('canvas.height'))).toBe(true);
    });

    it('should reject invalid timestamp type', () => {
      const data = {
        blocks: [],
        timestamp: 123456,
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid timestamp field: expected a string');
    });
  });

  describe('Block Value Validation', () => {
    it('should reject blocks with empty id', () => {
      const data = {
        blocks: [
          {
            id: '',
            typeId: 'template-1',
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
    });

    it('should reject blocks with zero or negative dimensions', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            typeId: 'template-1',
            x: 100,
            y: 200,
            width: 0,
            height: -10,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
    });

    it('should reject blocks with infinite coordinates', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            typeId: 'template-1',
            x: Infinity,
            y: 200,
            width: 300,
            height: 150,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
    });

    it('should reject blocks with NaN values', () => {
      const data = {
        blocks: [
          {
            id: 'block-1',
            typeId: 'template-1',
            x: NaN,
            y: 200,
            width: 300,
            height: 150,
            z: 1,
            selected: false,
          },
        ],
      };

      const result = validateProjectData(data);

      expect(result.valid).toBe(false);
    });
  });
});

describe('parseAndValidateJSON', () => {
  it('should parse and validate valid JSON', () => {
    const validJSON = JSON.stringify({
      blocks: [
        {
          id: 'block-1',
          typeId: 'template-1',
          props: {},
          x: 100,
          y: 200,
          width: 300,
          height: 150,
          z: 1,
          selected: false,
        },
      ],
    });

    const result = parseAndValidateJSON(validJSON);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toBeDefined();
  });

  it('should handle invalid JSON syntax', () => {
    const invalidJSON = '{ "blocks": [not valid json }';

    const result = parseAndValidateJSON(invalidJSON);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('Invalid JSON format');
  });

  it('should validate parsed JSON structure', () => {
    const invalidDataJSON = JSON.stringify({
      // Missing blocks field
      canvas: { width: 1200, height: 800 },
    });

    const result = parseAndValidateJSON(invalidDataJSON);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: blocks');
  });

  it('should handle empty string', () => {
    const result = parseAndValidateJSON('');

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid JSON format');
  });

  it('should handle malformed JSON', () => {
    const malformedJSON = '{ blocks: [] }'; // Missing quotes around key

    const result = parseAndValidateJSON(malformedJSON);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid JSON format');
  });
});