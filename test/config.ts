/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */
let app: INestApplication;
export let prismaService: PrismaService;
export let jwtService: JwtService;
export let configService: ConfigService;

/**
 * Function to call before tests
 */
export const beforeTests = async (): Promise<void> => {
  // Create Module
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  // Create App
  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  await app.listen(process.env.APP_PORT); // Needed for pactum

  // Services
  configService = app.get(ConfigService);
  prismaService = app.get(PrismaService);
  jwtService = app.get(JwtService);

  // Pactum
  pactum.request.setBaseUrl(
    process.env.APP_DOMAIN + ':' + process.env.APP_PORT,
  );
};

/**
 * Function to call before each test
 */
export const beforeTest = async (): Promise<void> => {
  await prismaService.cleanDb();
};

/**
 * Function to call after tests
 */
export const afterTests = async (): Promise<void> => {
  await prismaService.$disconnect();
  await app.close();
};
