import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeaseDto } from './dto';

@Injectable()
export class LeaseService {
  constructor(private prismaService: PrismaService) {}

  async index() {
    return await this.prismaService.lease.findMany();
  }

  async show(id: number) {
    return await this.prismaService.lease.findUnique({
      where: {
        id,
      },
    });
  }

  async store(userId: number, dto: LeaseDto) {
    // TO DO : check start date is before end date
    // TO DO : lease image : insert + dto
    return await this.prismaService.lease.create({
      data: {
        userId,
        city: dto.city,
        description: dto.description,
        surface: dto.surface,
        room: dto.room,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isDateFlexible: dto.isDateFlexible,
        pricePerMonth: dto.pricePerMonth,
      },
    });

    // leaseImages: {
    //   create: [{
    //     leaseId: 1
    //     url: ''
    //   }],
    // },
  }

  async update(userId: number, dto: LeaseDto) {}

  async delete(id: number) {
    await this.prismaService.lease.delete({
      where: {
        id,
      },
    });
    return true;
  }
}
