# Unified Project Structure

```plaintext
draftcn/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       └── deploy.yaml         # Vercel deployment
├── app/                        # Next.js App Router
│   ├── page.tsx               # Main builder page
│   ├── layout.tsx             # Root layout with providers
│   └── globals.css            # Global styles for blocks
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── scroll-area.tsx
│   │   └── ...
│   ├── canvas/                # Canvas components
│   │   ├── Canvas.tsx
│   │   ├── Grid.tsx
│   │   ├── DeadZones.tsx
│   │   ├── DropPreview.tsx
│   │   └── BlockRenderer.tsx
│   ├── blocks/                # Block-related components
│   │   ├── BlockInstance.tsx
│   │   ├── BlockWrapper.tsx
│   │   └── BlockLibrary.tsx
│   └── layout/               # Layout components
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/                       # Utilities and core logic
│   ├── blocks/               # Block management
│   │   ├── registry.ts      # Block registry
│   │   ├── processor.ts     # Template processor
│   │   └── types.ts         # Block type definitions
│   ├── drag/                # Drag-and-drop logic
│   │   ├── manager.ts       # Drag manager
│   │   └── utils.ts         # Drag utilities
│   ├── grid/                # Grid system
│   │   ├── calculator.ts    # Grid calculations
│   │   └── constants.ts     # Grid constants (60px)
│   └── utils.ts             # General utilities
├── store/                    # State management
│   ├── index.ts             # Main Zustand store
│   ├── slices/              # Store slices
│   │   ├── canvas.ts        # Canvas state
│   │   ├── blocks.ts        # Blocks state
│   │   └── drag.ts          # Drag state
│   └── selectors.ts        # Reusable selectors
├── templates/               # Block templates
│   ├── hero/               # Hero templates
│   │   ├── hero1.tsx       # Hero template source
│   │   ├── hero1.png       # Hero thumbnail
│   │   └── index.ts        # Hero exports
│   ├── navigation/         # Navigation templates
│   │   └── ...
│   └── index.ts           # Template registry initialization
├── types/                  # TypeScript definitions
│   ├── block.ts           # Block interfaces
│   ├── template.ts        # Template interfaces
│   └── canvas.ts          # Canvas interfaces
├── hooks/                  # Custom React hooks
│   ├── useDrag.ts         # Drag-and-drop hook
│   ├── useCanvas.ts       # Canvas operations hook
│   └── useKeyboard.ts     # Keyboard shortcuts hook
├── public/                 # Static assets
│   └── thumbnails/        # Template thumbnails
├── scripts/               # Build scripts
│   └── process-templates.js # Template preprocessing
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── .env.example          # Environment template
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```
