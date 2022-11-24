import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import randomToken from 'rand-token';
import { ConversationMessageService } from '../conversation-message/conversation-message.service';

@Injectable()
export class ConversationService {
  constructor(
    private prismaService: PrismaService,
    private conversationMessageService: ConversationMessageService,
  ) {}

  async storeConversation(
    fromUserId: number,
    leaseId: number,
    message: string,
  ) {
    // Check user has not an existing conversation for this lease
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        leaseId,
      },
      include: {
        conversationParticipants: true,
      },
    });
    if (!!conversations.length) {
      conversations.map((conversation) => {
        const participantIds = conversation.conversationParticipants.reduce(
          (prev, curr) => [...prev, curr.userId],
          [],
        );
        if (participantIds.includes(fromUserId)) {
          throw new BadRequestException(
            'Une conversation existe déjà pour cette annonce.',
          );
        }
      });
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
        'Vous ne pouvez pas envoyer un message à vous-même.',
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
    // Return conversation id
    return conversationId;
  }

  async getUnreadConversations(userId: number) {
    return await this.prismaService.messageReadState.findMany({
      where: {
        userId,
      },
      select: {
        message: {
          select: {
            id: true,
            conversationId: true,
          },
        },
      },
    });
  }

  async setConversationAsRead(userId: number, conversationId: string) {
    const messages = await this.prismaService.conversationMessage.findMany({
      where: {
        conversationId,
      },
    });
    const messagesId = messages.reduce((prev, acc) => [...prev, acc.id], []);
    return await this.prismaService.messageReadState.deleteMany({
      where: {
        userId,
        messageId: {
          in: messagesId,
        },
      },
    });
  }
}
