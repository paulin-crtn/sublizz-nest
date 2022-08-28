import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const fakeUser = (): any => ({
  firstName: 'Julien', // faker.name.firstName()
  lastName: 'Dupuis', // faker.name.lastName()
  email: 'julien@dupuis.com', // faker.internet.email()
  passwordHash: '$2a$10$tDyVlcnuYnazlxntXJ0kMODUn9HQ7x6YfOghsCAT1wBTFksRfUFna', // faker.internet.password()
  imgUrl: faker.internet.avatar(),
});

const fakeLease = (userId: number): any => ({
  userId,
  city: faker.address.cityName(),
  description: faker.lorem.lines(),
  surface: faker.datatype.number({ min: 10, max: 100 }),
  room: faker.datatype.number({ min: 1, max: 7 }),
  startDate: faker.date.soon(10),
  endDate: faker.date.future(),
  isDateFlexible: faker.datatype.boolean(),
  pricePeriod: faker.datatype.number({ min: 100, max: 1000 }),
});

const fakeLeaseImage = (leaseId: number) => ({
  leaseId,
  url: faker.image.imageUrl(),
});

const main = async () => {
  // Initialization
  console.log('Seeding database...');
  const leaseIds: number[] = [];

  // Create fake user
  const user = await prisma.user.create({ data: fakeUser() });

  // Create 3 fake lease
  for (let index = 0; index < 3; index++) {
    const lease = await prisma.lease.create({ data: fakeLease(user.id) });
    leaseIds.push(lease.id);
  }

  // Create 4 images per lease
  for (const leaseId of leaseIds) {
    for (let index = 0; index < 4; index++) {
      await prisma.leaseImage.create({ data: fakeLeaseImage(leaseId) });
    }
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => console.log('Database seeded'));
