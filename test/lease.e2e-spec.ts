/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import pactum from 'pactum';
import { LeaseDetailsEntity, LeaseEntity } from '../src/lease/entity';
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
/*                             REQUEST ATTRIBUTES                             */
/* -------------------------------------------------------------------------- */
const mandatoryRequestData: { key: string; invalidValues: any[] }[] = [
  { key: 'type', invalidValues: [null, '', 'a', 123456] },
  { key: 'street', invalidValues: [null, '', 'a'] },
  { key: 'postCode', invalidValues: [null, '', 'a', 123456] },
  { key: 'city', invalidValues: [null, '', 'a'] },
  { key: 'surface', invalidValues: [null, '', 'a', 0, 10000] },
  { key: 'room', invalidValues: [null, '', 'a', 0, 10000] },
  { key: 'startDate', invalidValues: [null, '', 'a'] },
  { key: 'endDate', invalidValues: [null, '', 'a'] },
  { key: 'isDateFlexible', invalidValues: [null, 'a', '2', 2] },
  {
    key: 'pricePerMonth',
    invalidValues: [null, '', 'a', 0, 3000],
  },
  { key: 'isPublished', invalidValues: [null, 'a', 2] },
];

const optionalRequestData: { key: string; invalidValues: any[] }[] = [
  { key: 'houseNumber', invalidValues: ['', 'abcdefghijklm'] },
  { key: 'description', invalidValues: [true, 0] },
  { key: 'gpsLatitude', invalidValues: ['', 'abc'] },
  { key: 'gpsLongitude', invalidValues: ['', 'abc'] },
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
/*                                  RESPONSE                                  */
/* -------------------------------------------------------------------------- */
function isResponseOK(response: LeaseEntity) {
  expect(response.id).toBeDefined();
  expect(response.type).toBeDefined();
  expect(response.postCode).toBeDefined();
  expect(response.city).toBeDefined();
  expect(response.surface).toBeDefined();
  expect(response.room).toBeDefined();
  expect(response.startDate).toBeDefined();
  expect(response.endDate).toBeDefined();
  expect(response.isDateFlexible).toBeDefined();
  expect(response.pricePerMonth).toBeDefined();
  expect(response.createdAt).toBeDefined();
  expect(response.updatedAt).toBeDefined();
  expect(response.leaseImages).toBeDefined();
  expect(response.leaseImages.length).toBe(4);
  expect(response.leaseImages[0].url).toBeDefined();
  expect(response.leaseImages[1].url).toBeDefined();
  expect(response.leaseImages[2].url).toBeDefined();
  expect(response.leaseImages[3].url).toBeDefined();
}

function isResponseDetailsOK(response: LeaseDetailsEntity) {
  expect(response.id).toBeDefined();
  expect(response.type).toBeDefined();
  expect(response.street).toBeDefined();
  expect(response.postCode).toBeDefined();
  expect(response.city).toBeDefined();
  expect(response.surface).toBeDefined();
  expect(response.room).toBeDefined();
  expect(response.startDate).toBeDefined();
  expect(response.endDate).toBeDefined();
  expect(response.isDateFlexible).toBeDefined();
  expect(response.pricePerMonth).toBeDefined();
  expect(response.isPublished).toBeDefined();
  expect(response.createdAt).toBeDefined();
  expect(response.updatedAt).toBeDefined();
  expect(response.leaseImages).toBeDefined();
  expect(response.leaseImages.length).toBe(4);
  expect(response.leaseImages[0].url).toBeDefined();
  expect(response.leaseImages[1].url).toBeDefined();
  expect(response.leaseImages[2].url).toBeDefined();
  expect(response.leaseImages[3].url).toBeDefined();
  expect(response.user.id).toBeDefined();
  expect(response.user.firstName).toBeDefined();
  expect(response.user.lastName).toBeDefined();
  expect(response.user.profilePictureName).toBeDefined();
}

/* -------------------------------------------------------------------------- */
/*                                 GET LEASES                                 */
/* -------------------------------------------------------------------------- */
describe('GET /leases', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => await beforeTests());
  beforeEach(async () => await beforeTest());
  afterAll(async () => await afterTests());

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

    response.forEach((lease: LeaseEntity) => isResponseOK(lease));
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

    isResponseDetailsOK(response);
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

    response.forEach((lease: LeaseEntity) => isResponseOK(lease));
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

    isResponseDetailsOK(response);
  });

  it('should return status 400 when a mandatory attribute is missing', async () => {
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
    for (const attribute of mandatoryRequestData) {
      const data = { ...lease };
      delete data[attribute.key];

      await pactum
        .spec()
        .post('/leases')
        .withHeaders('Authorization', `Bearer ${jwt}`)
        .withBody({ ...data })
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

/* -------------------------------------------------------------------------- */
/*                                 PUT LEASE                                  */
/* -------------------------------------------------------------------------- */
describe('PUT /leases/:id', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should update a lease when access_token and all attributes are valid', async () => {
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
      .put(`/leases/${lease.id}`)
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ ...lease, leaseImages })
      .expectStatus(200)
      .returns('res.body');

    isResponseDetailsOK(response);
  });

  it('should return status 400 when a mandatory attribute is missing', async () => {
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
    for (const attribute of mandatoryRequestData) {
      const data = { ...lease };
      delete data[attribute.key];
      await pactum
        .spec()
        .put('/leases/1')
        .withHeaders('Authorization', `Bearer ${jwt}`)
        .withBody({ ...data })
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
          .put('/leases/1')
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

/* -------------------------------------------------------------------------- */
/*                                DELETE LEASE                                */
/* -------------------------------------------------------------------------- */
describe('DELETE /leases/:id', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should delete a lease when access_token is valid', async () => {
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
    await pactum
      .spec()
      .delete(`/leases/${lease.id}`)
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(204);
  });

  it('should return status 404 when lease does not exist', async () => {
    // Create 1 fake user
    const user = await prismaService.user.create({ data: await fakeUser() });
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
    await pactum
      .spec()
      .delete('/leases/9999999')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(404);
  });

  it('should return status 401 when lease does not belong to user', async () => {
    // Create 2 fakes user
    const userAuthenticated = await prismaService.user.create({
      data: await fakeUser(),
    });
    const userWithLease = await prismaService.user.create({
      data: {
        firstName: 'first',
        passwordHash: 'password',
        email: 'second@mail.com',
      },
    });
    // Create 1 fake lease with 4 leaseImage
    const leaseImages = [];
    for (let index = 0; index < 4; index++) {
      leaseImages.push(fakeLeaseImage());
    }
    const lease = await prismaService.lease.create({
      data: {
        ...fakeLease(userWithLease.id),
        leaseImages: {
          createMany: {
            data: leaseImages.map((url) => ({ url })),
          },
        },
      },
    });
    // Payload
    const payload = {
      sub: userAuthenticated.id,
      email: userAuthenticated.email,
    };
    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });
    // Assert
    await pactum
      .spec()
      .delete(`/leases/${lease.id}`)
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(403);
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .delete('/leases/1')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is missing', async () => {
    return pactum.spec().delete('/leases/1').expectStatus(401);
  });
});
