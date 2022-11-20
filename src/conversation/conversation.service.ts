import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import randomToken from 'rand-token';

@Injectable()
export class ConversationService {
  constructor(private prismaService: PrismaService) {}

  async storeConversation(leaseId: number, fromUserId: number) {
    // Check user has not an existing conversation for this lease
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        leaseId,
      },
    });
    if (!!conversations.length) {
      const conversationsIds = conversations.reduce(
        (prev, curr) => [...prev, curr.id],
        [],
      );
      const participant =
        await this.prismaService.conversationParticipant.findFirst({
          where: {
            conversationId: { in: conversationsIds },
            AND: [{ userId: fromUserId }],
          },
        });
      if (participant) {
        throw new BadRequestException(
          'Vous avez déjà envoyé un message pour cette annonce',
        );
      }
    }
    // Check user is not the lease author
    const lease = await this.prismaService.lease.findUnique({
      where: { id: leaseId },
      include: { user: true },
    });
    if (!lease) {
      throw new NotFoundException("Cette annonce n'existe pas.");
    }
    if (lease.user.id === fromUserId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous envoyer un message.',
      );
    }
    // Create and store new conversation id
    const conversationId = randomToken.generate(16);
    await this.prismaService.conversation.create({
      data: {
        id: conversationId,
        leaseId,
      },
    });
    // Store participants
    await this.prismaService.conversationParticipant.createMany({
      data: [
        { conversationId, userId: fromUserId },
        { conversationId, userId: lease.user.id },
      ],
    });
    // Return
    return conversationId;
  }
}
