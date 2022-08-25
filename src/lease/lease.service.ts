import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeaseService {
  constructor(private prismaService: PrismaService) {}
  async findAll() {
    const properties = await this.prismaService.lease.findMany();
    return properties;
  }
}
