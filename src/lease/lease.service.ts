/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeaseDto } from './dto';
import { LeaseTypeEnum } from './enum';

/* -------------------------------------------------------------------------- */
/*                             LEASE SERVICE CLASS                            */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LeaseService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async getLeases() {
    const leases = await this.prismaService.lease.findMany({
      where: {
        isPublished: 1,
      },
      include: {
        leaseImages: true,
      },
    });
    return leases.map((lease) => ({
      ...lease,
      type: lease.type as LeaseTypeEnum,
    }));
  }

  async getUserLeases(userId: number) {
    const leases = await this.prismaService.lease.findMany({
      where: {
        userId,
      },
      include: {
        leaseImages: true,
      },
    });
    return leases.map((lease) => ({
      ...lease,
      type: lease.type as LeaseTypeEnum,
    }));
  }

  async getLease(id: number) {
    const lease = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
      include: {
        leaseImages: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });
    if (!lease) {
      throw new NotFoundException('Lease does not exist.');
    }
    return { ...lease, type: lease.type as LeaseTypeEnum };
  }

  async store(userId: number, dto: LeaseDto) {
    // TO DO : check start date is before end date
    const { leaseImages, ...leaseDto } = dto;
    const lease = await this.prismaService.lease.create({
      data: {
        userId,
        ...leaseDto,
        leaseImages: {
          createMany: {
            data: leaseImages
              ? leaseImages.map((url: string) => ({ url }))
              : [],
          },
        },
      },
      include: {
        leaseImages: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });
    return { ...lease, type: lease.type as LeaseTypeEnum };
  }

  async update(id: number, userId: number, dto: LeaseDto) {
    const leaseDb = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
    if (!leaseDb) {
      throw new NotFoundException('Lease does not exist.');
    }
    if (leaseDb.userId !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    // TO DO : check start date is before end date
    const { leaseImages, ...leaseDto } = dto;
    const lease = await this.prismaService.lease.update({
      where: {
        id,
      },
      data: {
        ...leaseDto,
        leaseImages: {
          deleteMany: {},
          createMany: {
            data: leaseImages
              ? leaseImages.map((url: string) => ({ url }))
              : [],
          },
        },
      },
      include: {
        leaseImages: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });
    return { ...lease, type: lease.type as LeaseTypeEnum };
  }

  async delete(id: number, userId: number) {
    const lease = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
    if (!lease) {
      throw new NotFoundException('Lease does not exist.');
    }
    if (lease.userId !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    await this.prismaService.lease.delete({
      where: {
        id,
      },
    });
    // TODO: delete file from storage
  }

  async report(userId: number, leaseId: number, reason: string) {
    await this.mailService.sendAdminLeaseReport(userId, leaseId, reason);
  }
}
