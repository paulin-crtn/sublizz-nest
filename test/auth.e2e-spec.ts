/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import argon from 'argon2';
import pactum from 'pactum';
import randomToken from 'rand-token';
import { string } from 'pactum-matchers';
import {
  beforeTests,
  afterTests,
  beforeTest,
  prismaService,
  configService,
  jwtService,
} from './config';
import { fakeUser } from '../src/utils/fakeData';

/* -------------------------------------------------------------------------- */
/*                                SIGNUP TESTS                                */
/* -------------------------------------------------------------------------- */
describe('POST /auth/signup', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => await beforeTests());
  beforeEach(async () => await beforeTest());
  afterAll(async () => await afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should create a user when all attributes are provided and valid', async () => {
    pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        firstName: 'firstname',
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(201);

    const user = await prismaService.user.findUnique({
      where: { email: 'firstname@mail.com' },
    });
    expect(user).toBeDefined();
  });

  it('should return status 409 when email already exists', async () => {
    const data = await fakeUser('name', 'firstname@mail.com');
    await prismaService.user.create({ data });
    return pactum
      .spec()
      .post('/auth/signup')
      .withBody({
        role: 'owner',
        firstName: 'firstname',
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
  it('should signin a user when credentials are valid and email is verified', async () => {
    const data = await fakeUser('firstname', 'firstname@mail.com');
    const user = await prismaService.user.create({ data });
    const response = await pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expectStatus(200)
      .expectJsonMatch({ access_token: string() })
      .returns('res.headers');

    const userDB = await prismaService.user.findUnique({
      where: { email: 'firstname@mail.com' },
    });
    const cookieJwt = response['set-cookie'][0].split(';')[0].split('=')[1];
    const jwtPayload = JSON.parse(
      Buffer.from(cookieJwt.split('.')[1], 'base64').toString(),
    );
    const isTokenValid = await argon.verify(
      userDB.refreshTokenHash,
      jwtPayload.refreshToken,
    );
    expect(isTokenValid).toBe(true);
  });

  it('should return status 401 when credentials are valid but email is not verified', async () => {
    await prismaService.user.create({
      data: {
        role: 'owner',
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash: 'password',
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
    const data = await fakeUser('firstname', 'firstname@mail.com');
    await prismaService.user.create({ data });
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'firstname@mail.com',
        password: 'passssss',
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

/* -------------------------------------------------------------------------- */
/*                                LOGOUT TESTS                                */
/* -------------------------------------------------------------------------- */
describe('POST /auth/logout', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should logout a user when access_token is provided and valid', async () => {
    const data = await fakeUser();
    let user = await prismaService.user.create({ data });
    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        expiresIn: '15m',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );
    pactum
      .spec()
      .post('/auth/logout')
      .withHeaders({ Authorization: `Bearer ${token}` })
      .expectStatus(204);

    user = await prismaService.user.findUnique({
      where: { id: user.id },
    });
    expect(user.refreshTokenHash).toBeNull();
  });

  it('should return status 401 when no access_token is provided', async () => {
    return pactum.spec().post('/auth/logout').expectStatus(401);
  });
});

/* -------------------------------------------------------------------------- */
/*                            REFRESH TOKENS TESTS                            */
/* -------------------------------------------------------------------------- */
describe('POST /auth/refresh', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should refresh tokens when the provided refresh_token is valid', async () => {
    // Create user
    const data = await fakeUser();
    let user = await prismaService.user.create({ data });
    // Generate the refresh token
    const refreshToken = randomToken.generate(32);
    const refreshTokenHash = await argon.hash(refreshToken);
    // Update user with the refresh token hash
    await prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash,
      },
    });
    // Payload
    const payload = {
      sub: user.id,
      refreshToken,
    };
    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '1w',
      secret: configService.get('REFRESH_JWT_SECRET'),
    });
    // Expect
    const response = await pactum
      .spec()
      .post('/auth/refresh')
      .withCookies({ refresh_token: jwt })
      .expectStatus(200)
      .expectJsonMatch({ access_token: string() })
      .returns('res.headers');

    user = await prismaService.user.findUnique({
      where: { email: user.email },
    });
    const cookieJwt = response['set-cookie'][0].split(';')[0].split('=')[1];
    const jwtPayload = JSON.parse(
      Buffer.from(cookieJwt.split('.')[1], 'base64').toString(),
    );
    const isTokenValid = await argon.verify(
      user.refreshTokenHash,
      jwtPayload.refreshToken,
    );
    expect(isTokenValid).toBe(true);
  });

  it('should return status 401 when refresh_token is expired', async () => {
    const jwt = await jwtService.signAsync(
      {},
      {
        expiresIn: '0s',
        secret: configService.get('REFRESH_JWT_SECRET'),
      },
    );
    return pactum
      .spec()
      .post('/auth/refresh')
      .withCookies({ refresh_token: jwt })
      .expectStatus(401);
  });

  it('should return status 401 when refresh_token is signed with a different key', async () => {
    const jwt = await jwtService.signAsync(
      {},
      {
        expiresIn: '1w',
        secret: 'secret',
      },
    );
    return pactum
      .spec()
      .post('/auth/refresh')
      .withCookies({ refresh_token: jwt })
      .expectStatus(401);
  });

  it('should return status 401 when refresh_token is invalid', () => {
    return pactum
      .spec()
      .post('/auth/refresh')
      .withCookies({ refresh_token: 'token' })
      .expectStatus(401);
  });

  it('should return status 401 when no refresh_token is provided', () => {
    return pactum.spec().post('/auth/refresh').expectStatus(401);
  });
});

