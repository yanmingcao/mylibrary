# Database Migration Guide

## Quick Switch: PostgreSQL ↔ SQLite

### Current Status: ✅ PostgreSQL Ready
- Schema updated for SQLite
- Migration scripts created
- Ready to test SQLite

### Switch to SQLite (for testing/production):

```bash
# 1. Export current PostgreSQL data
npm run db:export > postgres-data.json

# 2. Update dependencies
npm install @prisma/adapter-better-sqlite3 better-sqlite3

# 3. Update environment
# .env
DATABASE_URL="file:./dev.db"

# 4. Initialize SQLite database
npx prisma db push
npm run db:import postgres-data.json

# 5. Test
npm run dev
```

## Files Changed:
- `prisma/schema.prisma` - SQLite datasource
- `scripts/migrate-db.js` - Export/import utility
- `SQLITE_MIGRATION_PLAN.md` - Detailed analysis

## Recommendation for Your Use Case:
**SQLite is ideal** - simpler deployment, better performance for small scale, zero maintenance.
