/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import * as argon from 'argon2';
import * as pactum from 'pactum';
import { string } from 'pactum-matchers';
import { beforeTests, afterTests, beforeTest, prismaService } from './config';

/* -------------------------------------------------------------------------- */
/*                                SIGNUP TESTS                                */
/* -------------------------------------------------------------------------- */
describe('POST /auth/signup', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return status 201 when all attributes are provided and valid', async () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstname',
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(201);
  });

  it('should return status 409 when email already exists', async () => {
    await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
      },
    });
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstName',
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(409);
  });

  it('should return status 400 when firstName attribute is missing', () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(400);
  });

  it('should return status 400 when firstName attribute is too short', () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'fi',
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(400);
  });

  it('should return status 400 when email attribute is missing', () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstname',
        password: 'password',
      })
      .expectStatus(400);
  });

  it('should return status 400 when email attribute is invalid', () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstName',
        email: 'email',
        password: 'password',
      })
      .expectStatus(400);
  });

  it('should return status 400 when password attribute is missing', () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstname',
        email: 'firstname@mail.com',
      })
      .expectStatus(400);
  });

  it('should return status 400 when password attribute is too long', () => {
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstName',
        email: 'email',
        password: 'password-password-password-password-password-password',
      })
      .expectStatus(400);
  });
});

/* -------------------------------------------------------------------------- */
/*                                SIGNIN TESTS                                */
/* -------------------------------------------------------------------------- */
describe('POST /auth/signin', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return an access_token when credentials are valid and email is verified', async () => {
    const passwordHash = await argon.hash('password');
    await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(200)
      .expectJsonMatch({ access_token: string() })
      .withCookies('refresh_token', string());
  });

  it('should return status 401 when credentials are valid but email is not verified', async () => {
    const passwordHash = await argon.hash('password');
    await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash,
      },
    });
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(401);
  });

  it('should return status 401 when password is invalid', async () => {
    const passwordHash = await argon.hash('password');
    await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'firstname@mail.com',
        password: 'passss',
      })
      .expectStatus(401);
  });

  it('should return status 404 when user does not exist', async () => {
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(404);
  });
});
