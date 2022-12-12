/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { faker } from '@faker-js/faker';
import argon from 'argon2';
import { LeaseTypeEnum } from '../src/lease/enum';
import { UserRoleEnum } from '../src/user/enum';

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */
export const fakeUser = async (firstName?: string, email?: string) => {
  const passwordHash: string = await argon.hash('password');
  return {
    role: faker.helpers.arrayElement([UserRoleEnum.SEEKER, UserRoleEnum.OWNER]),
    firstName: firstName ?? faker.name.firstName().slice(0, 10), // slice() because sometimes faker returns a string too long
    lastName: faker.name.lastName().slice(0, 10), // slice() because sometimes faker returns a string too long
    email: email ?? faker.internet.email(),
    emailVerifiedAt: new Date(),
    passwordHash, // faker.internet.password()
    profilePictureName: null, // faker.internet.avatar()
    standardMessage: faker.lorem.lines(3),
  };
};

export const fakeLease = (userId: number) => ({
  userId,
  type: faker.helpers.arrayElement([
    LeaseTypeEnum.MOBILITY,
    LeaseTypeEnum.SHARE,
    LeaseTypeEnum.STUDENT,
    LeaseTypeEnum.SUBLEASE,
    LeaseTypeEnum.SEASONAL,
  ]),
  street: faker.address.street(),
  postCode: faker.address.zipCode('#####'),
  city: faker.address.cityName(),
  gpsLatitude: faker.address.latitude(50, 46),
  gpsLongitude: faker.address.longitude(4, 2),
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
