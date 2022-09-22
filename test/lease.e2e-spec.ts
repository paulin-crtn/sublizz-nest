/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
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
              data: leaseImages,
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

    expect(response[0].id).toBeDefined();
    expect(response[0].userId).toBeDefined();
    expect(response[0].street).toBeDefined();
    expect(response[0].postCode).toBeDefined();
    expect(response[0].city).toBeDefined();
    expect(response[0].description).toBeDefined();
    expect(response[0].surface).toBeDefined();
    expect(response[0].room).toBeDefined();
    expect(response[0].startDate).toBeDefined();
    expect(response[0].endDate).toBeDefined();
    expect(response[0].isDateFlexible).toBeDefined();
    expect(response[0].pricePerMonth).toBeDefined();
    expect(response[0].isPublished).toBeDefined();
    expect(response[0].createdAt).toBeDefined();
    expect(response[0].updatedAt).toBeDefined();
    expect(response[0].leaseImages).toBeDefined();
    expect(response[0].leaseImages.length).toBe(4);
    expect(response[0].leaseImages[0].url).toBeDefined();
    expect(response[0].leaseImages[1].url).toBeDefined();
    expect(response[0].leaseImages[2].url).toBeDefined();
    expect(response[0].leaseImages[3].url).toBeDefined();
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
            data: leaseImages,
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

    expect(response.id).toBeDefined();
    expect(response.userId).toBeDefined();
    expect(response.street).toBeDefined();
    expect(response.postCode).toBeDefined();
    expect(response.city).toBeDefined();
    expect(response.description).toBeDefined();
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
            data: leaseImages,
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

    expect(response[0].id).toBeDefined();
    expect(response[0].userId).toBeDefined();
    expect(response[0].street).toBeDefined();
    expect(response[0].postCode).toBeDefined();
    expect(response[0].city).toBeDefined();
    expect(response[0].description).toBeDefined();
    expect(response[0].surface).toBeDefined();
    expect(response[0].room).toBeDefined();
    expect(response[0].startDate).toBeDefined();
    expect(response[0].endDate).toBeDefined();
    expect(response[0].isDateFlexible).toBeDefined();
    expect(response[0].pricePerMonth).toBeDefined();
    expect(response[0].isPublished).toBeDefined();
    expect(response[0].createdAt).toBeDefined();
    expect(response[0].updatedAt).toBeDefined();
    expect(response[0].leaseImages).toBeDefined();
    expect(response[0].leaseImages.length).toBe(4);
    expect(response[0].leaseImages[0].url).toBeDefined();
    expect(response[0].leaseImages[1].url).toBeDefined();
    expect(response[0].leaseImages[2].url).toBeDefined();
    expect(response[0].leaseImages[3].url).toBeDefined();
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
