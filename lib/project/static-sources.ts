/**
 * Static asset sources for React export
 * Contains templates for configuration files and project structure
 */

/**
 * Package.json template for exported React projects
 */
export const packageJsonTemplate = {
  name: "draftcn-export",
  version: "0.1.0",
  private: true,
  type: "module",
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview",
    lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  dependencies: {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "class-variance-authority": "^0.7.0"
  },
  devDependencies: {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
};

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
})`;

/**
 * TypeScript configuration template
 */
export const tsConfigTemplate = {
  compilerOptions: {
    target: "ES2020",
    useDefineForClassFields: true,
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    skipLibCheck: true,

    /* Bundler mode */
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",

    /* Linting */
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,

    /* Path mapping */
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"]
    }
  },
  include: ["src"],
  references: [{ path: "./tsconfig.node.json" }]
};

/**
 * TypeScript Node configuration template
 */
export const tsConfigNodeTemplate = {
  compilerOptions: {
    composite: true,
    skipLibCheck: true,
    module: "ESNext",
    moduleResolution: "bundler",
    allowSyntheticDefaultImports: true,
    strict: true
  },
  include: ["vite.config.ts"]
};

/**
 * Tailwind configuration template
 */
export const tailwindConfigTemplate = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}`;

/**
 * PostCSS configuration template
 */
export const postcssConfigTemplate = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

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
};

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
</html>`;

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
)`;

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
├── tailwind.config.js    # Tailwind CSS configuration
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
- Tailwind config: \`tailwind.config.js\`
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
`;

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
*.log`;

/**
 * Get package.json as a string
 */
export function getPackageJsonString(): string {
  return JSON.stringify(packageJsonTemplate, null, 2);
}

/**
 * Get tsconfig.json as a string
 */
export function getTsConfigString(): string {
  return JSON.stringify(tsConfigTemplate, null, 2);
}

/**
 * Get tsconfig.node.json as a string
 */
export function getTsConfigNodeString(): string {
  return JSON.stringify(tsConfigNodeTemplate, null, 2);
}

/**
 * Get .eslintrc.json as a string
 */
export function getEslintConfigString(): string {
  return JSON.stringify(eslintConfigTemplate, null, 2);
}