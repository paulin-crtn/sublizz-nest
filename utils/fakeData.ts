/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { faker } from '@faker-js/faker';
import argon from 'argon2';

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */
export const fakeUser = async () => {
  const passwordHash: string = await argon.hash('password');
  return {
    firstName: 'firstname', // faker.name.firstName()
    lastName: 'lastname', // faker.name.lastName()
    email: 'firsntame@mail.com', // faker.internet.email()
    emailVerifiedAt: new Date(),
    passwordHash, // faker.internet.password()
    profilePictureUrl: faker.internet.avatar(),
  };
};

export const fakeLease = (userId: number) => ({
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
  isPublished: faker.datatype.number({ min: 0, max: 1 }),
});

export const fakeLeaseImage = () => faker.image.imageUrl();
