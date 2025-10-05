import { Block, BlockTemplate } from '../../types'
import { Hero1 } from '@/templates/hero1'
import { Navbar1 } from '@/templates/navbar1'
import { Footer2 } from '@/templates/footer2'
import { About3 } from '@/templates/about3'
import { Blog7 } from '@/templates/blog7'
import { Feature43 } from '@/templates/feature43'
import { Codeexample1 } from '@/templates/codeexample1'
import { Casestudies2 } from '@/templates/casestudies2'
import { Gallery6 } from '@/templates/gallery6'

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
    // Define the desired category display order
    const categoryOrder = [
      'navigation',
      'hero',
      'features',
      'media',
      'marketing',
      'footer',
      'blog',
      'about',
    ]

    // Collect all unique categories from templates
    const availableCategories = new Set<string>()
    this.templates.forEach((template) =>
      availableCategories.add(template.category)
    )

    // Return categories in the defined order, only including those that exist
    return categoryOrder.filter((category) => availableCategories.has(category))
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
  thumbnail: '/thumbnails/hero1.webp',
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
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 440, // 40px × 11
  minimumWidth: 320, // 40px × 8
  minimumHeight: 240, // 40px × 6
}

/**
 * Navbar1 Template Registration
 * Responsive navigation with logo, menu items, and authentication buttons
 */
const navbar1Template: BlockTemplate = {
  typeId: 'navbar1',
  name: 'Navigation Bar 1',
  category: 'navigation',
  thumbnail: '/thumbnails/navbar1.webp',
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
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 80, // 40px × 2
  minimumWidth: 320, // 40px × 8
  minimumHeight: 40, // 40px × 1
}

/**
 * Footer2 Template Registration
 * Multi-column footer with logo, menu sections, and bottom links
 */
const footer2Template: BlockTemplate = {
  typeId: 'footer2',
  name: 'Footer 2',
  category: 'footer',
  thumbnail: '/thumbnails/footer2.webp',
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
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 360, // 40px × 9
  minimumWidth: 320, // 40px × 8
  minimumHeight: 240, // 40px × 6
}

/**
 * About3 Template Registration
 * Comprehensive about section with images, breakout content, companies, and achievements
 */
