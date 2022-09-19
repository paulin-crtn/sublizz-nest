/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignUpDto } from '../src/auth/dto';

/* -------------------------------------------------------------------------- */
/*                                  MAIN TEST                                 */
/* -------------------------------------------------------------------------- */
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => {
    // Create App
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(process.env.APP_PORT); // Needed for pactum

    // Clean DB
    prismaService = app.get(PrismaService);
    await prismaService.cleanDb();

    // Pactum
    pactum.request.setBaseUrl(
      process.env.APP_DOMAIN + ':' + process.env.APP_PORT,
    );
  });

  afterAll(() => {
    app.close();
  });

  describe('Authentication', () => {
    describe('POST /auth/signup', () => {
      const dto: SignUpDto = {
        firstName: 'Pascal',
        email: 'email@mail.com',
        password: 'password',
      };
      it('should signup a user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('POST /auth/signin', () => {});
  });
});
