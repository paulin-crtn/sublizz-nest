import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeaseDto } from './dto';

@Injectable()
export class LeaseService {
  constructor(private prismaService: PrismaService) {}

  async getLeases() {
    return await this.prismaService.lease.findMany({
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
    return await this.prismaService.lease.findUnique({
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
    // TO DO : check leaseImages is array of string (url)
    const { leaseImages, ...lease } = dto;
    return await this.prismaService.lease.create({
      data: {
        userId,
        gpsLatitude: '1.3456', // TODO
        gpsLongitude: '-98.6573', // TODO
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
    // TO DO : check leaseImages is array of string (url)
    const { leaseImages, ...leaseDto } = dto;
    return await this.prismaService.lease.update({
      where: {
        id,
      },
      data: {
        gpsLatitude: '1.3456', // TODO
        gpsLongitude: '-98.6573', // TODO
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
  }
}
