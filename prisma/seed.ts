/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { PrismaClient } from '@prisma/client';
import { LeaseTypeEnum } from '../src/lease/enum';
import { fakeUser, fakeLease, fakeLeaseImage } from '../utils/fakeData';

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

  // Create 1 fake user
  const user = await prisma.user.create({ data: await fakeUser() });
  // Create 3 fake lease with 4 leaseImage each
  for (let index = 0; index < 3; index++) {
    const leaseImages = [];
    for (let index = 0; index < 4; index++) {
      leaseImages.push(fakeLeaseImage());
    }
    const lease = fakeLease(user.id);
    await prisma.lease.create({
      data: {
        ...lease,
        leaseImages: {
          createMany: {
            data: leaseImages.map((url) => ({ url })),
          },
        },
      },
    });
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
