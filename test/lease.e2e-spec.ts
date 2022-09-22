/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { Lease, LeaseImage } from '@prisma/client';
import pactum from 'pactum';
import { fakeLease, fakeLeaseImage, fakeUser } from '../utils/fakeData';
import {
  beforeTests,
  afterTests,
  beforeTest,
  prismaService,
  configService,
  jwtService,
} from './config';

/* -------------------------------------------------------------------------- */
/*                                REQUEST DATA                                */
/* -------------------------------------------------------------------------- */
const mandatoryRequestData: { key: string; invalidValues: any[] }[] = [
  { key: 'street', invalidValues: ['a'] },
  { key: 'postCode', invalidValues: ['a', 123456] },
  { key: 'city', invalidValues: ['a'] },
  { key: 'description', invalidValues: [] },
  { key: 'surface', invalidValues: ['a', 0, 10000] },
  { key: 'room', invalidValues: ['a', 0, 10000] },
  { key: 'startDate', invalidValues: ['a'] },
  { key: 'endDate', invalidValues: ['a'] },
  { key: 'isDateFlexible', invalidValues: ['a', 2] },
  { key: 'pricePerMonth', invalidValues: ['a', 0, 100000] },
  { key: 'isPublished', invalidValues: ['a', 2] },
];

const optionalRequestData: { key: string; invalidValues: any[] }[] = [
  { key: 'houseNumber', invalidValues: ['abcdefghijklm'] },
  { key: 'gpsLatitude', invalidValues: ['abc', 9] },
  { key: 'gpsLongitude', invalidValues: ['abc', 9] },
  {
    key: 'leaseImages',
    invalidValues: [
      'abc',
      'http://google.com',
      ['abc'],
      ['abc', 'http://google.com'],
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                    TYPE                                    */
/* -------------------------------------------------------------------------- */
type LeaseResponse = Partial<
  Lease & {
    leaseImages: LeaseImage[];
  }
>;

/* -------------------------------------------------------------------------- */
/*                                   HELPER                                   */
/* -------------------------------------------------------------------------- */
/**
 * Check that all response attributes are defined or not null
 *
 * @param response
 */
function checkResponse(response: LeaseResponse) {
  optionalRequestData.forEach((attribute) =>
    expect(response[attribute.key]).toBeDefined(),
  );
  mandatoryRequestData.forEach((attribute) =>
    expect(response[attribute.key]).not.toBe(null),
  );
  expect(response.id).not.toBe(null);
  expect(response.userId).not.toBe(null);
  expect(response.createdAt).not.toBe(null);
  expect(response.updatedAt).not.toBe(null);
  expect(response.leaseImages).not.toBe(null);
  expect(response.leaseImages.length).toBe(4);
  expect(response.leaseImages[0].url).not.toBe(null);
  expect(response.leaseImages[1].url).not.toBe(null);
  expect(response.leaseImages[2].url).not.toBe(null);
  expect(response.leaseImages[3].url).not.toBe(null);
}

/* -------------------------------------------------------------------------- */
/*                                 GET LEASES                                 */
/* -------------------------------------------------------------------------- */
describe('GET /leases', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return all published leases', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Create 3 fake lease with 4 leaseImage each
    for (let index = 0; index < 3; index++) {
      const leaseImages = [];
      for (let index = 0; index < 4; index++) {
        leaseImages.push(fakeLeaseImage());
      }
      await prismaService.lease.create({
        data: {
          ...fakeLease(user.id),
          isPublished: index % 2 === 0 ? 1 : 0, // Overide fake lease value
          leaseImages: {
            createMany: {
              data: leaseImages.map((url) => ({ url })),
            },
          },
        },
      });
    }
    // Assert
    const response = await pactum
      .spec()
      .get('/leases')
      .expectStatus(200)
      .expectJsonLength(2)
      .returns('res.body');

    response.forEach((lease: LeaseResponse) => checkResponse(lease));
  });
});

