/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { PrismaClient } from '@prisma/client';
import { LeaseTypeEnum } from '../src/lease/enum';
import { fakeUser, fakeLease, fakeLeaseMessage } from '../utils/fakeData';

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

  // Create lease type
  await prisma.leaseType.createMany({
    data: [
      { type: LeaseTypeEnum.MOBILITY },
      { type: LeaseTypeEnum.SHARE },
      { type: LeaseTypeEnum.STUDENT },
      { type: LeaseTypeEnum.SUBLEASE },
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

  // Create 6 fake leases with 3 leaseImage each
  const leaseIds = [];
  for (let index = 0; index < 6; index++) {
    // const leaseImages = [];
    // for (let index = 0; index < 3; index++) {
    //   leaseImages.push(fakeLeaseImage());
    // }
    const lease = fakeLease(mario.id);
    const leaseDb = await prisma.lease.create({
      data: {
        ...lease,
        // leaseImages: {
        //   createMany: {
        //     data: leaseImages.map((url) => ({ url })),
        //   },
        // },
      },
    });
    leaseIds.push(leaseDb.id);
  }

  // Create 1 fake lease messages
  const leaseMessage = fakeLeaseMessage(leaseIds[0], luigi.id);
  await prisma.leaseMessage.create({
    data: {
      ...leaseMessage,
    },
  });
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
