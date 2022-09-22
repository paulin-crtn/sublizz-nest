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
      .withBody({ lastName: 'lastname' })
      .expectStatus(200)
      .expectJsonMatch({
        id: user.id,
        firstName: 'firstname',
        lastName: 'lastname',
        email: 'firstname@mail.com',
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
      .withBody({ lastName: 'lastname' })
      .expectStatus(404);
  });

  it('should return status 400 when provided attributes are invalid', async () => {
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
      .put(`/users/user.id`)
      .withHeaders({ Authorization: `Bearer ${token}` })
      .withBody({ email: 'email' })
      .expectStatus(400);
  });

  it('should return status 401 when no token is provided', async () => {
    return pactum
      .spec()
      .put('/users/1')
      .withBody({ lastName: 'lastname' })
      .expectStatus(401);
  });
});
