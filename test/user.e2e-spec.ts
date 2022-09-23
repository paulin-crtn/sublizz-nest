/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import pactum from 'pactum';
import {
  beforeTests,
  afterTests,
  beforeTest,
  prismaService,
  jwtService,
  configService,
} from './config';

/* -------------------------------------------------------------------------- */
/*                                REQUEST DATA                                */
/* -------------------------------------------------------------------------- */
const mandatoryRequestData: { key: string; invalidValues: any[] }[] = [
  { key: 'firstName', invalidValues: [null, '', 'a', true, 9999] },
  { key: 'email', invalidValues: [null, '', 'a', true, 9999] },
];

const optionalRequestData: { key: string; invalidValues: any[] }[] = [
  { key: 'lastName', invalidValues: ['', 'a', true, 9999] },
  { key: 'password', invalidValues: ['', 'abc', true, 9999] },
  { key: 'profilePictureUrl', invalidValues: ['', 'abc', true, 9999] },
];

/* -------------------------------------------------------------------------- */
/*                        GET AUTHENTICATED USER TESTS                        */
/* -------------------------------------------------------------------------- */
describe('GET /users/me', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return the authenticated user when a valid token is provided', async () => {
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'email@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });
    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );
    return pactum
      .spec()
      .get('/users/me')
      .withHeaders({ Authorization: `Bearer ${token}` })
      .expectStatus(200)
      .expectJsonMatch({
        id: user.id,
        firstName: 'firstname',
        lastName: null,
        email: 'email@mail.com',
        profilePictureUrl: null,
      });
  });

  it('should return status 401 when the provided token is invalid', async () => {
    const token = await jwtService.signAsync(
      { sub: 1, email: 'user@email.com' },
      {
        expiresIn: '15m',
        secret: 'Gh7iU', // Different key
      },
    );
    return pactum
      .spec()
      .get('/users/me')
      .withHeaders({ Authorization: `Bearer ${token}` })
      .expectStatus(401);
  });

  it('should return status 401 when the provided token is expired', async () => {
    const token = await jwtService.signAsync(
      { sub: 1, email: 'user@email.com' },
      {
        expiresIn: '0s',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );
    return pactum
      .spec()
      .get('/users/me')
      .withHeaders({ Authorization: `Bearer ${token}` })
      .expectStatus(401);
  });

  it('should return status 401 when no token is provided', async () => {
    return pactum.spec().get('/users/me').expectStatus(401);
  });
});

/* -------------------------------------------------------------------------- */
/*                              UPDATE USER TESTS                             */
/* -------------------------------------------------------------------------- */
describe('PUT /users/:id', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return the updated user when provided attributes and token are valid', async () => {
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });

    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );

    return pactum
      .spec()
      .put(`/users/${user.id}`)
      .withHeaders({ Authorization: `Bearer ${token}` })
      .withBody({
        firstName: 'new',
        lastName: 'lastname',
        email: 'new@mail.com',
      })
      .expectStatus(200)
      .expectJsonMatch({
        id: user.id,
        firstName: 'new',
        lastName: 'lastname',
        email: 'firstname@mail.com', // Because user need to validate new email
        profilePictureUrl: null,
      });
  });

  it('should return status 404 when user does not exist', async () => {
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });

    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );

    return pactum
      .spec()
      .put('/users/999999999')
      .withHeaders({ Authorization: `Bearer ${token}` })
      .withBody({
        firstName: 'new',
        lastName: 'lastname',
        email: 'new@mail.com',
      })
      .expectStatus(404);
  });

  it('should return status 400 when a mandatory attribute is missing', async () => {
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });

    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );

    for (const attribute of mandatoryRequestData) {
      const data = { ...user };
      delete data[attribute.key];
      await pactum
        .spec()
        .put(`/users/${user.id}`)
        .withHeaders({ Authorization: `Bearer ${token}` })
        .withBody({ ...data })
        .expectStatus(400);
    }
  });

  it('should return status 400 when any attribute is invalid', async () => {
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });

    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );

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
        const data = { ...user };
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

  it('should return status 401 when no token is provided', async () => {
    return pactum
      .spec()
      .put('/users/1')
      .withBody({ lastName: 'lastname' })
      .expectStatus(401);
  });
});
