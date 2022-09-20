/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import * as pactum from 'pactum';
import supertest from 'supertest';
import * as request from 'supertest';
import {
  beforeTests,
  afterTests,
  beforeTest,
  prismaService,
  app,
} from './config';
import * as argon from 'argon2';

/* -------------------------------------------------------------------------- */
/*                                SIGNIN TESTS                                */
/* -------------------------------------------------------------------------- */
describe('POST /auth/signin', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  beforeEach(async () => beforeTest());
  afterAll(async () => afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return status 200 and an access_token when credentials are valid and email is verified', async () => {
    const passwordHash = await argon.hash('password');
    await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'firstname@mail.com',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    // return pactum
    //   .spec()
    //   .post('/auth/signin')
    //   .withBody({
    //     email: 'email@mail.com',
    //     password: 'password',
    //   })
    //   .expectStatus(200);
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'firstname@mail.com',
        password: 'password',
      });
    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
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
    // return pactum
    //   .spec()
    //   .post('/auth/signin')
    //   .withBody({
    //     email: 'email@mail.com',
    //     password: 'password',
    //   })
    //   .expectStatus(401);
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expect(401);
  });

  it('should return status 401 when password is invalid', async () => {
    const passwordHash = await argon.hash('password');
    await prismaService.user.create({
      data: {
        firstName: 'firstName',
        email: 'email@mail.com',
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    // return pactum
    //   .spec()
    //   .post('/auth/signin')
    //   .withBody({
    //     email: 'email@mail.com',
    //     password: 'passss',
    //   })
    //   .expectStatus(401);
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'firstname@mail.com',
        password: 'pass',
      })
      .expect(401);
  });

  it('should return status 401 when user does not exist', async () => {
    return pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: 'email@mail.com',
        password: 'password',
      })
      .expectStatus(401);
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'firstname@mail.com',
        password: 'password',
      })
      .expect(401);
  });
});
