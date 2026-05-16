import prisma from '../src/lib/prisma';

async function main() {
  const users = await prisma.$withTenant(12, async (tx: any) => {
    return await tx.user.findMany({
      where: {
        tenant_id: 12,
        user_id: { not: 999999 },
        role: 'member',
        status: 'active',
        OR: [
          { username: { contains: 'miguel' } },
          { email: { contains: 'miguel' } },
          { member_code: { contains: 'miguel' } },
          { phone: { contains: 'miguel' } },
          { profile: { is: { first_name: { contains: 'miguel' } } } },
          { profile: { is: { middle_name: { contains: 'miguel' } } } },
          { profile: { is: { last_name: { contains: 'miguel' } } } },
          { profile: { is: { business_name: { contains: 'miguel' } } } },
          { profile: { is: { occupation: { contains: 'miguel' } } } },
        ],
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        profile: { select: { first_name: true, last_name: true } },
      },
      take: 8,
    });
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
