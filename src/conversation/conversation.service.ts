import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import randomToken from 'rand-token';

@Injectable()
export class ConversationService {
  constructor(private prismaService: PrismaService) {}

  async generateConversationId(leaseId: number, fromUserId: number) {
    const message = await this.prismaService.conversationMessage.findFirst({
      where: {
        leaseId,
        fromUserId,
      },
    });
    if (message) {
      throw new BadRequestException(
        'Vous avez déjà envoyé un message pour cette annonce',
      );
    }
    return randomToken.generate(12);
  }
}
