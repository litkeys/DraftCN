# Goals and Background Context

### Goals

-   Enable non-technical users to visually build website layouts through intuitive drag-and-drop interactions
-   Provide immediate visual feedback with grid-based placement system for precise component positioning
-   Deliver a functional MVP that demonstrates core website builder capabilities without backend complexity
-   Create extensible foundation supporting future enhancements like persistence and code export
-   Validate technical approach using modern React patterns and shadcn/ui component system

### Background Context

DraftCN addresses the gap between design tools and production-ready web applications by providing a visual website builder that generates clean, maintainable React code. The current landscape shows designers struggling with handoff to developers, while developers spend significant time translating designs into code. This MVP focuses on the core interaction model - drag-and-drop with a 60px grid system - to validate that users can effectively compose layouts using pre-built shadcn/ui components.

The architecture employs a **template-based block system** where reusable block templates are manually registered in a central registry with their metadata, props interfaces, and component definitions. Templates are instantiated with customized props, and a global CSS file provides consistent styling across all blocks. This approach enables developer-friendly template creation, reusable block definitions, props-based customization, and a clear path to future inline editing capabilities.

By intentionally limiting scope (no persistence, no auth, no text editing), the project can quickly prove the viability of the grid-based placement system and freeform block positioning approach that will serve as the foundation for a more comprehensive website building solution.

### Change Log

| Date       | Version | Description                                       | Author    |
| ---------- | ------- | ------------------------------------------------- | --------- |
| 2025-01-06 | v1.0    | Initial PRD creation from technical specification | John (PM) |
| 2025-01-07 | v1.1    | Updated with architecture specifications          | John (PM) |
