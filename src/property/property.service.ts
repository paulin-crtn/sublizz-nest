import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PropertyService {
  constructor(private prismaService: PrismaService) {}
  async findAll() {
    const properties = await this.prismaService.property.findMany();
    return properties;
  }
}
