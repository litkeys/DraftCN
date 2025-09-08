# Database Schema

### No Database for MVP

Since this is a client-side only application with no persistence, there is no database schema required for the MVP. All data exists in memory through the Zustand store and is lost on page refresh.

### Future Database Considerations

When persistence is added post-MVP, the schema would likely include:

```sql
-- Future schema structure (not implemented in MVP)
-- Projects table for saved canvases
-- Blocks table for persisted block instances  
-- Templates table for custom user templates
-- Assets table for uploaded images
```

For now, all state is managed in-memory with the data models defined earlier.