/* -------------------------------------------------------------------------- */
/*                                CONFIRM EMAIL                               */
/* -------------------------------------------------------------------------- */
describe('GET /auth/confirm-email', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should confirm email when all query parameters are valid', async () => {
    // Create user
    const data = await fakeUser();
    let user = await prismaService.user.create({ data });
    // Generate the token
    const token = randomToken.generate(32);
    const tokenHash = await argon.hash(token);
    // Create emailVerification
    const emailVerification = await prismaService.emailVerification.create({
      data: {
        userId: user.id,
        email: 'new@mail.com',
        tokenHash,
      },
    });
    // Assert
    await pactum
      .spec()
      .get('/auth/confirm-email')
      .withQueryParams('emailVerificationId', emailVerification.id)
      .withQueryParams('token', token)
      .expectStatus(200)
      .expectJsonMatch({ email: 'new@mail.com' });
    user = await prismaService.user.findUnique({ where: { id: user.id } });
    expect(user.email).toBe('new@mail.com');
    expect(user.emailVerifiedAt).toBeDefined();
  });

  it('should return status 404 when emailVerificationId is invalid', async () => {
    await pactum
      .spec()
      .get('/auth/confirm-email')
      .withQueryParams('emailVerificationId', 9999999)
      .withQueryParams('token', 'token')
      .expectStatus(404);
  });

  it('should return status 401 when token is invalid', async () => {
    // Create user
    const data = await fakeUser();
    const user = await prismaService.user.create({ data });
    // Generate the token
    const token = randomToken.generate(32);
    const tokenHash = await argon.hash(token);
    // Create emailVerification
    const emailVerification = await prismaService.emailVerification.create({
      data: {
        userId: user.id,
        email: 'new@mail.com',
        tokenHash,
      },
    });
    // Assert
    await pactum
      .spec()
      .get('/auth/confirm-email')
      .withQueryParams('emailVerificationId', emailVerification.id)
      .withQueryParams('token', 'token')
      .expectStatus(401);
  });

  it('should return status 400 when emailVerificationId is not provided', async () => {
    await pactum
      .spec()
      .get('/auth/confirm-email')
      .withQueryParams('token', 'token')
      .expectStatus(400);
  });

  it('should return status 400 when token is not provided', async () => {
    await pactum
      .spec()
      .get('/auth/confirm-email')
      .withQueryParams('emailVerificationId', 1)
      .expectStatus(400);
  });
});

