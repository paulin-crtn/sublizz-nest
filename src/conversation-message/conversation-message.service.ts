import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationMessageService {
  constructor(private prismaService: PrismaService) {}

  async getUserMessages(userId: number) {
    const conversationsParticipant =
      await this.prismaService.conversationParticipant.findMany({
        where: { userId },
      });

    if (!conversationsParticipant.length) {
      return [];
    }
    const conversationsIds = conversationsParticipant.reduce(
      (prev, curr) => [...prev, curr.conversationId],
      [],
    );

    return await this.prismaService.conversation.findMany({
      where: {
        id: { in: conversationsIds },
      },
      select: {
        id: true,
        conversationParticipants: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePictureName: true,
              },
            },
          },
        },
        conversationMessages: {
          select: {
            id: true,
            fromUserId: true,
            content: true,
            createdAt: true,
          },
        },
        lease: {
          include: {
            leaseImages: true,
          },
        },
      },
    });
  }

  async storeMessage(
    fromUserId: number,
    conversationId: string,
    message: string,
  ) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        conversationParticipants: {
          include: {
            user: true,
          },
        },
        lease: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!conversation) {
      throw new NotFoundException("Cette conversation n'existe pas");
    }
    const participant = conversation.conversationParticipants.find(
      (participant) => participant.userId !== fromUserId,
    );
    const conversationMessage =
      await this.prismaService.conversationMessage.create({
        data: {
          conversationId,
          fromUserId,
          content: message,
          messageReadState: {
            create: {
              userId: participant.userId,
            },
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureName: true,
            },
          },
        },
      });
    conversationMessage['fromUser'] = conversationMessage['user'];
    delete conversationMessage['user'];
    return {
      lease: conversation.lease,
      toUser: participant.user,
      conversationMessage,
    };
  }

  async deleteMessages() {}
}
