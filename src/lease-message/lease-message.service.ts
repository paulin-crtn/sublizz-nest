import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
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
    const leases = await this.prismaService.lease.findMany({
      where: {
        leaseMessages: {
          some: {
            fromUserId: userId,
          },
        },
      },
      include: {
        leaseImages: true,
        leaseMessages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return leases.map((lease) => ({
      ...lease,
      type: lease.type as LeaseTypeEnum,
    }));
  }

  async store(fromUser: User, dto: LeaseMessageDto) {
    const lease = await this.prismaService.lease.findUnique({
      where: {
        id: dto.leaseId,
      },
      include: {
        user: true,
      },
    });
    if (!lease) {
      throw new NotFoundException('Lease does not exist.');
    }
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
