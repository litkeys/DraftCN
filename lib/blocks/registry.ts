import { Block, BlockTemplate } from '../../types'
import { Hero1 } from '../../templates/hero1'
import { Navbar1 } from '../../templates/navbar1'
import { Footer2 } from '../../templates/footer2'

export class BlockRegistry {
  private templates: Map<string, BlockTemplate> = new Map()

  registerTemplate(template: BlockTemplate): void {
    this.templates.set(template.typeId, template)
  }

  getTemplate(typeId: string): BlockTemplate | undefined {
    return this.templates.get(typeId)
  }

  getTemplatesByCategory(category: string): BlockTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.category === category
    )
  }

  generateBlockInstance(
    typeId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overrideProps: any = {}
  ): Block | null {
    const template = this.getTemplate(typeId)
    if (!template) {
      return null
    }

    const uniqueId = `${typeId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`

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
    }
  }

  getAllTemplates(): BlockTemplate[] {
    return Array.from(this.templates.values())
  }

  getCategories(): string[] {
    const categories = new Set<string>()
    this.templates.forEach((template) => categories.add(template.category))
    return Array.from(categories)
  }

  hasTemplate(typeId: string): boolean {
    return this.templates.has(typeId)
  }

  removeTemplate(typeId: string): boolean {
    return this.templates.delete(typeId)
  }

  clear(): void {
    this.templates.clear()
  }

  getTemplateCount(): number {
    return this.templates.size
  }
}

// Export a singleton instance
export const blockRegistry = new BlockRegistry()

// Template Registration
// Manual registration of all available block templates with complete metadata

/**
 * Hero1 Template Registration
 * Large hero section with badge, heading, description, buttons, and image
 */
const hero1Template: BlockTemplate = {
  typeId: 'hero1',
  name: 'Hero Section 1',
  category: 'hero',
  thumbnail: '/thumbnails/hero1.svg',
  dependencies: ['lucide-react', '@radix-ui/react-icons'],
  defaultProps: {
    badge: '✨ Your Website Builder',
    heading: 'Blocks Built With Shadcn & Tailwind',
    description:
      'Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.',
    buttons: {
      primary: {
        text: 'Discover all components',
        url: 'https://www.shadcnblocks.com',
      },
      secondary: {
        text: 'View on GitHub',
        url: 'https://www.shadcnblocks.com',
      },
    },
    image: {
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg',
      alt: 'Hero section demo image showing interface components',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: Hero1,
  defaultWidth: 1200, // 60px × 20
  defaultHeight: 600, // 60px × 10
  minimumWidth: 300, // 60px × 5
  minimumHeight: 240, // 60px × 4
}

/**
 * Navbar1 Template Registration
 * Responsive navigation with logo, menu items, and authentication buttons
 */
const navbar1Template: BlockTemplate = {
  typeId: 'navbar1',
  name: 'Navigation Bar 1',
  category: 'navigation',
  thumbnail: '/thumbnails/navbar1.svg',
  dependencies: [
    'lucide-react',
    '@radix-ui/react-accordion',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-dialog',
  ],
  defaultProps: {
    logo: {
      url: 'https://www.shadcnblocks.com',
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg',
      alt: 'logo',
      title: 'Shadcnblocks.com',
    },
    menu: [
      { title: 'Home', url: '#' },
      {
        title: 'Products',
        url: '#',
        items: [
          {
            title: 'Blog',
            description: 'The latest industry news, updates, and info',
            url: '#',
          },
          {
            title: 'Company',
            description: 'Our mission is to innovate and empower the world',
            url: '#',
          },
        ],
      },
      { title: 'Pricing', url: '#' },
    ],
    auth: {
      login: { title: 'Login', url: '#' },
      signup: { title: 'Sign up', url: '#' },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: Navbar1,
  defaultWidth: 1200, // 60px × 20
  defaultHeight: 60, // 60px × 1
  minimumWidth: 300, // 60px × 5
  minimumHeight: 60, // 60px × 1
}

/**
 * Footer2 Template Registration
 * Multi-column footer with logo, menu sections, and bottom links
 */
const footer2Template: BlockTemplate = {
  typeId: 'footer2',
  name: 'Footer 2',
  category: 'footer',
  thumbnail: '/thumbnails/footer2.svg',
  dependencies: ['@radix-ui/react-context-menu'],
  defaultProps: {
    logo: {
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg',
      alt: 'blocks for shadcn/ui',
      title: 'Shadcnblocks.com',
      url: 'https://www.shadcnblocks.com',
    },
    tagline: 'Components made easy.',
    menuItems: [
      {
        title: 'Product',
        links: [
          { text: 'Overview', url: '#' },
          { text: 'Pricing', url: '#' },
          { text: 'Features', url: '#' },
        ],
      },
      {
        title: 'Company',
        links: [
          { text: 'About', url: '#' },
          { text: 'Careers', url: '#' },
          { text: 'Contact', url: '#' },
        ],
      },
    ],
    copyright: '© 2024 Shadcnblocks.com. All rights reserved.',
    bottomLinks: [
      { text: 'Terms and Conditions', url: '#' },
      { text: 'Privacy Policy', url: '#' },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: Footer2,
  defaultWidth: 1200, // 60px × 20
  defaultHeight: 480, // 60px × 8
  minimumWidth: 300, // 60px × 5
  minimumHeight: 240, // 60px × 4
}

// Register all templates with the singleton registry
blockRegistry.registerTemplate(hero1Template)
blockRegistry.registerTemplate(navbar1Template)
blockRegistry.registerTemplate(footer2Template)
