const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function auditDatabase() {
  console.log("📊 Auditing Agapay Database State...");

  const groups = await prisma.tenantGroup.findMany();
  console.log(`🏢 Tenant Groups: ${groups.length}`);
  groups.forEach((g) =>
    console.log(`   - [${g.id}] ${g.name} (${g.reg_code})`),
  );

  const tenants = await prisma.tenant.findMany();
  console.log(`🏠 Tenants: ${tenants.length}`);
  tenants.forEach((t) =>
    console.log(
      `   - [${t.tenant_id}] ${t.name} (Group: ${t.tenant_group_id})`,
    ),
  );

  const users = await prisma.user.findMany({
    include: { profile: true },
  });
  console.log(`👥 Users: ${users.length}`);
  users.forEach((u) =>
    console.log(
      `   - [${u.user_id}] ${u.username} | Role: ${u.role} | Status: ${u.status} | Tenant: ${u.tenant_id}`,
    ),
  );

  if (users.length === 0) {
    console.error("🚨 DATABASE IS EMPTY! Seeding might have failed silently.");
  }
}

auditDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
