import { describe, it, expect } from 'vitest'
import {
  packageJsonTemplate,
  viteConfigTemplate,
  tsConfigTemplate,
  postcssConfigTemplate,
  eslintConfigTemplate,
  indexHtmlTemplate,
  indexTsxTemplate,
  readmeTemplate,
  gitignoreTemplate,
  getPackageJsonString,
  getTsConfigString,
  getEslintConfigString,
} from '@/lib/project/static-sources'

describe('static-sources', () => {
  describe('packageJsonTemplate', () => {
    it('should have correct structure', () => {
      expect(packageJsonTemplate).toHaveProperty('name', 'draftcn-export')
      expect(packageJsonTemplate).toHaveProperty('version', '0.1.0')
      expect(packageJsonTemplate).toHaveProperty('private', true)
      expect(packageJsonTemplate).toHaveProperty('type', 'module')
    })

    it('should have all required scripts', () => {
      const scripts = packageJsonTemplate.scripts
      expect(scripts).toHaveProperty('dev', 'vite')
      expect(scripts).toHaveProperty('build')
      expect(scripts).toHaveProperty('preview')
      expect(scripts).toHaveProperty('lint')
    })

    it('should have all required dependencies', () => {
      const deps = packageJsonTemplate.dependencies
      expect(deps).toHaveProperty('react')
      expect(deps).toHaveProperty('react-dom')
      expect(deps).toHaveProperty('lucide-react')
      expect(deps).toHaveProperty('clsx')
      expect(deps).toHaveProperty('tailwind-merge')
      expect(deps).toHaveProperty('class-variance-authority')
    })

    it('should have all required devDependencies', () => {
      const devDeps = packageJsonTemplate.devDependencies
      expect(devDeps).toHaveProperty('@types/react')
      expect(devDeps).toHaveProperty('@types/react-dom')
      expect(devDeps).toHaveProperty('@vitejs/plugin-react')
      expect(devDeps).toHaveProperty('typescript')
      expect(devDeps).toHaveProperty('vite')
      expect(devDeps).toHaveProperty('tailwindcss')
      expect(devDeps).toHaveProperty('@tailwindcss/postcss')
      expect(devDeps).toHaveProperty('postcss')
      expect(devDeps).toHaveProperty('eslint')
    })

    it('should use React 18+', () => {
      expect(packageJsonTemplate.dependencies.react).toMatch(/\^18\./)
      expect(packageJsonTemplate.dependencies['react-dom']).toMatch(/\^18\./)
    })
  })

  describe('viteConfigTemplate', () => {
    it('should be a string', () => {
      expect(typeof viteConfigTemplate).toBe('string')
    })

    it('should import required modules', () => {
      expect(viteConfigTemplate).toContain(
        "import { defineConfig } from 'vite'"
      )
      expect(viteConfigTemplate).toContain(
        "import react from '@vitejs/plugin-react'"
      )
      expect(viteConfigTemplate).toContain("import path from 'path'")
    })

    it('should configure React plugin', () => {
      expect(viteConfigTemplate).toContain('plugins: [react()]')
    })

    it('should configure path alias for @', () => {
      expect(viteConfigTemplate).toContain('alias: {')
      expect(viteConfigTemplate).toContain(
        '"@": path.resolve(__dirname, "./src")'
      )
    })
  })

  describe('tsConfigTemplate', () => {
    it('should have correct compiler options', () => {
      expect(tsConfigTemplate.compilerOptions).toHaveProperty(
        'target',
        'ES2020'
      )
      expect(tsConfigTemplate.compilerOptions).toHaveProperty(
        'jsx',
        'react-jsx'
      )
      expect(tsConfigTemplate.compilerOptions).toHaveProperty('strict', true)
      expect(tsConfigTemplate.compilerOptions).toHaveProperty(
        'skipLibCheck',
        true
      )
    })

    it('should have path mapping for @/* alias', () => {
      expect(tsConfigTemplate.compilerOptions.paths).toHaveProperty('@/*')
      expect(tsConfigTemplate.compilerOptions.paths['@/*']).toEqual(['./src/*'])
    })

    it('should include src directory', () => {
      expect(tsConfigTemplate.include).toContain('src')
    })
  })

  describe('postcssConfigTemplate', () => {
    it('should be a string', () => {
      expect(typeof postcssConfigTemplate).toBe('string')
    })

    it('should configure Tailwind CSS v4 PostCSS plugin', () => {
      expect(postcssConfigTemplate).toContain(
        'import tailwindcss from "@tailwindcss/postcss"'
      )
      expect(postcssConfigTemplate).toContain('plugins: [tailwindcss]')
    })
  })

  describe('eslintConfigTemplate', () => {
    it('should have correct configuration', () => {
      expect(eslintConfigTemplate).toHaveProperty('root', true)
      expect(eslintConfigTemplate).toHaveProperty('env')
      expect(eslintConfigTemplate.env).toHaveProperty('browser', true)
      expect(eslintConfigTemplate.env).toHaveProperty('es2020', true)
    })

    it('should extend recommended configs', () => {
      expect(eslintConfigTemplate.extends).toContain('eslint:recommended')
      expect(eslintConfigTemplate.extends).toContain(
        'plugin:@typescript-eslint/recommended'
      )
      expect(eslintConfigTemplate.extends).toContain(
        'plugin:react-hooks/recommended'
      )
    })

    it('should configure TypeScript parser', () => {
      expect(eslintConfigTemplate.parser).toBe('@typescript-eslint/parser')
    })

    it('should have custom rules', () => {
      expect(eslintConfigTemplate.rules).toHaveProperty(
        'react-refresh/only-export-components'
      )
      expect(eslintConfigTemplate.rules).toHaveProperty(
        '@typescript-eslint/no-explicit-any',
        'off'
      )
    })
  })

  describe('indexHtmlTemplate', () => {
    it('should be a valid HTML string', () => {
      expect(typeof indexHtmlTemplate).toBe('string')
      expect(indexHtmlTemplate).toContain('<!doctype html>')
      expect(indexHtmlTemplate).toContain('<html lang="en">')
      expect(indexHtmlTemplate).toContain('</html>')
    })

    it('should have required meta tags', () => {
      expect(indexHtmlTemplate).toContain('<meta charset="UTF-8" />')
      expect(indexHtmlTemplate).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
      )
    })

    it('should have React mount point', () => {
      expect(indexHtmlTemplate).toContain('<div id="root"></div>')
    })

    it('should include TypeScript entry point', () => {
      expect(indexHtmlTemplate).toContain(
        '<script type="module" src="/src/index.tsx"></script>'
      )
    })

    it('should have proper title', () => {
      expect(indexHtmlTemplate).toContain('<title>DraftCN Export</title>')
    })
  })

  describe('indexTsxTemplate', () => {
    it('should be a string', () => {
      expect(typeof indexTsxTemplate).toBe('string')
    })

    it('should import React and ReactDOM', () => {
      expect(indexTsxTemplate).toContain("import React from 'react'")
      expect(indexTsxTemplate).toContain(
        "import ReactDOM from 'react-dom/client'"
      )
    })

    it('should import App component', () => {
      expect(indexTsxTemplate).toContain("import App from './App'")
    })

    it('should import global CSS', () => {
      expect(indexTsxTemplate).toContain("import './globals.css'")
    })

    it('should use React 18 createRoot API', () => {
      expect(indexTsxTemplate).toContain('ReactDOM.createRoot')
      expect(indexTsxTemplate).toContain("document.getElementById('root')!")
    })

    it('should use StrictMode', () => {
      expect(indexTsxTemplate).toContain('<React.StrictMode>')
      expect(indexTsxTemplate).toContain('</React.StrictMode>')
    })
  })

  describe('readmeTemplate', () => {
    it('should be a string', () => {
      expect(typeof readmeTemplate).toBe('string')
    })

    it('should have main sections', () => {
      expect(readmeTemplate).toContain('# DraftCN React Export')
      expect(readmeTemplate).toContain('## Getting Started')
      expect(readmeTemplate).toContain('## Project Structure')
      expect(readmeTemplate).toContain('## Available Scripts')
      expect(readmeTemplate).toContain('## Customization')
      expect(readmeTemplate).toContain('## Technologies Used')
    })

    it('should include installation instructions', () => {
      expect(readmeTemplate).toContain('npm install')
      expect(readmeTemplate).toContain('npm run dev')
      expect(readmeTemplate).toContain('http://localhost:5173')
    })

    it('should document project structure', () => {
      expect(readmeTemplate).toContain('src/components/')
      expect(readmeTemplate).toContain('src/App.tsx')
      expect(readmeTemplate).toContain('package.json')
      expect(readmeTemplate).toContain('postcss.config.js')
    })

    it('should list technologies', () => {
      expect(readmeTemplate).toContain('React 18')
      expect(readmeTemplate).toContain('TypeScript')
      expect(readmeTemplate).toContain('Vite')
      expect(readmeTemplate).toContain('Tailwind CSS')
      expect(readmeTemplate).toContain('shadcn/ui')
    })
  })

  describe('gitignoreTemplate', () => {
    it('should be a string', () => {
      expect(typeof gitignoreTemplate).toBe('string')
    })

    it('should ignore node_modules', () => {
      expect(gitignoreTemplate).toContain('node_modules/')
    })

    it('should ignore build output', () => {
      expect(gitignoreTemplate).toContain('dist/')
      expect(gitignoreTemplate).toContain('dist-ssr/')
    })

    it('should ignore environment files', () => {
      expect(gitignoreTemplate).toContain('.env')
      expect(gitignoreTemplate).toContain('.env.local')
    })

    it('should ignore editor files', () => {
      expect(gitignoreTemplate).toContain('.vscode')
      expect(gitignoreTemplate).toContain('.idea')
      expect(gitignoreTemplate).toContain('.DS_Store')
    })

    it('should ignore log files', () => {
      expect(gitignoreTemplate).toContain('*.log')
      expect(gitignoreTemplate).toContain('npm-debug.log*')
    })
  })

  describe('utility functions', () => {
    describe('getPackageJsonString', () => {
      it('should return formatted JSON string', () => {
        const result = getPackageJsonString()
        expect(typeof result).toBe('string')

        // Parse to verify it's valid JSON
        const parsed = JSON.parse(result)
        expect(parsed).toEqual(packageJsonTemplate)

        // Check formatting (should have indentation)
        expect(result).toContain('\n')
        expect(result).toContain('  ') // Check for indentation
      })
    })

    describe('getTsConfigString', () => {
      it('should return formatted JSON string', () => {
        const result = getTsConfigString()
        expect(typeof result).toBe('string')

        const parsed = JSON.parse(result)
        expect(parsed).toEqual(tsConfigTemplate)

        expect(result).toContain('\n')
        expect(result).toContain('  ')
      })
    })

    describe('getEslintConfigString', () => {
      it('should return formatted JSON string', () => {
        const result = getEslintConfigString()
        expect(typeof result).toBe('string')

        const parsed = JSON.parse(result)
        expect(parsed).toEqual(eslintConfigTemplate)

        expect(result).toContain('\n')
        expect(result).toContain('  ')
      })
    })
  })

  describe('template consistency', () => {
    it('should have consistent React version across templates', () => {
      // Check package.json React version
      const reactVersion = packageJsonTemplate.dependencies.react

      // Check that indexTsx uses compatible React import
      expect(indexTsxTemplate).toContain('React')

      // README should mention same major version
      expect(readmeTemplate).toContain('React 18')
    })

    it('should have consistent TypeScript configuration', () => {
      // TypeScript in package.json
      expect(packageJsonTemplate.devDependencies).toHaveProperty('typescript')

      // TSConfig should target compatible ES version
      expect(tsConfigTemplate.compilerOptions.target).toBe('ES2020')

      // Vite config should handle TypeScript
      expect(viteConfigTemplate).toContain('plugin-react')
    })

    it('should have consistent build tool references', () => {
      // Vite in package.json scripts
      expect(packageJsonTemplate.scripts.dev).toBe('vite')

      // Vite config exists
      expect(viteConfigTemplate).toContain('defineConfig')
    })
  })
})
