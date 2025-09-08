# API Specification

Since this is a **client-side only MVP with no backend**, there is no traditional API. However, we'll define the key interfaces for future backend integration.

**N/A for MVP** - All operations are client-side only with no persistence.

### Future API Considerations

When we add a backend in post-MVP phases, the API will likely include:

- **Block Template Management** - CRUD operations for templates
- **Project Persistence** - Save/load canvas states
- **Asset Management** - Upload and serve template thumbnails
- **User Management** - Authentication and authorization

For now, all state management happens through Zustand store operations without network calls.