/* -------------------------------------------------------------------------- */
/*                               GET LEASE BY ID                              */
/* -------------------------------------------------------------------------- */
describe('GET /leases/:id', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return the lease corresponding to the id pass in url param', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Create 1 fake lease with 4 leaseImage
    const leaseImages = [];
    for (let index = 0; index < 4; index++) {
      leaseImages.push(fakeLeaseImage());
    }
    const lease = await prismaService.lease.create({
      data: {
        ...fakeLease(user.id),
        leaseImages: {
          createMany: {
            data: leaseImages.map((url) => ({ url })),
          },
        },
      },
    });

    // Assert
    const response = await pactum
      .spec()
      .get(`/leases/${lease.id}`)
      .expectStatus(200)
      .returns('res.body');

    checkResponse(response);
  });

  it('should return status 404 when lease does not exist', async () => {
    return pactum.spec().get('/leases/1').expectStatus(404);
  });

  it('should return status 400 when the id pass in url param is invalid', async () => {
    return pactum.spec().get('/leases/abcde').expectStatus(400);
  });
});

/* -------------------------------------------------------------------------- */
/*                               GET USER LEASES                              */
/* -------------------------------------------------------------------------- */
describe('GET /leases/user', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return all user leases', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Create 1 fake lease with 4 leaseImage
    const leaseImages = [];
    for (let index = 0; index < 4; index++) {
      leaseImages.push(fakeLeaseImage());
    }
    await prismaService.lease.create({
      data: {
        ...fakeLease(user.id),
        leaseImages: {
          createMany: {
            data: leaseImages.map((url) => ({ url })),
          },
        },
      },
    });

    // Payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });

    // Assert
    const response = await pactum
      .spec()
      .get('/leases/user')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(200)
      .expectJsonLength(1)
      .returns('res.body');

    response.forEach((lease: LeaseResponse) => checkResponse(lease));
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .get('/leases/user')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is not provided', async () => {
    return pactum.spec().get('/leases/user').expectStatus(401);
  });
});

/* -------------------------------------------------------------------------- */
/*                                 POST LEASE                                 */
/* -------------------------------------------------------------------------- */
describe('POST /leases', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should store a lease when access_token and all attributes are valid', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Create 1 lease
    const lease = fakeLease(user.id);
    // Create 4 fake leaseImage
    const leaseImages = [];
    for (let index = 0; index < 4; index++) {
      leaseImages.push(fakeLeaseImage());
    }

    // Payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });

    // Assert
    const response = await pactum
      .spec()
      .post('/leases')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ ...lease, leaseImages })
      .expectStatus(201)
      .returns('res.body');

    checkResponse(response);
  });

  it('should return status 400 when a mandatory attribute is missing', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Create 1 lease
    const lease = fakeLease(user.id);
    // Create 4 fake leaseImage
    const leaseImages = [];
    for (let index = 0; index < 4; index++) {
      leaseImages.push(fakeLeaseImage());
    }

    // Payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });

    // Assert
    for (const attribute of mandatoryRequestData) {
      const data = { ...lease };
      delete data[attribute.key];

      await pactum
        .spec()
        .post('/leases')
        .withHeaders('Authorization', `Bearer ${jwt}`)
        .withBody({ ...data, leaseImages })
        .expectStatus(400);
    }
  });

  it('should return status 400 when any attribute is invalid', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Create 1 lease
    const lease = fakeLease(user.id);

    // Payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });

    // Assert
    const requestData = [...mandatoryRequestData, ...optionalRequestData];
    for (const attribute of requestData) {
      for (const invalidValue of attribute.invalidValues) {
        const data = { ...lease };
        data[attribute.key] = invalidValue;

        await pactum
          .spec()
          .post('/leases')
          .withHeaders('Authorization', `Bearer ${jwt}`)
          .withBody({ ...data })
          .expectStatus(400);
      }
    }
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .post('/leases')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is not provided', async () => {
    return pactum.spec().post('/leases').expectStatus(401);
  });
});
