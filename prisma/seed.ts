/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { PrismaClient } from '@prisma/client';
import { LeaseTypeEnum } from '../src/lease/enum';
import { UserRoleEnum } from '../src/user/enum';
import { fakeUser, fakeLease } from '../utils/fakeData';
import { faker } from '@faker-js/faker';
import randomToken from 'rand-token';

/* -------------------------------------------------------------------------- */
/*                               INITIALIZATION                               */
/* -------------------------------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                                MAIN FUNCTION                               */
/* -------------------------------------------------------------------------- */
const main = async () => {
  // Initialization
  console.log('Seeding database...');

  // Create user role
  await prisma.userRole.createMany({
    data: [{ role: UserRoleEnum.SEEKER }, { role: UserRoleEnum.OWNER }],
  });

  // Create lease type
  await prisma.leaseType.createMany({
    data: [
      { type: LeaseTypeEnum.MOBILITY },
      { type: LeaseTypeEnum.SHARE },
      { type: LeaseTypeEnum.STUDENT },
      { type: LeaseTypeEnum.SUBLEASE },
      { type: LeaseTypeEnum.SEASONAL },
    ],
  });

  // Stop seeding
  if (process.env.NODE_ENV !== 'dev') {
    return;
  }

  // Create 2 fake users
  const mario = await prisma.user.create({
    data: await fakeUser('mario', 'mario@mail.com'),
  });
  const luigi = await prisma.user.create({
    data: await fakeUser('luigi', 'luigi@mail.com'),
  });
  const yoshi = await prisma.user.create({
    data: await fakeUser('yoshi', 'yoshi@mail.com'),
  });

  // Create 15 fake leases
  const leaseIds = [];
  for (let index = 0; index < 15; index++) {
    const lease = fakeLease(mario.id);
    const leaseDb = await prisma.lease.create({
      data: {
        ...lease,
      },
    });
    leaseIds.push(leaseDb.id);
  }

  // Create 2 conversations with 10 messages each
  for (let i = 0; i < 2; i++) {
    const conversationId = randomToken.generate(16);
    await prisma.conversation.create({
      data: {
        id: conversationId,
      },
    });
    for (let j = 0; j < 10; j++) {
      await prisma.conversationMessage.create({
        data: {
          conversationId,
          leaseId: leaseIds[0],
          fromUserId: i === 0 ? luigi.id : yoshi.id,
          toUserId: mario.id,
          content: faker.lorem.lines(),
        },
      });
    }
  }
};

main()
  .catch((e) => {
    console.error('Error while seeding the database: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database seeded');
  });
