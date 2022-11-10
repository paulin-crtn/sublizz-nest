/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaseDto } from './dto';
import { isAfter } from 'date-fns';

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
            phoneNumber: true,
            profilePictureName: true,
          },
        },
      },
    });
    if (!lease) {
      throw new NotFoundException('Lease does not exist.');
    }
    return lease;
  }

  async store(userId: number, dto: LeaseDto) {
    // Count user leases
    const userLeasesCount = await this.prismaService.lease.count({
      where: {
        userId,
      },
    });
    if (userLeasesCount >= 2) {
      throw new ForbiddenException(
        'Un utilisateur ne peut pas ajouter plus de 2 annonces.',
      );
    }
    // Check dates
    await this._checkDates(dto.startDate, dto.endDate);
    // Store data
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
    await this._checkDates(dto.startDate, dto.endDate);
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
  }

  private async _checkDates(startDate: Date, endDate: Date) {
    if (isAfter(startDate, endDate)) {
      throw new BadRequestException(
        'La date de début de peut pas être après la date de fin.',
      );
    }
  }
}
