import { Block, BlockTemplate } from '../../types';

export class BlockRegistry {
  private templates: Map<string, BlockTemplate> = new Map();

  registerTemplate(template: BlockTemplate): void {
    this.templates.set(template.typeId, template);
  }

  getTemplate(typeId: string): BlockTemplate | undefined {
    return this.templates.get(typeId);
  }

  getTemplatesByCategory(category: string): BlockTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.category === category
    );
  }

  generateBlockInstance(
    typeId: string, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overrideProps: any = {}
  ): Block | null {
    const template = this.getTemplate(typeId);
    if (!template) {
      return null;
    }

    const uniqueId = `${typeId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    return {
      id: uniqueId,
      typeId: template.typeId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props: { ...template.defaultProps, ...overrideProps } as any,
      x: 0,
      y: 0,
      width: template.defaultWidth,
      height: template.defaultHeight,
      z: 0,
      selected: false,
    };
  }

  getAllTemplates(): BlockTemplate[] {
    return Array.from(this.templates.values());
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.templates.forEach(template => categories.add(template.category));
    return Array.from(categories);
  }

  hasTemplate(typeId: string): boolean {
    return this.templates.has(typeId);
  }

  removeTemplate(typeId: string): boolean {
    return this.templates.delete(typeId);
  }

  clear(): void {
    this.templates.clear();
  }

  getTemplateCount(): number {
    return this.templates.size;
  }
}

// Export a singleton instance
export const blockRegistry = new BlockRegistry();