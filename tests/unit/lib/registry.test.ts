import { BlockRegistry, blockRegistry } from '../../../lib/blocks/registry';
import { BlockTemplate } from '../../../types';

describe('BlockRegistry', () => {
  let registry: BlockRegistry;

  beforeEach(() => {
    registry = new BlockRegistry();
  });

  describe('Template Registration and Retrieval', () => {
    const mockTemplate: BlockTemplate = {
      typeId: 'test-hero',
      name: 'Test Hero',
      category: 'hero',
      thumbnail: '/thumbnails/test-hero.png',
      dependencies: ['lucide-react'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultProps: { title: 'Default Title', subtitle: 'Default Subtitle' } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: (() => null) as any,
      defaultWidth: 1200,
      defaultHeight: 600,
      minimumWidth: 300,
      minimumHeight: 200,
    };

    it('should register a template successfully', () => {
      registry.registerTemplate(mockTemplate);
      expect(registry.hasTemplate('test-hero')).toBe(true);
      expect(registry.getTemplateCount()).toBe(1);
    });

    it('should retrieve a registered template by typeId', () => {
      registry.registerTemplate(mockTemplate);
      const retrieved = registry.getTemplate('test-hero');
      
      expect(retrieved).toEqual(mockTemplate);
      expect(retrieved?.typeId).toBe('test-hero');
      expect(retrieved?.name).toBe('Test Hero');
    });

    it('should return undefined for non-existent template', () => {
      const retrieved = registry.getTemplate('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should overwrite template with same typeId', () => {
      registry.registerTemplate(mockTemplate);
      
      const updatedTemplate = { ...mockTemplate, name: 'Updated Hero' };
      registry.registerTemplate(updatedTemplate);
      
      const retrieved = registry.getTemplate('test-hero');
      expect(retrieved?.name).toBe('Updated Hero');
      expect(registry.getTemplateCount()).toBe(1);
    });
  });

  describe('Category Filtering', () => {
    const heroTemplate: BlockTemplate = {
      typeId: 'hero1',
      name: 'Hero 1',
      category: 'hero',
      thumbnail: '/thumbnails/hero1.png',
      dependencies: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultProps: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: (() => null) as any,
      defaultWidth: 1200,
      defaultHeight: 600,
      minimumWidth: 300,
      minimumHeight: 200,
    };

    const navbarTemplate: BlockTemplate = {
      typeId: 'navbar1',
      name: 'Navbar 1',
      category: 'navigation',
      thumbnail: '/thumbnails/navbar1.png',
      dependencies: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultProps: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: (() => null) as any,
      defaultWidth: 1200,
      defaultHeight: 80,
      minimumWidth: 300,
      minimumHeight: 60,
    };

    beforeEach(() => {
      registry.registerTemplate(heroTemplate);
      registry.registerTemplate(navbarTemplate);
    });

    it('should filter templates by category', () => {
      const heroTemplates = registry.getTemplatesByCategory('hero');
      const navTemplates = registry.getTemplatesByCategory('navigation');
      
      expect(heroTemplates).toHaveLength(1);
      expect(heroTemplates[0].typeId).toBe('hero1');
      
      expect(navTemplates).toHaveLength(1);
      expect(navTemplates[0].typeId).toBe('navbar1');
    });

    it('should return empty array for non-existent category', () => {
      const templates = registry.getTemplatesByCategory('non-existent');
      expect(templates).toHaveLength(0);
    });

    it('should return all unique categories', () => {
      const categories = registry.getCategories();
      expect(categories).toContain('hero');
      expect(categories).toContain('navigation');
      expect(categories).toHaveLength(2);
    });
  });

  describe('Block Instance Generation', () => {
    const template: BlockTemplate = {
      typeId: 'test-block',
      name: 'Test Block',
      category: 'test',
      thumbnail: '/thumbnails/test.png',
      dependencies: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultProps: { title: 'Default', count: 0, enabled: true } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: (() => null) as any,
      defaultWidth: 800,
      defaultHeight: 400,
      minimumWidth: 200,
      minimumHeight: 100,
    };

    beforeEach(() => {
      registry.registerTemplate(template);
    });

    it('should generate block instance with unique ID', () => {
      const block1 = registry.generateBlockInstance('test-block');
      const block2 = registry.generateBlockInstance('test-block');
      
      expect(block1).toBeTruthy();
      expect(block2).toBeTruthy();
      expect(block1!.id).not.toBe(block2!.id);
      expect(block1!.id).toMatch(/^test-block-\d+-[a-z0-9]+$/);
    });

    it('should create block with template defaults', () => {
      const block = registry.generateBlockInstance('test-block');
      
      expect(block).toMatchObject({
        typeId: 'test-block',
        props: { title: 'Default', count: 0, enabled: true },
        x: 0,
        y: 0,
        width: 800,
        height: 400,
        z: 0,
        selected: false,
      });
    });

    it('should merge override props with defaults', () => {
      const overrides = { title: 'Custom Title', count: 5 };
      const block = registry.generateBlockInstance('test-block', overrides);
      
      expect(block!.props).toMatchObject({
        title: 'Custom Title',
        count: 5,
        enabled: true, // Default preserved
      });
    });

    it('should return null for non-existent template', () => {
      const block = registry.generateBlockInstance('non-existent');
      expect(block).toBeNull();
    });
  });

  describe('Registry Management', () => {
    const template1: BlockTemplate = {
      typeId: 'template1',
      name: 'Template 1',
      category: 'test',
      thumbnail: '/thumbnails/template1.png',
      dependencies: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultProps: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: (() => null) as any,
      defaultWidth: 400,
      defaultHeight: 200,
      minimumWidth: 100,
      minimumHeight: 50,
    };

    const template2: BlockTemplate = {
      typeId: 'template2',
      name: 'Template 2',
      category: 'test',
      thumbnail: '/thumbnails/template2.png',
      dependencies: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultProps: {} as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: (() => null) as any,
      defaultWidth: 600,
      defaultHeight: 300,
      minimumWidth: 150,
      minimumHeight: 75,
    };

    it('should get all templates', () => {
      registry.registerTemplate(template1);
      registry.registerTemplate(template2);
      
      const allTemplates = registry.getAllTemplates();
      expect(allTemplates).toHaveLength(2);
      expect(allTemplates.map(t => t.typeId)).toContain('template1');
      expect(allTemplates.map(t => t.typeId)).toContain('template2');
    });

    it('should remove template by typeId', () => {
      registry.registerTemplate(template1);
      registry.registerTemplate(template2);
      
      const removed = registry.removeTemplate('template1');
      expect(removed).toBe(true);
      expect(registry.hasTemplate('template1')).toBe(false);
      expect(registry.hasTemplate('template2')).toBe(true);
      expect(registry.getTemplateCount()).toBe(1);
    });

    it('should return false when removing non-existent template', () => {
      const removed = registry.removeTemplate('non-existent');
      expect(removed).toBe(false);
    });

    it('should clear all templates', () => {
      registry.registerTemplate(template1);
      registry.registerTemplate(template2);
      
      registry.clear();
      expect(registry.getTemplateCount()).toBe(0);
      expect(registry.getAllTemplates()).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing template gracefully in generateBlockInstance', () => {
      const block = registry.generateBlockInstance('missing-template');
      expect(block).toBeNull();
    });

    it('should handle empty category filter', () => {
      const templates = registry.getTemplatesByCategory('');
      expect(templates).toHaveLength(0);
    });
  });
});

describe('Singleton Registry', () => {
  it('should provide a singleton instance', () => {
    expect(blockRegistry).toBeInstanceOf(BlockRegistry);
    expect(blockRegistry).toBe(blockRegistry); // Same reference
  });
});