/**
 * Static asset sources for React export
 * Contains templates for configuration files and project structure
 */

/**
 * Package.json template for exported React projects
 */
export const packageJsonTemplate = {
  name: 'draftcn-export',
  version: '0.1.0',
  private: true,
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview',
    lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
  },
  dependencies: {
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    'lucide-react': '^0.344.0',
    clsx: '^2.1.0',
    'tailwind-merge': '^2.2.1',
    'class-variance-authority': '^0.7.0',
  },
  devDependencies: {
    '@types/react': '^18.3.3',
    '@types/react-dom': '^18.3.0',
    '@typescript-eslint/eslint-plugin': '^7.0.0',
    '@typescript-eslint/parser': '^7.0.0',
    '@vitejs/plugin-react': '^4.2.1',
    '@tailwindcss/postcss': '^4.0.0',
    eslint: '^8.56.0',
    'eslint-plugin-react-hooks': '^4.6.0',
    'eslint-plugin-react-refresh': '^0.4.5',
    postcss: '^8.4.33',
    tailwindcss: '^4.0.0',
    typescript: '^5.3.3',
    vite: '^5.0.12',
  },
}

/**
 * Vite configuration template
 */
export const viteConfigTemplate = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})`

/**
 * TypeScript configuration template
 */
export const tsConfigTemplate = {
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,

    /* Bundler mode */
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx',

    /* Linting */
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,

    /* Path mapping */
    paths: {
      '@/*': ['./src/*'],
    },
  },
  include: ['src'],
}

/**
 * PostCSS configuration template
 */
export const postcssConfigTemplate = `import tailwindcss from "@tailwindcss/postcss";

export default {
	plugins: [tailwindcss],
};`

/**
 * ESLint configuration template
 */
export const eslintConfigTemplate = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
  },
}

/**
 * Index.html template for the React app
 */
export const indexHtmlTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DraftCN Export</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`

/**
 * React entry point (index.tsx) template
 */
export const indexTsxTemplate = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`

/**
 * README template for exported projects
 */
export const readmeTemplate = `# DraftCN React Export

This project was exported from DraftCN visual builder.

## Getting Started

### Prerequisites

Make sure you have Node.js (v18 or higher) and npm installed on your machine.

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser and navigate to \`http://localhost:5173\`

## Project Structure

\`\`\`
├── src/
│   ├── components/       # Template components from DraftCN
│   │   ├── ui/           # shadcn/ui components
│   │   └── shadcnblocks/ # shadcnblocks components
│   ├── App.tsx           # Main application with your design
│   ├── index.tsx         # React entry point
│   └── globals.css       # Global styles and Tailwind CSS
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── postcss.config.js     # PostCSS configuration (includes Tailwind)
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite build configuration
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint

## Customization

### Editing Components

All components are fully editable. You can find them in:
- \`src/components/\` - Your template components
- \`src/components/ui/\` - shadcn/ui components
- \`src/App.tsx\` - Main layout and block arrangement

### Styling

- Global styles: \`src/globals.css\`
- PostCSS config: \`postcss.config.js\` (includes Tailwind v4)
- Component styles: Use Tailwind utility classes

### Adding New Features

This is a standard React + TypeScript + Vite project. You can:
- Add new components
- Install additional npm packages
- Modify the build configuration
- Integrate with APIs and backends

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

## License

This exported project is yours to use and modify as needed.

## Support

For issues related to the export or DraftCN, visit: https://github.com/shipfastest/draftcn

---

Built with ❤️ using DraftCN
`

/**
 * Gitignore template
 */
export const gitignoreTemplate = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
dist-ssr/
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Testing
coverage/

# Misc
*.log`

/**
 * Get package.json as a string
 */
export function getPackageJsonString(): string {
  return JSON.stringify(packageJsonTemplate, null, 2)
}

/**
 * Get tsconfig.json as a string
 */
export function getTsConfigString(): string {
  return JSON.stringify(tsConfigTemplate, null, 2)
}

/**
 * Get .eslintrc.json as a string
 */
export function getEslintConfigString(): string {
  return JSON.stringify(eslintConfigTemplate, null, 2)
}
