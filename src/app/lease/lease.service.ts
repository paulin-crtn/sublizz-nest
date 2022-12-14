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
import { StoreUpdateLeaseDto } from './dto';
import { isAfter } from 'date-fns';
import { CITIES_COORDINATES } from '../../data/citiesCoordinates';
import { ILeasesWithCount } from './interfaces/ILeasesWithCount';

/* -------------------------------------------------------------------------- */
/*                                LEASE SERVICE                               */
/* -------------------------------------------------------------------------- */
@Injectable()
export class LeaseService {
  RESULTS_PER_PAGE: number;

  constructor(private prismaService: PrismaService) {
    this.RESULTS_PER_PAGE = 6;
  }

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC FUNCTIONS                              */
  /* -------------------------------------------------------------------------- */
  async getLeases(page: number | undefined) {
    // PRISMA TRANSACTION
    const data = await this.prismaService.$transaction([
      // COUNT TOTAL DATA
      this.prismaService.lease.count({
        where: {
          isPublished: 1,
        },
      }),
      // FIND DATA (with pagination, if any)
      this.prismaService.lease.findMany({
        where: {
          isPublished: 1,
        },
        include: {
          leaseImages: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: page ? page * this.RESULTS_PER_PAGE - this.RESULTS_PER_PAGE : 0,
        take: this.RESULTS_PER_PAGE,
      }),
    ]);
    const [totalCount, leases] = data;
    return { totalCount, leases };
  }

  async getLeasesFromCity(
    city: string,
    page: number | undefined,
  ): Promise<ILeasesWithCount> {
    // CLOSE COORDINATES
    const { lat, lng } = CITIES_COORDINATES.find(
      (data) => data.city.toLocaleLowerCase() === city.toLocaleLowerCase(),
    );
    const closeCoordinates = this._findCloseCoordinates(+lat, +lng);
    // PRISMA TRANSACTION
    const data = await this.prismaService.$transaction([
      // COUNT TOTAL DATA
      this.prismaService.lease.count({
        where: {
          isPublished: 1,
          ...(!closeCoordinates
            ? { city: { contains: city, mode: 'insensitive' } }
            : {}),
          ...(closeCoordinates
            ? {
                gpsLatitude: {
                  gte: closeCoordinates.latitude.start,
                  lte: closeCoordinates.latitude.end,
                },
                gpsLongitude: {
                  gte: closeCoordinates.longitude.start,
                  lte: closeCoordinates.longitude.end,
                },
              }
            : {}),
        },
      }),
      // FIND DATA (with pagination, if any)
      this.prismaService.lease.findMany({
        where: {
          isPublished: 1,
          ...(city && !closeCoordinates
            ? { city: { contains: city, mode: 'insensitive' } }
            : {}),
          ...(city && closeCoordinates
            ? {
                gpsLatitude: {
                  gte: closeCoordinates.latitude.start,
                  lte: closeCoordinates.latitude.end,
                },
                gpsLongitude: {
                  gte: closeCoordinates.longitude.start,
                  lte: closeCoordinates.longitude.end,
                },
              }
            : {}),
        },
        include: {
          leaseImages: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: page ? page * this.RESULTS_PER_PAGE - this.RESULTS_PER_PAGE : 0,
        take: this.RESULTS_PER_PAGE,
      }),
    ]);
    const [totalCount, leases] = data;
    return { totalCount, leases, cityCoordinates: { lat: +lat, lng: +lng } };
  }

  async getLeasesFromCoordinates(latitudes: string, longitudes: string) {
    // COORDINATES
    const latitudesArr = latitudes.split(',');
    const longitudesArr = longitudes.split(',');
    // FIND DATA (with pagination, if any)
    const leases = await this.prismaService.lease.findMany({
      where: {
        isPublished: 1,
        gpsLatitude: {
          gte: latitudesArr[0],
          lte: latitudesArr[1],
        },
        gpsLongitude: {
          gte: longitudesArr[0],
          lte: longitudesArr[1],
        },
      },
      include: {
        leaseImages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { totalCount: leases.length, leases };
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
      throw new NotFoundException("L'annonce n'existe pas");
    }
    return lease;
  }

  async store(userId: number, dto: StoreUpdateLeaseDto) {
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

  async update(id: number, userId: number, dto: StoreUpdateLeaseDto) {
    const leaseDb = await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
    if (!leaseDb) {
      throw new NotFoundException("L'annonce n'existe pas");
    }
    if (leaseDb.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
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
      throw new NotFoundException("L'annonce n'existe pas");
    }
    if (lease.userId !== userId) {
      throw new ForbiddenException('Accès refusé.');
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

  private _findCloseCoordinates(lat: number, lng: number) {
    // Latitude
    const aroundLatitude = {
      start: Number(lat) - 0.2, // 110.574 km * 0.2 = 22.1km
      end: Number(lat) + 0.2, // 110.574 km * 0.2 = 22.1km
    };
    // Longitude
    // https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-and-km-distance
    const oneDegreeToKm = Math.abs(111.32 * Math.cos(Number(lng)));
    const lngDegreeToSubstract = 1 / (oneDegreeToKm / 22); // 1 = 1 degree and 22 = 22km
    const aroundLongitude = {
      start: Number(lng) - lngDegreeToSubstract,
      end: Number(lng) + lngDegreeToSubstract,
    };
    // Return
    return {
      latitude: aroundLatitude,
      longitude: aroundLongitude,
    };
  }
}
