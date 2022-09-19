/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import * as pactum from 'pactum';
import { beforeTests, afterTests } from './config';
import { SignUpDto } from '../src/auth/dto';

/* -------------------------------------------------------------------------- */
/*                            AUTHENTICATION TESTS                            */
/* -------------------------------------------------------------------------- */
describe('Authentication (e2e)', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => beforeTests());
  afterAll(async () => afterTests());

  /* ------------------------------- SIGNUP TEST ------------------------------ */
  describe('POST /auth/signup', () => {
    const dto: SignUpDto = {
      firstName: 'Pascal',
      email: 'email@mail.com',
      password: 'password',
    };
    it('should signup a user', (done) => {
      pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      done();
    });
  });

  describe('POST /auth/signin', () => {});
});
