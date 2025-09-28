import { describe, it, expect } from 'vitest';
import { globalsCssSource, getGlobalsCss } from '@/lib/project/globals.css.source';

describe('globals.css.source', () => {
  describe('globalsCssSource', () => {
    it('should be a non-empty string', () => {
      expect(typeof globalsCssSource).toBe('string');
      expect(globalsCssSource.length).toBeGreaterThan(0);
    });

    it('should contain Tailwind CSS directives', () => {
      expect(globalsCssSource).toContain('@import "tailwindcss"');
      expect(globalsCssSource).toContain('@plugin "@tailwindcss/typography"');
    });

    it('should contain font imports', () => {
      const fonts = [
        'Roboto',
        'Roboto\\+Mono', // Escaped plus sign for regex
        'Anton',
        'Playfair\\+Display',
        'Caveat',
        'Bebas\\+Neue',
        'Instrument\\+Serif',
        'Merriweather',
        'Figtree',
        'Ubuntu',
        'Inter',
        'Poppins',
        'Geist',
        'Nunito'
      ];

      fonts.forEach(font => {
        // Handle both encoded (%2B) and non-encoded (+) plus signs in URLs
        const pattern = font.replace('\\+', '(\\+|%2B)');
        expect(globalsCssSource).toMatch(new RegExp(`@import url.*${pattern}`, 'i'));
      });
    });

    it('should contain CSS custom properties for theming', () => {
      const cssVariables = [
        '--background',
        '--foreground',
        '--primary',
        '--secondary',
        '--muted',
        '--accent',
        '--destructive',
        '--border',
        '--input',
        '--ring',
        '--radius'
      ];

      cssVariables.forEach(variable => {
        expect(globalsCssSource).toContain(variable);
      });
    });

    it('should contain dark mode styles', () => {
      expect(globalsCssSource).toContain('.dark {');
      expect(globalsCssSource).toContain('@custom-variant dark');
    });

    it('should define chart color variables', () => {
      const chartVars = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
      chartVars.forEach(chartVar => {
        expect(globalsCssSource).toContain(chartVar);
      });
    });

    it('should contain shadow variables', () => {
      const shadowVars = [
        '--shadow-2xs',
        '--shadow-xs',
        '--shadow-sm',
        '--shadow',
        '--shadow-md',
        '--shadow-lg',
        '--shadow-xl',
        '--shadow-2xl'
      ];

      shadowVars.forEach(shadow => {
        expect(globalsCssSource).toContain(shadow);
      });
    });

    it('should contain animation keyframes', () => {
      const animations = [
        '@keyframes accordion-down',
        '@keyframes accordion-up',
        '@keyframes fade-in',
        '@keyframes fade-in-out',
        '@keyframes progress',
        '@keyframes marquee',
        '@keyframes shimmer-slide',
        '@keyframes aurora',
        '@keyframes ripple',
        '@keyframes meteor'
      ];

      animations.forEach(animation => {
        expect(globalsCssSource).toContain(animation);
      });
    });

    it('should contain font family variables', () => {
      const fontVars = [
        '--font-sans',
        '--font-serif',
        '--font-mono',
        '--font-cursive',
        '--font-playfair',
        '--font-caveat',
        '--font-calSans',
        '--font-bebasNeue',
        '--font-anton'
      ];

      fontVars.forEach(fontVar => {
        expect(globalsCssSource).toContain(fontVar);
      });
    });

    it('should contain Tailwind theme inline configuration', () => {
      expect(globalsCssSource).toContain('@theme inline');
      expect(globalsCssSource).toContain('--color-background: var(--background)');
      expect(globalsCssSource).toContain('--color-foreground: var(--foreground)');
    });

    it('should contain utility and component layers', () => {
      expect(globalsCssSource).toContain('@utility container');
      expect(globalsCssSource).toContain('@layer components');
      expect(globalsCssSource).toContain('@layer base');
    });

    it('should contain custom scrollbar hiding styles', () => {
      expect(globalsCssSource).toContain('.hide-scrollbar');
      expect(globalsCssSource).toContain('scrollbar-width: none');
      expect(globalsCssSource).toContain('::-webkit-scrollbar');
    });

    it('should use oklch color space for modern color definitions', () => {
      // Check for oklch color definitions
      expect(globalsCssSource).toMatch(/oklch\([0-9.]+ [0-9.]+ [0-9.]+\)/);
      expect(globalsCssSource).toContain('--background: oklch(');
      expect(globalsCssSource).toContain('--primary: oklch(');
    });

    it('should contain sidebar-specific variables', () => {
      const sidebarVars = [
        '--sidebar',
        '--sidebar-foreground',
        '--sidebar-primary',
        '--sidebar-accent',
        '--sidebar-border',
        '--sidebar-ring'
      ];

      sidebarVars.forEach(sidebarVar => {
        expect(globalsCssSource).toContain(sidebarVar);
      });
    });

    it('should contain Shadcnblocks.com specific variables', () => {
      expect(globalsCssSource).toContain('/* Shadcnblocks.com */');
      expect(globalsCssSource).toContain('--muted-2');
      expect(globalsCssSource).toContain('--gradient-1');
      expect(globalsCssSource).toContain('--gradient-2');
      expect(globalsCssSource).toContain('--gradient-3');
    });
  });

  describe('getGlobalsCss', () => {
    it('should return the global CSS source string', () => {
      const css = getGlobalsCss();
      expect(typeof css).toBe('string');
      expect(css).toBe(globalsCssSource);
    });

    it('should return the same content as globalsCssSource', () => {
      const css = getGlobalsCss();
      expect(css.length).toBe(globalsCssSource.length);
      expect(css).toEqual(globalsCssSource);
    });
  });

  describe('CSS structure validation', () => {
    it('should have properly structured CSS with root and dark sections', () => {
      expect(globalsCssSource).toContain(':root {');
      expect(globalsCssSource).toContain('.dark {');

      // Verify both sections close properly
      const rootIndex = globalsCssSource.indexOf(':root {');
      const darkIndex = globalsCssSource.indexOf('.dark {');
      expect(rootIndex).toBeLessThan(darkIndex);
    });

    it('should contain valid CSS syntax markers', () => {
      // Check for proper CSS syntax
      expect(globalsCssSource).toContain('{');
      expect(globalsCssSource).toContain('}');
      expect(globalsCssSource).toContain(';');
      expect(globalsCssSource).toContain(':');
    });

    it('should have animation definitions with proper structure', () => {
      // Check that animations have from/to or percentage markers
      expect(globalsCssSource).toMatch(/@keyframes.*{[\s\S]*?(from|to|0%|100%)/);
    });
  });
});