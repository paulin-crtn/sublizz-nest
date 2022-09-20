/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import * as pactum from 'pactum';
import * as request from 'supertest';
import {
  beforeTests,
  afterTests,
  beforeTest,
  prismaService,
  app,
} from './config';

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
        email: 'email@mail.com',
        password: 'password',
      })
      .expectStatus(201);
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'firstname',
        email: 'email@mail.com',
        password: 'password',
      });

    expect(response.status).toBe(201);
  });

  it('should return status 409 when email already exists', async () => {
    await prismaService.user.create({
      data: {
        firstName: 'firstname',
        email: 'email@mail.com',
        passwordHash: 'password',
      },
    });
    //   return pactum
    //     .spec()
    //     .post('/auth/signup')
    //     .withBody({
    //       firstName: 'firstName',
    //       email: 'email@mail.com',
    //       password: 'password',
    //     })
    //     .expectStatus(409);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'firstname',
        email: 'email@mail.com',
        password: 'password',
      })
      .expect(409);
  });

  it('should return status 400 when firstName attribute is missing', () => {
    // return pactum
    //   .spec()
    //   .post('/auth/signup')
    //   .withBody({
    //     email: 'email@mail.com',
    //     password: 'password',
    //   })
    //   .expectStatus(400);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'email@mail.com',
        password: 'password',
      })
      .expect(400);
  });

  it('should return status 400 when firstName attribute is too short', () => {
    // return pactum
    //   .spec()
    //   .post('/auth/signup')
    //   .withBody({
    //     firstName: 'fi',
    //     email: 'email@mail.com',
    //     password: 'password',
    //   })
    //   .expectStatus(400);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'fi',
        email: 'email@mail.com',
        password: 'password',
      })
      .expect(400);
  });

  it('should return status 400 when email attribute is missing', () => {
    //   return pactum
    //     .spec()
    //     .post('/auth/signup')
    //     .withBody({
    //       firstName: 'firstname',
    //       password: 'password',
    //     })
    //     .expectStatus(400);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'firstname',
        password: 'password',
      })
      .expect(400);
  });

  it('should return status 400 when email attribute is invalid', () => {
    //   return pactum
    //     .spec()
    //     .post('/auth/signup')
    //     .withBody({
    //       firstName: 'firstName',
    //       email: 'email',
    //       password: 'password',
    //     })
    //     .expectStatus(400);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'firstname',
        email: 'email',
        password: 'password',
      })
      .expect(400);
  });

  it('should return status 400 when password attribute is missing', () => {
    //   return pactum
    //     .spec()
    //     .post('/auth/signup')
    //     .withBody({
    //       firstName: 'firstname',
    //       email: 'email@mail.com',
    //     })
    //     .expectStatus(400);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'firstname',
        email: 'email@mail.com',
      })
      .expect(400);
  });

  it('should return status 400 when password attribute is too long', () => {
    //   return pactum
    //     .spec()
    //     .post('/auth/signup')
    //     .withBody({
    //       firstName: 'firstName',
    //       email: 'email',
    //       password: 'password-password-password-password-password-password',
    //     })
    //     .expectStatus(400);
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'firstname',
        email: 'email@mail.com',
        password: 'password-password-password-password-password-password',
      })
      .expect(400);
  });
});
