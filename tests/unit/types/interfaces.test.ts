import { Block, BlockTemplate, CanvasState } from '../../../types';

describe('Block System Interfaces', () => {
  describe('Block Interface', () => {
    it('should have all required properties with correct types', () => {
      const block: Block = {
        id: 'test-block-1',
        typeId: 'hero1',
        props: { title: 'Test Hero' },
        x: 100,
        y: 200,
        width: 1200,
        height: 600,
        z: 1,
        selected: false,
      };

      expect(typeof block.id).toBe('string');
      expect(typeof block.typeId).toBe('string');
      expect(typeof block.props).toBe('object');
      expect(typeof block.x).toBe('number');
      expect(typeof block.y).toBe('number');
      expect(typeof block.width).toBe('number');
      expect(typeof block.height).toBe('number');
      expect(typeof block.z).toBe('number');
      expect(typeof block.selected).toBe('boolean');
    });

    it('should support pixel-based positioning', () => {
      const block: Block = {
        id: 'positioned-block',
        typeId: 'navbar1',
        props: {},
        x: 0,
        y: 0,
        width: 1200,
        height: 80,
        z: 0,
        selected: true,
      };

      expect(Number.isInteger(block.x)).toBe(true);
      expect(Number.isInteger(block.y)).toBe(true);
      expect(Number.isInteger(block.width)).toBe(true);
      expect(Number.isInteger(block.height)).toBe(true);
    });
  });

  describe('BlockTemplate Interface', () => {
    it('should have all required properties with correct types', () => {
      const MockComponent = () => null;
      
      const template: BlockTemplate = {
        typeId: 'hero1',
        name: 'Hero Section 1',
        category: 'hero',
        thumbnail: '/thumbnails/hero1.png',
        dependencies: ['@radix-ui/react-icons', 'lucide-react'],
        defaultProps: { title: 'Default Title' },
        component: MockComponent,
        defaultWidth: 1200,
        defaultHeight: 600,
        minimumWidth: 300,
        minimumHeight: 200,
      };

      expect(typeof template.typeId).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.category).toBe('string');
      expect(typeof template.thumbnail).toBe('string');
      expect(Array.isArray(template.dependencies)).toBe(true);
      expect(typeof template.defaultProps).toBe('object');
      expect(typeof template.component).toBe('function');
      expect(typeof template.defaultWidth).toBe('number');
      expect(typeof template.defaultHeight).toBe('number');
      expect(typeof template.minimumWidth).toBe('number');
      expect(typeof template.minimumHeight).toBe('number');
    });
  });

  describe('CanvasState Interface', () => {
    it('should have all required properties with correct types', () => {
      const canvasState: CanvasState = {
        blocks: [],
        selectedBlockIds: [],
        canvasWidth: 1920,
        canvasHeight: 1080,
        zoom: 1.0,
        panX: 0,
        panY: 0,
      };

      expect(Array.isArray(canvasState.blocks)).toBe(true);
      expect(Array.isArray(canvasState.selectedBlockIds)).toBe(true);
      expect(typeof canvasState.canvasWidth).toBe('number');
      expect(typeof canvasState.canvasHeight).toBe('number');
      expect(typeof canvasState.zoom).toBe('number');
      expect(typeof canvasState.panX).toBe('number');
      expect(typeof canvasState.panY).toBe('number');
    });

    it('should support multiple selected blocks', () => {
      const canvasState: CanvasState = {
        blocks: [],
        selectedBlockIds: ['block-1', 'block-2', 'block-3'],
        canvasWidth: 1920,
        canvasHeight: 1080,
        zoom: 1.0,
        panX: 0,
        panY: 0,
      };

      expect(canvasState.selectedBlockIds.length).toBe(3);
      canvasState.selectedBlockIds.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });
  });
});