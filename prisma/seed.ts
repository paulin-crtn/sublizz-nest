/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';

/* -------------------------------------------------------------------------- */
/*                               INITIALIZATION                               */
/* -------------------------------------------------------------------------- */
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/*                             FAKE DATA FUNCTIONS                            */
/* -------------------------------------------------------------------------- */
const fakeUser = async (): Promise<any> => {
  const passwordHash: string = await argon.hash('password');
  return {
    firstName: 'Firstname', // faker.name.firstName()
    lastName: 'Lastname', // faker.name.lastName()
    email: 'email@gmail.com', // faker.internet.email()
    passwordHash, // faker.internet.password()
    profilePictureUrl: faker.internet.avatar(),
  };
};

const fakeLease = (userId: number): any => ({
  userId,
  houseNumber: faker.address.buildingNumber(),
  street: faker.address.street(),
  postCode: faker.address.zipCode('#####'),
  city: faker.address.cityName(),
  gpsLatitude: faker.address.latitude(),
  gpsLongitude: faker.address.longitude(),
  description: faker.lorem.lines(),
  surface: faker.datatype.number({ min: 10, max: 100 }),
  room: faker.datatype.number({ min: 1, max: 7 }),
  startDate: faker.date.soon(10),
  endDate: faker.date.future(),
  isDateFlexible: faker.datatype.number({ min: 0, max: 1 }),
  pricePerMonth: faker.datatype.number({ min: 200, max: 2000 }),
});

const fakeLeaseImage = (leaseId: number) => ({
  leaseId,
  url: faker.image.imageUrl(),
});

/* -------------------------------------------------------------------------- */
/*                                MAIN FUNCTION                               */
/* -------------------------------------------------------------------------- */
const main = async () => {
  // Initialization
  console.log('Seeding database...');
  const leaseIds: number[] = [];
  // Create 1 fake user
  const user = await prisma.user.create({ data: await fakeUser() });
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
