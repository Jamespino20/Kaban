const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const groups = await prisma.tenantGroup.findMany();
  const tenants = await prisma.tenant.findMany();
  console.log("GROUPS_COUNT:", groups.length);
  groups.forEach((g) => console.log(`- GROUP: ${g.name} (id: ${g.id})`));
  console.log("TENANTS_COUNT:", tenants.length);
  tenants.forEach((t) =>
    console.log(
      `- TENANT: ${t.name} (id: ${t.tenant_id}, groupId: ${t.tenant_group_id})`,
    ),
  );
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
