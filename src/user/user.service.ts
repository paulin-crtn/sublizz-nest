import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
