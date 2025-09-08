# Introduction

### DraftCN Fullstack Architecture Document

This document outlines the complete fullstack architecture for **DraftCN**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

#### Technical Context

The architecture supports a unique **template-based block system** where:
- Block templates are manually defined and registered in a central registry
- Each template includes metadata, props interfaces, and React component definitions
- Instances are created from templates with customized props
- A global CSS file provides consistent styling across all blocks
- Templates are added to the registry by developers as needed

This approach enables:
- **Developer-friendly template creation** - Write standard React components
- **Reusable block definitions** - One template, many instances
- **Props-based customization** - Change content without modifying code
- **Future extensibility** - Path to inline editing and persistence

#### Starter Template or Existing Project

**N/A - Greenfield project**

No starter templates or existing projects are mentioned in the PRD or front-end spec. This is a completely new implementation built from scratch with specific technology choices outlined for the MVP.

#### Change Log

| Date       | Version | Description                    | Author           |
| ---------- | ------- | ------------------------------ | ---------------- |
| 2025-01-06 | v1.0    | Initial architecture document  | Winston (Architect) |
