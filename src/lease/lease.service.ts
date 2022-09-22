/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaseDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                             LEASE SERVICE CLASS                            */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LeaseService {
  constructor(private prismaService: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async getLeases() {
    return await this.prismaService.lease.findMany({
      where: {
        isPublished: 1,
      },
      include: {
        leaseImages: true,
      },
    });
  }

  async getUserLeases(userId: number) {
    return await this.prismaService.lease.findMany({
      where: {
        userId,
      },
      include: {
        leaseImages: true,
      },
    });
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
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (!lease) {
      throw new NotFoundException('Lease does not exist.');
    }
    return lease;
  }

  async getUserLease(id: number, userId: number) {
    return await this.prismaService.lease.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        leaseImages: true,
      },
    });
  }

  async store(userId: number, dto: LeaseDto) {
    // TO DO : check start date is before end date
    const { leaseImages, ...lease } = dto;
    return await this.prismaService.lease.create({
      data: {
        userId,
        ...lease,
        leaseImages: {
          createMany: {
            data: leaseImages.map((url: string) => ({ url })),
          },
        },
      },
      include: {
        leaseImages: true,
      },
    });
  }

  async update(id: number, userId: number, dto: LeaseDto) {
    const lease = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
    if (!lease || lease.userId !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    // TO DO : check start date is before end date
    const { leaseImages, ...leaseDto } = dto;
    return await this.prismaService.lease.update({
      where: {
        id,
      },
      data: {
        ...leaseDto,
        leaseImages: {
          deleteMany: {},
          createMany: {
            data: leaseImages.map((url: string) => ({ url })),
          },
        },
      },
      include: {
        leaseImages: true,
      },
    });
  }

  async delete(id: number, userId: number) {
    const lease = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
    if (!lease || lease.userId !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    await this.prismaService.lease.delete({
      where: {
        id,
      },
    });
    // TODO: delete file from storage
  }
}
