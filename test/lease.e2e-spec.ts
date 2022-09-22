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
/*                            MANDATORY ATTRIBUTES                            */
/* -------------------------------------------------------------------------- */
const mandatoryRequestAttributes: string[] = [
  'street',
  'postCode',
  'city',
  'description',
  'surface',
  'room',
  'startDate',
  'endDate',
  'isDateFlexible',
  'pricePerMonth',
  'isPublished',
];

const responseAttribute: string[] = [
  ...mandatoryRequestAttributes,
  'id',
  'userId',
  'createdAt',
  'updatedAt',
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
 * Check that all response attributes are defined
 *
 * @param response
 */
function checkResponse(response: LeaseResponse) {
  responseAttribute.forEach((attribute: string) =>
    expect(response[attribute]).toBeDefined(),
  );
  expect(response.leaseImages).toBeDefined();
  expect(response.leaseImages.length).toBe(4);
  expect(response.leaseImages[0].url).toBeDefined();
  expect(response.leaseImages[1].url).toBeDefined();
  expect(response.leaseImages[2].url).toBeDefined();
  expect(response.leaseImages[3].url).toBeDefined();
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

  it('should return status 400 when an attribute is missing', async () => {
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
    for (const attribute of mandatoryRequestAttributes) {
      const data = { ...lease };
      delete data[attribute];

      await pactum
        .spec()
        .post('/leases')
        .withHeaders('Authorization', `Bearer ${jwt}`)
        .withBody({ ...data, leaseImages })
        .expectStatus(400);
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