/* -------------------------------------------------------------------------- */
/*                            RESET PASSWORD (GET)                            */
/* -------------------------------------------------------------------------- */
describe('GET /auth/reset-password', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should store a reset password token in the DB when user exists', async () => {
    // Create user
    const data = await fakeUser();
    const user = await prismaService.user.create({ data });

    // Assert
    await pactum
      .spec()
      .get('/auth/reset-password/send-token')
      .withQueryParams('email', user.email)
      .expectStatus(200);

    const passwordReset = await prismaService.passwordReset.findFirst({
      where: { userEmail: user.email },
    });

    expect(passwordReset).toBeDefined();
  });

  it('should return status 400 when the email is not provided', () => {
    return pactum
      .spec()
      .get('/auth/reset-password/send-token')
      .expectStatus(400);
  });

  it('should return status 400 when the email is invalid', () => {
    return pactum
      .spec()
      .get('/auth/reset-password/send-token')
      .withQueryParams('email', 'email')
      .expectStatus(400);
  });

  it('should return status 404 when the user does not exists', () => {
    return pactum
      .spec()
      .get('/auth/reset-password/send-token')
      .withQueryParams('email', 'email@mail.com')
      .expectStatus(404);
  });
});

/* -------------------------------------------------------------------------- */
/*                            RESET PASSWORD (POST)                           */
/* -------------------------------------------------------------------------- */
describe('POST /auth/reset-password', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should reset user password when all attributes are valid', async () => {
    // Create user
    const data = await fakeUser();
    const user = await prismaService.user.create({ data });
    // Generate the token
    const token = randomToken.generate(32);
    const tokenHash = await argon.hash(token);
    // Create passwordReset
    await prismaService.passwordReset.create({
      data: {
        userEmail: user.email,
        tokenHash,
      },
    });
    // Assert
    await pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        email: user.email,
        password: 'password',
        token,
      })
      .expectStatus(200);

    const updatedUser = await prismaService.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser.passwordHash).toBeDefined();
    expect(user.passwordHash !== updatedUser.passwordHash).toBeTruthy();
  });

  it('should return status 400 when email is missing', () => {
    return pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        password: 'password',
        token: 'token',
      })
      .expectStatus(400);
  });

  it('should return status 404 when password reset does not exist', () => {
    return pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        email: 'email@mail.com',
        password: 'password',
        token: 'token',
      })
      .expectStatus(404);
  });

  it('should return status 400 when password is missing', () => {
    return pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        email: 'email@mail.com',
        token: 'token',
      })
      .expectStatus(400);
  });

  it('should return status 400 when token is missing', () => {
    return pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        email: 'email@mail.com',
        password: 'password',
      })
      .expectStatus(400);
  });

  it('should return status 401 when token is invalid', async () => {
    // Create user
    const data = await fakeUser();
    const user = await prismaService.user.create({ data });
    // Generate the token
    const token = randomToken.generate(32);
    const tokenHash = await argon.hash(token);
    // Create passwordReset
    await prismaService.passwordReset.create({
      data: {
        userEmail: user.email,
        tokenHash,
      },
    });
    // Assert
    return pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        email: user.email,
        password: 'password',
        token: 'token',
      })
      .expectStatus(401);
  });

  it('should return status 401 when token has expired', async () => {
    // Create user
    const data = await fakeUser();
    const user = await prismaService.user.create({ data });
    // Generate the token
    const token = randomToken.generate(32);
    const tokenHash = await argon.hash(token);
    // Create passwordReset
    await prismaService.passwordReset.create({
      data: {
        userEmail: user.email,
        tokenHash,
        createdAt: new Date(0), // Jan 01 1970
      },
    });
    // Assert
    return pactum
      .spec()
      .post('/auth/reset-password')
      .withBody({
        email: user.email,
        password: 'password',
        token,
      })
      .expectStatus(401);
  });
});
