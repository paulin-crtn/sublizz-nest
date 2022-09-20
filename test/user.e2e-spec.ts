/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import * as request from 'supertest';
import {
  beforeTests,
  afterTests,
  beforeTest,
  prismaService,
  app,
  jwtService,
  configService,
} from './config';

/* -------------------------------------------------------------------------- */
/*                                SIGNUP TESTS                                */
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

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: user.id,
      firstName: user.firstName,
      lastName: null,
      email: user.email,
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

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('should return status 401 when the provided token is expired', async () => {
    const token = await jwtService.signAsync(
      { sub: 1, email: 'user@email.com' },
      {
        expiresIn: '0s',
        secret: configService.get('ACCESS_JWT_SECRET'),
      },
    );

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('should return status 401 when no token is provided', async () => {
    const response = await request(app.getHttpServer()).get('/users/me');
    expect(response.status).toBe(401);
  });
});
