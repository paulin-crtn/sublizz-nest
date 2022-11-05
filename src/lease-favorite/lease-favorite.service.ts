import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaseFavoriteService {
  constructor(private prismaService: PrismaService) {}

  async index(userId: number) {
    return await this.prismaService.leaseFavorite.findMany({
      where: {
        userId,
      },
      include: {
        lease: {
          include: {
            leaseImages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async store(userId: number, leaseId: number) {
    await this.prismaService.lease.findUniqueOrThrow({
      where: {
        id: leaseId,
      },
    });
    return await this.prismaService.leaseFavorite.create({
      data: {
        userId,
        leaseId,
      },
      include: {
        lease: {
          include: {
            leaseImages: true,
          },
        },
      },
    });
  }

  async delete(id: number, userId: number) {
    const leaseFavorite =
      await this.prismaService.leaseFavorite.findUniqueOrThrow({
        where: {
          id,
        },
      });
    if (leaseFavorite.userId !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    return await this.prismaService.leaseFavorite.delete({
      where: { id },
    });
  }
}
