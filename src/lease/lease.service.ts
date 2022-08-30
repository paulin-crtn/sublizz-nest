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
      },
    });
  }

  async getUserLease(userId: number, id: number) {
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
    // TO DO : lease image : insert + dto
    return await this.prismaService.lease.create({
      data: {
        userId,
        ...dto,
        // leaseImages: {
        //   create: [
        //     {
        //       url: 'http://test.com/image',
        //     },
        //   ],
        // },
      },
    });
  }

  async update(userId: number, id: number, dto: LeaseDto) {
    // TO DO : check start date is before end date
    // TO DO : lease image : insert + dto
    const lease = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
    if (!lease || lease.userId !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    return await this.prismaService.lease.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async delete(userId: number, id: number) {
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
    return true;
  }
}
