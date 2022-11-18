import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreConversationMessageDto } from './dto';

@Injectable()
export class ConversationMessageService {
  constructor(private prismaService: PrismaService) {}

  async getUserMessages(userId: number) {
    return await this.prismaService.conversationMessage.findMany({
      where: {
        OR: [{ toUserId: userId }, { fromUserId: userId }],
      },
      select: {
        id: true,
        conversationId: true,
        content: true,
        createdAt: true,
        leaseId: true,
        fromUser: {
          select: {
            id: true,
            firstName: true,
            profilePictureName: true,
          },
        },
        toUser: {
          select: {
            id: true,
            firstName: true,
            profilePictureName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async storeMessage(fromUserId: number, dto: StoreConversationMessageDto) {
    const { conversationId, leaseId, toUserId, message } = dto;
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
        leaseId,
        fromUserId,
        toUserId,
        content: message,
      },
    });
  }

  async deleteMessages() {}
}
