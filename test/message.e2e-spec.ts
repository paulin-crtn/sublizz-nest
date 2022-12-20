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
/*                                GET MESSAGES                                */
/* -------------------------------------------------------------------------- */
describe('GET /conversation-messages', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => await beforeTests());
  beforeEach(async () => await beforeTest());
  afterAll(async () => await afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should return all user conversation messages', async () => {
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
    // Create a message for this conversation
    await prismaService.conversationMessage.create({
      data: {
        conversationId,
        fromUserId: senderAuthor.id,
        content: 'lorem ipsum',
      },
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
    const response = await pactum
      .spec()
      .get('/conversation-messages')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .expectStatus(200)
      .expectJsonLength(1)
      .returns('res.body');

    expect(response[0].id).toBe(conversationId);
    expect(response[0].participants.length).toBe(2);
    expect(response[0].messages.length).toBe(1);
    expect(response[0].lease.id).toBe(lease.id);
    expect(response[0].messages[0].fromUserId).toBe(senderAuthor.id);
    expect(response[0].messages[0].content).toBe('lorem ipsum');
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .get('/conversation-messages')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is not provided', async () => {
    return pactum.spec().get('/conversation-messages').expectStatus(401);
  });
});

/* -------------------------------------------------------------------------- */
/*                                STORE MESSAGE                               */
/* -------------------------------------------------------------------------- */
describe('POST /conversation-messages', () => {
  /* ------------------------------ CONFIGURATION ----------------------------- */
  beforeAll(async () => await beforeTests());
  beforeEach(async () => await beforeTest());
  afterAll(async () => await afterTests());

  /* ---------------------------------- TESTS --------------------------------- */
  it('should store a conversation messages', async () => {
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
      .post('/conversation-messages')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ conversationId, message: 'lorem ipsum' })
      .expectStatus(201);
  });

  it("should return status 404 when the conversation doesn't exist", async () => {
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
      .post('/conversation-messages')
      .withHeaders('Authorization', `Bearer ${jwt}`)
      .withBody({ conversationId: 'ABCDEFGHIJKLMNO', message: 'lorem ipsum' })
      .expectStatus(404);
  });

  it('should return status 401 when access_token is invalid', async () => {
    return pactum
      .spec()
      .post('/conversation-messages')
      .withHeaders('Authorization', `Bearer token`)
      .expectStatus(401);
  });

  it('should return status 401 when access_token is not provided', async () => {
    return pactum.spec().post('/conversation-messages').expectStatus(401);
  });
});