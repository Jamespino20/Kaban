import prisma from "../src/lib/prisma";

async function test() {
  console.log("Checking User model fields...");
  // This is just to test if the client HAS the field at runtime
  // We're not actually creating a user, just checking the 'create' arguments types if possible
  // or just seeing if we can access the metadata.

  try {
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        username: "testuser",
        password_hash: "hash",
        tenant_id: 1,
        role: "member",
        interest_tier: "T1_3_PERCENT",
      },
    });
    console.log("Successfully accessed 'interest_tier' field!");
    // Delete immediately
    await prisma.user.delete({ where: { user_id: user.user_id } });
  } catch (e: any) {
    console.log("Runtime check result:", e.message);
    if (e.message.includes("Unknown argument 'interest_tier'")) {
      console.error(
        "FAIL: 'interest_tier' is NOT known to the runtime client.",
      );
    } else {
      console.log("PASS: The error was NOT about 'interest_tier' existence.");
    }
  }
}

test();
