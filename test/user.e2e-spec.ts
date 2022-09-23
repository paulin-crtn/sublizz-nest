/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import pactum from 'pactum';
import { fakeUser } from '../utils/fakeData';
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
    // Create user
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });
    // Create token
    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );
    // Assert
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
    // Create user
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });
    // Create token
    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );
    // Assert
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
    // Create user
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
      },
    });
    // Create token
    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );
    // Assert
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
    // Create user
    const user = await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
        emailVerifiedAt: new Date(),
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

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .put('/users/1')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is missing', async () => {
    return pactum.spec().put('/users/1').expectStatus(401);
  });
});

/* -------------------------------------------------------------------------- */
/*                                 DELETE USER                                */
/* -------------------------------------------------------------------------- */
describe('DELETE /users/:id', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should delete the authenticated user when access_token is valid', async () => {
    // Create user
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
    return pactum
      .spec()
      .delete(`/users/${user.id}`)
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(204);
  });

  it('should return status 404 when user does not exist', async () => {
    // Create user
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
    return pactum
      .spec()
      .delete('/users/9999999')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(404);
  });

  it('should return status 401 when user does not match authenticated user', async () => {
    // Create user
    const user = await prismaService.user.create({ data: await fakeUser() });
    // Payload
    const payload = {
      sub: 99999999,
      email: 'userEmail',
    };
    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });
    // Assert
    return pactum
      .spec()
      .delete(`/users/${user.id}`)
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .delete('/users/1')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is missing', async () => {
    return pactum.spec().delete('/users/1').expectStatus(401);
  });
});
