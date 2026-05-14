export function getDbUrl() {
  return (
    // Prefer pooled URLs for app runtime (PgBouncer-compatible)
    process.env.AGAPAYSTORAGE_POSTGRES_URL ||
    process.env.AGAPAYSTORAGE_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    // Non-pooling fallback (used by prisma migrate/seed only)
    process.env.AGAPAYSTORAGE_POSTGRES_URL_NON_POOLING ||
    process.env.AGAPAYSTORAGE_DATABASE_URL_UNPOOLED ||
    ""
  );
}

export function getAppBaseUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}