const about3Template: BlockTemplate = {
  typeId: 'about3',
  name: 'About Section 3',
  category: 'about',
  thumbnail: '/thumbnails/about3.webp',
  dependencies: ['@/components/ui/button'],
  defaultProps: {
    title: 'About Us',
    description:
      'Shadcnblocks is a passionate team dedicated to creating innovative solutions that empower businesses to thrive in the digital age.',
    mainImage: {
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg',
      alt: 'placeholder',
    },
    secondaryImage: {
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg',
      alt: 'placeholder',
    },
    breakout: {
      src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg',
      alt: 'logo',
      title: 'Hundreds of blocks at Shadcnblocks.com',
      description:
        'Providing businesses with effective tools to improve workflows, boost efficiency, and encourage growth.',
      buttonText: 'Discover more',
      buttonUrl: 'https://shadcnblocks.com',
    },
    companiesTitle: 'Valued by clients worldwide',
    companies: [
      {
        src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-1.svg',
        alt: 'Arc',
      },
      {
        src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-2.svg',
        alt: 'Descript',
      },
      {
        src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-3.svg',
        alt: 'Mercury',
      },
      {
        src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-4.svg',
        alt: 'Ramp',
      },
      {
        src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-5.svg',
        alt: 'Retool',
      },
      {
        src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/company/fictional-company-logo-6.svg',
        alt: 'Watershed',
      },
    ],
    achievementsTitle: 'Our Achievements in Numbers',
    achievementsDescription:
      'Providing businesses with effective tools to improve workflows, boost efficiency, and encourage growth.',
    achievements: [
      { label: 'Companies Supported', value: '300+' },
      { label: 'Projects Finalized', value: '800+' },
      { label: 'Happy Customers', value: '99%' },
      { label: 'Recognized Awards', value: '10+' },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: About3,
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 1520, // 40px × 38 (larger for content-rich section)
  minimumWidth: 320, // 40px × 8
  minimumHeight: 1200, // 40px × 30
}

/**
 * Blog7 Template Registration
 * Blog section with featured posts in a card grid layout
 */
const blog7Template: BlockTemplate = {
  typeId: 'blog7',
  name: 'Blog Section 7',
  category: 'blog',
  thumbnail: '/thumbnails/blog7.webp',
  dependencies: [
    'lucide-react',
    '@/components/ui/badge',
    '@/components/ui/button',
    '@/components/ui/card',
  ],
  defaultProps: {
    tagline: 'Latest Updates',
    heading: 'Blog Posts',
    description:
      'Discover the latest trends, tips, and best practices in modern web development. From UI components to design systems, stay updated with our expert insights.',
    buttonText: 'View all articles',
    buttonUrl: 'https://shadcnblocks.com',
    posts: [
      {
        id: 'post-1',
        title: 'Getting Started with shadcn/ui Components',
        summary:
          "Learn how to quickly integrate and customize shadcn/ui components in your Next.js projects. We'll cover installation, theming, and best practices for building modern interfaces.",
        label: 'Tutorial',
        author: 'Sarah Chen',
        published: '1 Jan 2024',
        url: 'https://shadcnblocks.com',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
      {
        id: 'post-2',
        title: 'Building Accessible Web Applications',
        summary:
          "Explore how to create inclusive web experiences using shadcn/ui's accessible components. Discover practical tips for implementing ARIA labels, keyboard navigation, and semantic HTML.",
        label: 'Accessibility',
        author: 'Marcus Rodriguez',
        published: '1 Jan 2024',
        url: 'https://shadcnblocks.com',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
      {
        id: 'post-3',
        title: 'Modern Design Systems with Tailwind CSS',
        summary:
          'Dive into creating scalable design systems using Tailwind CSS and shadcn/ui. Learn how to maintain consistency while building flexible and maintainable component libraries.',
        label: 'Design Systems',
        author: 'Emma Thompson',
        published: '1 Jan 2024',
        url: 'https://shadcnblocks.com',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: Blog7,
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 920, // 40px × 23
  minimumWidth: 320, // 40px × 8
  minimumHeight: 1000, // 40px × 25
}

/**
 * Feature43 Template Registration
 * Features section with icon grid layout showing reasons/benefits
 */
const feature43Template: BlockTemplate = {
  typeId: 'feature43',
  name: 'Features Grid 43',
  category: 'features',
  thumbnail: '/thumbnails/feature43.webp',
  dependencies: ['lucide-react'],
  defaultProps: {
    heading: 'Why Work With Us?',
    reasons: [
      {
        title: 'Quality',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?',
        icon: 'GitPullRequest',
      },
      {
        title: 'Experience',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?',
        icon: 'SquareKanban',
      },
      {
        title: 'Support',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?',
        icon: 'RadioTower',
      },
      {
        title: 'Innovation',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?',
        icon: 'WandSparkles',
      },
      {
        title: 'Results',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?',
        icon: 'Layers',
      },
      {
        title: 'Efficiency',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe est aliquid exercitationem, quos explicabo repellat?',
        icon: 'BatteryCharging',
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: Feature43,
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 640, // 40px × 16
  minimumWidth: 320, // 40px × 8
  minimumHeight: 600, // 40px × 15
}

/**
 * Codeexample1 Template Registration
 * Code example section with tabbed language selection and syntax highlighting
 */
const codeexample1Template: BlockTemplate = {
  typeId: 'codeexample1',
  name: 'Code Example Section',
  category: 'features',
  thumbnail: '/thumbnails/codeexample1.webp',
  dependencies: [
    'lucide-react',
    '@/components/ui/kibo-ui/code-block',
    '@/components/ui/button',
    '@/components/ui/scroll-area',
    '@/components/ui/tabs',
  ],
  defaultProps: {},
  component: Codeexample1,
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 560, // 40px × 14
  minimumWidth: 800, // 40px × 20
  minimumHeight: 480, // 40px × 12
}

/**
 * Casestudies2 Template Registration
 * Case studies section with testimonials and metrics
 */
const casestudies2Template: BlockTemplate = {
  typeId: 'casestudies2',
  name: 'Case Studies 2',
  category: 'marketing',
  thumbnail: '/thumbnails/casestudies2.webp',
  dependencies: ['@/components/ui/separator'],
  defaultProps: {
    // No props needed as all content is hardcoded in the component
  },
  component: Casestudies2,
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 1000, // 40px × 25
  minimumWidth: 320, // 40px × 8
  minimumHeight: 800, // 40px × 20
}

/**
 * Gallery6 Template Registration
 * Gallery carousel section with navigation controls
 */
const gallery6Template: BlockTemplate = {
  typeId: 'gallery6',
  name: 'Gallery Carousel 6',
  category: 'media',
  thumbnail: '/thumbnails/gallery6.webp',
  dependencies: [
    'lucide-react',
    '@/components/ui/button',
    '@/components/ui/carousel',
  ],
  defaultProps: {
    heading: 'Gallery',
    demoUrl: 'https://www.shadcnblocks.com',
    items: [
      {
        id: 'item-1',
        title: 'Build Modern UIs',
        summary:
          'Create stunning user interfaces with our comprehensive design system.',
        url: '#',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
      {
        id: 'item-2',
        title: 'Computer Vision Technology',
        summary:
          'Powerful image recognition and processing capabilities that allow AI systems to analyze, understand, and interpret visual information from the world.',
        url: '#',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
      {
        id: 'item-3',
        title: 'Machine Learning Automation',
        summary:
          'Self-improving algorithms that learn from data patterns to automate complex tasks and make intelligent decisions with minimal human intervention.',
        url: '#',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
      {
        id: 'item-4',
        title: 'Predictive Analytics',
        summary:
          'Advanced forecasting capabilities that analyze historical data to predict future trends and outcomes, helping businesses make data-driven decisions.',
        url: '#',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
      {
        id: 'item-5',
        title: 'Neural Network Architecture',
        summary:
          'Sophisticated AI models inspired by human brain structure, capable of solving complex problems through deep learning and pattern recognition.',
        url: '#',
        image:
          'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg',
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
  component: Gallery6,
  defaultWidth: 1200, // 40px × 30
  defaultHeight: 720, // 40px × 18
  minimumWidth: 320, // 40px × 8
  minimumHeight: 600, // 40px × 15
}

// Register all templates with the singleton registry
blockRegistry.registerTemplate(hero1Template)
blockRegistry.registerTemplate(navbar1Template)
blockRegistry.registerTemplate(footer2Template)
blockRegistry.registerTemplate(about3Template)
blockRegistry.registerTemplate(blog7Template)
blockRegistry.registerTemplate(feature43Template)
blockRegistry.registerTemplate(codeexample1Template)
blockRegistry.registerTemplate(casestudies2Template)
blockRegistry.registerTemplate(gallery6Template)
