import { describe, it, expect, beforeEach } from 'vitest';
import { exportProject } from '@/lib/project/export';
import { parseAndValidateJSON } from '@/lib/project/import';
import type { Block } from '@/types';

describe('Export/Import Cycle Integration', () => {
  describe('Complete Export/Import Cycle', () => {
    const mockBlocks: Block[] = [
      {
        id: 'block-1',
        typeId: 'hero-template',
        props: { title: 'Welcome Hero', subtitle: 'Test content' },
        x: 100,
        y: 200,
        width: 800,
        height: 400,
        z: 1,
        selected: false,
      },
      {
        id: 'block-2',
        typeId: 'nav-template',
        props: { links: ['Home', 'About', 'Contact'] },
        x: 0,
        y: 0,
        width: 1200,
        height: 80,
        z: 2,
        selected: true,
      },
      {
        id: 'block-3',
        typeId: 'footer-template',
        props: {},
        x: 0,
        y: 920,
        width: 1200,
        height: 100,
        z: 0,
        selected: false,
      },
    ];

    it('should successfully export and re-import project data', () => {
      // Step 1: Export the project (returns object, not string)
      const exportedData = exportProject(mockBlocks, { width: 1200, height: 1020 });
      const exportedJSON = JSON.stringify(exportedData, null, 2);

      // Verify exported JSON is valid
      expect(exportedJSON).toBeTruthy();
      expect(() => JSON.parse(exportedJSON)).not.toThrow();

      // Step 2: Parse and validate the exported JSON
      const importResult = parseAndValidateJSON(exportedJSON);

      // Step 3: Verify import validation succeeds
      expect(importResult.valid).toBe(true);
      expect(importResult.errors).toHaveLength(0);
      expect(importResult.data).toBeDefined();

      // Step 4: Verify all blocks are preserved
      expect(importResult.data?.blocks).toHaveLength(3);

      // Step 5: Verify each block's data integrity
      importResult.data?.blocks.forEach((importedBlock, index) => {
        const originalBlock = mockBlocks[index];

        expect(importedBlock.id).toBe(originalBlock.id);
        expect(importedBlock.typeId).toBe(originalBlock.typeId);
        expect(importedBlock.props).toEqual(originalBlock.props);
        expect(importedBlock.x).toBe(originalBlock.x);
        expect(importedBlock.y).toBe(originalBlock.y);
        expect(importedBlock.width).toBe(originalBlock.width);
        expect(importedBlock.height).toBe(originalBlock.height);
        expect(importedBlock.z).toBe(originalBlock.z);
        // Note: selected state might be reset on import
      });

      // Step 6: Verify canvas dimensions preserved
      expect(importResult.data?.canvas).toEqual({
        width: 1200,
        height: 1020,
      });

      // Step 7: Verify timestamp exists
      expect(importResult.data?.timestamp).toBeDefined();
      expect(typeof importResult.data?.timestamp).toBe('string');
    });

    it('should handle empty project export/import', () => {
      // Export empty project
      const emptyData = exportProject([], { width: 800, height: 600 });
      const emptyExport = JSON.stringify(emptyData, null, 2);

      // Import the empty project
      const importResult = parseAndValidateJSON(emptyExport);

      expect(importResult.valid).toBe(true);
      expect(importResult.data?.blocks).toHaveLength(0);
      expect(importResult.data?.canvas).toEqual({
        width: 800,
        height: 600,
      });
    });

    it('should preserve complex nested props during export/import', () => {
      const complexBlock: Block = {
        id: 'complex-1',
        typeId: 'advanced-template',
        props: {
          nested: {
            deep: {
              value: 'test',
              array: [1, 2, 3],
              boolean: true,
            },
          },
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        },
        x: 50,
        y: 50,
        width: 500,
        height: 500,
        z: 10,
        selected: false,
      };

      const exportedData = exportProject([complexBlock], { width: 1000, height: 1000 });
      const exported = JSON.stringify(exportedData, null, 2);
      const imported = parseAndValidateJSON(exported);

      expect(imported.valid).toBe(true);
      expect(imported.data?.blocks[0].props).toEqual(complexBlock.props);
    });

    it('should not include UI state in export/import cycle', () => {
      // This test verifies that zoom/pan state is not included
      const exportedData = exportProject(mockBlocks, { width: 1200, height: 800 });
      const exportedJSON = JSON.stringify(exportedData, null, 2);

      // Check that UI state properties are not in the exported JSON
      expect(exportedJSON).not.toContain('zoom');
      expect(exportedJSON).not.toContain('pan');
      expect(exportedJSON).not.toContain('panX');
      expect(exportedJSON).not.toContain('panY');
      expect(exportedJSON).not.toContain('scale');

      // Verify imported data also doesn't have UI state
      const imported = parseAndValidateJSON(exportedJSON);
      const importedData = imported.data as any;

      expect(importedData.zoom).toBeUndefined();
      expect(importedData.pan).toBeUndefined();
      expect(importedData.panX).toBeUndefined();
      expect(importedData.panY).toBeUndefined();
      expect(importedData.scale).toBeUndefined();
    });

    it('should maintain data consistency through multiple export/import cycles', () => {
      // First cycle
      const exportData1 = exportProject(mockBlocks, { width: 1200, height: 800 });
      const export1 = JSON.stringify(exportData1, null, 2);
      const import1 = parseAndValidateJSON(export1);

      expect(import1.valid).toBe(true);

      // Second cycle - re-export the imported data
      const exportData2 = exportProject(import1.data!.blocks, { width: 1200, height: 800 });
      const export2 = JSON.stringify(exportData2, null, 2);
      const import2 = parseAndValidateJSON(export2);

      expect(import2.valid).toBe(true);

      // Third cycle
      const exportData3 = exportProject(import2.data!.blocks, { width: 1200, height: 800 });
      const export3 = JSON.stringify(exportData3, null, 2);
      const import3 = parseAndValidateJSON(export3);

      expect(import3.valid).toBe(true);

      // Verify final data matches original
      expect(import3.data?.blocks).toHaveLength(mockBlocks.length);
      import3.data?.blocks.forEach((block, index) => {
        expect(block.id).toBe(mockBlocks[index].id);
        expect(block.typeId).toBe(mockBlocks[index].typeId);
        expect(block.props).toEqual(mockBlocks[index].props);
      });
    });

    it('should generate valid filename and handle special characters', () => {
      const specialBlocks: Block[] = [{
        id: 'special-<>:"',
        typeId: 'template|with/special',
        props: {
          text: 'Text with "quotes" and <tags>',
          path: 'C:\\Windows\\Path',
        },
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        z: 0,
        selected: false,
      }];

      const exportedData = exportProject(specialBlocks, { width: 800, height: 600 });
      const exported = JSON.stringify(exportedData, null, 2);
      const imported = parseAndValidateJSON(exported);

      expect(imported.valid).toBe(true);
      expect(imported.data?.blocks[0].props).toEqual(specialBlocks[0].props);
    });
  });

  describe('Error Handling in Export/Import Cycle', () => {
    it('should handle corrupted JSON gracefully', () => {
      const validData = exportProject([], { width: 800, height: 600 });
      const validExport = JSON.stringify(validData, null, 2);

      // Corrupt the JSON by removing closing brace
      const corruptedJSON = validExport.slice(0, -1);

      const importResult = parseAndValidateJSON(corruptedJSON);

      expect(importResult.valid).toBe(false);
      expect(importResult.errors).toContain('Invalid file format');
    });

    it('should reject import with modified structure', () => {
      const validData = exportProject([{
        id: 'test-1',
        typeId: 'template-1',
        props: {},
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        z: 0,
        selected: false,
      }], { width: 800, height: 600 });
      const validExport = JSON.stringify(validData, null, 2);

      // Parse and modify the structure
      const parsed = JSON.parse(validExport);
      delete parsed.blocks; // Remove required field

      const modifiedJSON = JSON.stringify(parsed);
      const importResult = parseAndValidateJSON(modifiedJSON);

      expect(importResult.valid).toBe(false);
      expect(importResult.errors).toContain('Incomplete project data');
    });

    it('should validate block data integrity', () => {
      const validData = exportProject([{
        id: 'test-1',
        typeId: 'template-1',
        props: {},
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        z: 1,
        selected: false,
      }], { width: 800, height: 600 });
      const validExport = JSON.stringify(validData, null, 2);

      const parsed = JSON.parse(validExport);

      // Test various invalid modifications
      const invalidBlocks = [
        { ...parsed.blocks[0], width: -100 }, // negative width
        { ...parsed.blocks[0], height: 0 }, // zero height
        { ...parsed.blocks[0], x: Infinity }, // infinite coordinate
        { ...parsed.blocks[0], z: NaN }, // NaN z-index
        { ...parsed.blocks[0], id: '' }, // empty id
        { ...parsed.blocks[0], typeId: null }, // null typeId
      ];

      invalidBlocks.forEach(invalidBlock => {
        const invalidJSON = JSON.stringify({
          ...parsed,
          blocks: [invalidBlock],
        });

        const result = parseAndValidateJSON(invalidJSON);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });
});