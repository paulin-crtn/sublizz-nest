import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findUserByEmail(email: string): Promise<User> {
    // Find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new UnauthorizedException('Email does not exist.');
    }
    // If user's email is not verified throw exception
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Email must be verified.');
    }
    // Return user
    return user;
  }

  async updateUserByEmail(email: string, data: Partial<User>) {
    return await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        ...data,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user || user.id !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: number, userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user || user.id !== userId) {
      throw new ForbiddenException('Access to resource denied.');
    }
    await this.prismaService.user.delete({
      where: {
        id,
      },
    });
  }
}
