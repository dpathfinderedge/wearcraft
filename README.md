# WearCraft

Under development

## Neon PostgreSQL setup

WearCraft uses Prisma 5 with PostgreSQL. For Neon, configure two connection strings:

- `DATABASE_URL`: the pooled Neon connection URL for app runtime traffic (the hostname includes `-pooler`).
- `DATABASE_URL_UNPOOLED`: the direct Neon connection URL for Prisma CLI schema and migration commands.

Keep both URLs private. For local development, add them to `.env.local`. For Vercel, add them as server-only project environment variables for the appropriate deployment environments; never prefix either variable with `NEXT_PUBLIC_`.

The initial schema is recorded in `prisma/migrations`. After configuring the direct URL, validate the schema with `npx prisma validate`, then apply the migration to a **new, empty** Neon database using:

```powershell
npm run db:migrate:deploy
```

Do not use `npm run db:seed` on production: the current seed script clears existing users, orders, reviews, wishlists, addresses, and products before inserting demo catalogue items. Create and review real catalogue data and admin access deliberately. If the Neon database is not empty, stop and inspect its schema/data before applying or baselining this initial migration.