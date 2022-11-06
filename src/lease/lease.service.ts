/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaseDto } from './dto';

/* -------------------------------------------------------------------------- */
/*                                LEASE SERVICE                               */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LeaseService {
  constructor(private prismaService: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async getLeases(city: string | undefined, page: string | undefined) {
    const RESULTS_PER_PAGE = 5;
    const data = await this.prismaService.$transaction([
      this.prismaService.lease.count({
        where: {
          isPublished: 1,
          ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        },
      }),
      this.prismaService.lease.findMany({
        where: {
          isPublished: 1,
          ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
        },
        include: {
          leaseImages: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: page ? Number(page) * RESULTS_PER_PAGE - RESULTS_PER_PAGE : 0,
        take: RESULTS_PER_PAGE,
      }),
    ]);
    const [totalCount, leases] = data;
    return { totalCount, leases };
  }

  async getUserLeases(userId: number) {
    return await this.prismaService.lease.findMany({
      where: {
        userId,
      },
      include: {
        leaseImages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLease(id: number) {
    return await this.prismaService.lease.findUniqueOrThrow({
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
            profilePictureName: true,
          },
        },
      },
    });
  }

  async store(userId: number, dto: LeaseDto) {
    // TO DO : check start date is before end date
    const { leaseImages, ...leaseDto } = dto;
    return await this.prismaService.lease.create({
      data: {
        userId,
        ...leaseDto,
        leaseImages: {
          createMany: {
            data: leaseImages
              ? leaseImages.map((name: string) => ({ name }))
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
            profilePictureName: true,
          },
        },
      },
    });
  }

  async update(id: number, userId: number, dto: LeaseDto) {
    const leaseDb = await this.prismaService.lease.findUniqueOrThrow({
      where: {
        id,
      },
    });
    if (leaseDb.userId !== userId) {
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
            data: leaseImages
              ? leaseImages.map((name: string) => ({ name }))
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
            profilePictureName: true,
          },
        },
      },
    });
  }

  async delete(id: number, userId: number) {
    const lease = await this.prismaService.lease.findUniqueOrThrow({
      where: {
        id,
      },
    });
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
}
