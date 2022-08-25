import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async signUp(dto: SignUpDto) {
    // Generate tthe password hash
    const hash = await argon.hash(dto.password);
    try {
      // Save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          hash,
        },
      });
      // Return the saved user
      delete user.hash;
      return user;
    } catch (error) {
      // Catch unique constraint violation error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already taken');
        }
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto) {
    // Find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Email does not exist');
    }
    // Compare password
    const isPasswordCorrect = await argon.verify(user.hash, dto.password);
    // If password incorrect throw exception
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Incorrect password');
    }
    // Return the user
    delete user.hash;
    return user;
  }
}
