/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import pactum from 'pactum';
import { fakeLease, fakeUser } from '../src/utils/fakeData';
import {
  afterTests,
  beforeTest,
  beforeTests,
  configService,
  jwtService,
  prismaService,
} from './config';

/* -------------------------------------------------------------------------- */
/*                             STORE CONVERSATION                             */
/* -------------------------------------------------------------------------- */
describe('POST /conversations', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => await beforeTests());
  beforeEach(async () => await beforeTest());
  afterAll(async () => await afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should store a new conversation', async () => {
    // Create 2 fakes user
    const data1 = await fakeUser();
    const userAuthor = await prismaService.user.create({ data: data1 });
    const data2 = await fakeUser();
    const senderAuthor = await prismaService.user.create({ data: data2 });
    // Create fake lease
    const lease = await prismaService.lease.create({
      data: fakeLease(userAuthor.id),
    });
    // Payload
    const payload = {
      sub: senderAuthor.id,
      email: senderAuthor.email,
    };
    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });
    // Assert
    await pactum
      .spec()
      .post('/conversations')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ leaseId: lease.id, message: 'lorem ipsum' })
      .expectStatus(201);
  });

  it('should return status 400 when a conversation already exists', async () => {
    // Create 2 fakes user
    const data1 = await fakeUser();
    const userAuthor = await prismaService.user.create({ data: data1 });
    const data2 = await fakeUser();
    const senderAuthor = await prismaService.user.create({ data: data2 });
    // Create fake lease
    const lease = await prismaService.lease.create({
      data: fakeLease(userAuthor.id),
    });
    // Create a conversation for this lease
    const conversationId = 'RGHJNB67GHJ67';
    await prismaService.conversation.create({
      data: {
        id: conversationId,
        leaseId: lease.id,
      },
    });
    await prismaService.conversationParticipant.createMany({
      data: [
        {
          conversationId,
          userId: userAuthor.id,
        },
        {
          conversationId,
          userId: senderAuthor.id,
        },
      ],
    });
    // Payload
    const payload = {
      sub: senderAuthor.id,
      email: senderAuthor.email,
    };
    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });
    // Assert
    await pactum
      .spec()
      .post('/conversations')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ leaseId: lease.id, message: 'lorem ipsum' })
      .expectStatus(400);
  });

  it("should return status 404 when the lease doesn't exist", async () => {
    // Create 2 fakes user
    const data1 = await fakeUser();
    const userAuthor = await prismaService.user.create({ data: data1 });
    const data2 = await fakeUser();
    const senderAuthor = await prismaService.user.create({ data: data2 });
    // Payload
    const payload = {
      sub: senderAuthor.id,
      email: senderAuthor.email,
    };
    // JWT refresh token
    const jwt = await jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: configService.get('ACCESS_JWT_SECRET'),
    });
    // Assert
    await pactum
      .spec()
      .post('/conversations')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ leaseId: 9999, message: 'lorem ipsum' })
      .expectStatus(404);
  });

  it('should return status 400 when a lease author is starting a conversation with himself', async () => {
    // Create 1 fake user
    const data = await fakeUser();
    const user = await prismaService.user.create({ data });
    // Create fake lease
    const lease = await prismaService.lease.create({
      data: fakeLease(user.id),
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
    await pactum
      .spec()
      .post('/conversations')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ leaseId: lease.id, message: 'lorem ipsum' })
      .expectStatus(400);
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .post('/conversations')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is not provided', async () => {
    return pactum.spec().post('/conversations').expectStatus(401);
  });
});
