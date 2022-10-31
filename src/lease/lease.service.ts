/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { LeaseDto } from './dto';
import { LeaseTypeEnum } from './enum';

/* -------------------------------------------------------------------------- */
/*                                LEASE SERVICE                               */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LeaseService {
  constructor(private prismaService: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async getLeases(city: string | undefined) {
    const leases = await this.prismaService.lease.findMany({
      where: {
        isPublished: 1,
        ...(city ? { city } : {}),
      },
      include: {
        leaseImages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return leases.map((lease) => {
      return {
        ...lease,
        type: lease.type as LeaseTypeEnum,
        gpsLatitude: new Decimal(lease.gpsLatitude).toNumber(),
        gpsLongitude: new Decimal(lease.gpsLongitude).toNumber(),
        leaseImages: lease.leaseImages.map((image) => image.name),
      };
    });
  }

  async getUserLeases(userId: number) {
    const leases = await this.prismaService.lease.findMany({
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
    return leases.map((lease) => {
      return {
        ...lease,
        type: lease.type as LeaseTypeEnum,
        gpsLatitude: new Decimal(lease.gpsLatitude).toNumber(),
        gpsLongitude: new Decimal(lease.gpsLongitude).toNumber(),
        leaseImages: lease.leaseImages.map((image) => image.name),
      };
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
            profilePictureName: true,
          },
        },
      },
    });
    if (!lease) {
      throw new NotFoundException('Lease does not exist.');
    }
    return {
      ...lease,
      type: lease.type as LeaseTypeEnum,
      gpsLatitude: new Decimal(lease.gpsLatitude).toNumber(),
      gpsLongitude: new Decimal(lease.gpsLongitude).toNumber(),
      leaseImages: lease.leaseImages.map((image) => image.name),
    };
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
    return {
      ...lease,
      type: lease.type as LeaseTypeEnum,
      gpsLatitude: new Decimal(lease.gpsLatitude).toNumber(),
      gpsLongitude: new Decimal(lease.gpsLongitude).toNumber(),
      leaseImages: lease.leaseImages.map((image) => image.name),
    };
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
    return {
      ...lease,
      type: lease.type as LeaseTypeEnum,
      gpsLatitude: new Decimal(lease.gpsLatitude).toNumber(),
      gpsLongitude: new Decimal(lease.gpsLongitude).toNumber(),
      leaseImages: lease.leaseImages.map((image) => image.name),
    };
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
}
