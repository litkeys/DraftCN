import type { Block } from '@/types';
import type { ProjectData } from './export';

/**
 * Validation result for project data
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: ProjectData;
}

/**
 * Type guard to check if a value is a valid Block
 */
function isValidBlock(block: unknown): block is Block {
  if (typeof block !== 'object' || block === null) {
    return false;
  }

  const b = block as Record<string, unknown>;

  // Check required fields exist
  if (
    typeof b.id !== 'string' ||
    typeof b.typeId !== 'string' ||
    typeof b.x !== 'number' ||
    typeof b.y !== 'number' ||
    typeof b.width !== 'number' ||
    typeof b.height !== 'number' ||
    typeof b.z !== 'number' ||
    typeof b.selected !== 'boolean'
  ) {
    return false;
  }

  // Check for valid values
  if (
    b.id === '' ||
    b.typeId === '' ||
    (b.width as number) <= 0 ||
    (b.height as number) <= 0 ||
    !isFinite(b.x as number) ||
    !isFinite(b.y as number) ||
    !isFinite(b.z as number)
  ) {
    return false;
  }

  return true;
}

/**
 * Validate project data structure and contents
 * @param data - The data to validate (parsed from JSON)
 * @returns ValidationResult with validity status and any errors
 */
export function validateProjectData(data: unknown): ValidationResult {
  const errors: string[] = [];

  // Check if data is an object (arrays are objects in JS, so check explicitly)
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['Invalid file format: expected an object'],
    };
  }

  const projectData = data as Record<string, unknown>;

  // Check for required top-level fields
  if (!('blocks' in projectData)) {
    errors.push('Missing required field: blocks');
  }

  // Validate blocks array
  if ('blocks' in projectData) {
    if (!Array.isArray(projectData.blocks)) {
      errors.push('Invalid blocks field: expected an array');
    } else {
      // Validate each block
      projectData.blocks.forEach((block, index) => {
        if (!isValidBlock(block)) {
          // Check specific missing/invalid fields for better error messages
          if (typeof block !== 'object' || block === null) {
            errors.push(`Block at index ${index} is not an object`);
          } else {
            const b = block as Record<string, unknown>;
            if (typeof b.id !== 'string') {
              errors.push(`Block at index ${index} missing or invalid id`);
            } else if (b.id === '') {
              errors.push(`Block at index ${index} has empty id`);
            }
            if (typeof b.typeId !== 'string') {
              errors.push(`Block at index ${index} missing or invalid typeId`);
            } else if (b.typeId === '') {
              errors.push(`Block at index ${index} has empty typeId`);
            }
            if (typeof b.x !== 'number') {
              errors.push(`Block at index ${index} missing or invalid x coordinate`);
            } else if (!isFinite(b.x as number)) {
              errors.push(`Block at index ${index} has invalid x coordinate (infinite or NaN)`);
            }
            if (typeof b.y !== 'number') {
              errors.push(`Block at index ${index} missing or invalid y coordinate`);
            } else if (!isFinite(b.y as number)) {
              errors.push(`Block at index ${index} has invalid y coordinate (infinite or NaN)`);
            }
            if (typeof b.width !== 'number') {
              errors.push(`Block at index ${index} missing or invalid width`);
            } else if ((b.width as number) <= 0) {
              errors.push(`Block at index ${index} has invalid width (must be positive)`);
            } else if (!isFinite(b.width as number)) {
              errors.push(`Block at index ${index} has invalid width (infinite or NaN)`);
            }
            if (typeof b.height !== 'number') {
              errors.push(`Block at index ${index} missing or invalid height`);
            } else if ((b.height as number) <= 0) {
              errors.push(`Block at index ${index} has invalid height (must be positive)`);
            } else if (!isFinite(b.height as number)) {
              errors.push(`Block at index ${index} has invalid height (infinite or NaN)`);
            }
            if (typeof b.z !== 'number') {
              errors.push(`Block at index ${index} missing or invalid z-index`);
            } else if (!isFinite(b.z as number)) {
              errors.push(`Block at index ${index} has invalid z-index (infinite or NaN)`);
            }
          }
        }
      });
    }
  }

  // Check optional canvas field if present
  if ('canvas' in projectData) {
    if (typeof projectData.canvas !== 'object' || projectData.canvas === null) {
      errors.push('Invalid canvas field: expected an object');
    } else {
      const canvas = projectData.canvas as Record<string, unknown>;
      if ('width' in canvas && typeof canvas.width !== 'number') {
        errors.push('Invalid canvas.width: expected a number');
      }
      if ('height' in canvas && typeof canvas.height !== 'number') {
        errors.push('Invalid canvas.height: expected a number');
      }
    }
  }

  // Check optional timestamp field if present
  if ('timestamp' in projectData && typeof projectData.timestamp !== 'string') {
    errors.push('Invalid timestamp field: expected a string');
  }

  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    errors: [],
    data: projectData as unknown as ProjectData,
  };
}

/**
 * Parse JSON string and validate as project data
 * @param jsonString - The JSON string to parse and validate
 * @returns ValidationResult with parsed data if valid
 */
export function parseAndValidateJSON(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return validateProjectData(parsed);
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid JSON format: ' + (error as Error).message],
    };
  }
}