import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { LeaseTypeEnum } from '../lease/enum';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeaseMessageDto } from './dto';

@Injectable()
export class LeaseMessageService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  async getUserMessages(userId: number) {
    return await this.prismaService.lease.findMany({
      where: {
        leaseMessages: {
          some: {
            fromUserId: userId,
          },
        },
      },
      include: {
        leaseMessages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async store(fromUser: User, dto: LeaseMessageDto) {
    const lease = await this.prismaService.lease.findUniqueOrThrow({
      where: {
        id: dto.leaseId,
      },
      include: {
        user: true,
      },
    });
    await this.prismaService.leaseMessage.create({
      data: {
        leaseId: lease.id,
        fromUserId: fromUser.id,
        content: dto.message,
      },
    });
    await this.mailService.sendUserLeaseMessage(fromUser, lease, dto.message);
  }
}
