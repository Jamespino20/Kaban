const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require("bcryptjs");

const connectionString =
  "postgresql://neondb_owner:npg_Zi2m9NUxgIrC@ep-damp-river-a1bkchuk-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function debugAuth(username, password) {
  console.log(`🔍 Debugging Auth for [${username}]...`);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: username }, { username: username }],
    },
  });

  if (!user) {
    console.error("❌ User NOT found in database.");
    return;
  }

  console.log("✅ User found:", {
    id: user.user_id,
    username: user.username,
    email: user.email,
    status: user.status,
  });

  const passwordsMatch = await bcrypt.compare(password, user.password_hash);
  console.log("🔑 Password check:", passwordsMatch ? "MATCH" : "FAIL");
}

async function main() {
  await debugAuth("superadmin", "password123");
  await debugAuth("elena", "password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
