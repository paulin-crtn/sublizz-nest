import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StoreConversationMessageDto } from './dto';

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
    return await this.prismaService.conversationMessage.findMany({
      where: {
        conversationId: { in: conversationsIds },
      },
      include: {
        conversation: {
          include: {
            lease: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            profilePictureName: true,
          },
        },
      },
    });
  }

  async storeMessage(fromUserId: number, dto: StoreConversationMessageDto) {
    const { conversationId, message } = dto;
    const conversationIdDB = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });
    if (!conversationIdDB) {
      throw new NotFoundException("Cette conversation n'existe pas");
    }
    return await this.prismaService.conversationMessage.create({
      data: {
        conversationId,
        fromUserId,
        content: message,
      },
    });
  }

  async deleteMessages() {}
}
