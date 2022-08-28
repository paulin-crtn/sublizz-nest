import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import * as randomToken from 'rand-token';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Sign up new user
   *
   * @param dto
   * @returns
   */
  async signUp(dto: SignUpDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Generate the password hash
    const passwordHash = await argon.hash(dto.password);
    try {
      // Save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
        },
      });
      // Generate tokens
      const accessToken = await this.issueAccessToken(user.id, user.email);
      const refreshToken = await this.issueRefreshToken(user.id);
      // Return tokens
      return { accessToken, refreshToken };
    } catch (error) {
      // Catch unique constraint violation error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already taken.');
        }
      }
      throw error;
    }
  }

  /**
   * Sign in a user
   *
   * @param dto
   * @returns
   */
  async signIn(dto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Email does not exist.');
    }
    // Compare password
    const isPasswordCorrect = await argon.verify(
      user.passwordHash,
      dto.password,
    );
    // If password incorrect throw exception
    if (!isPasswordCorrect) {
      throw new ForbiddenException('Incorrect password.');
    }
    // Generate tokens
    const accessToken = await this.issueAccessToken(user.id, user.email);
    const refreshToken = await this.issueRefreshToken(user.id);
    // Return tokens
    return { accessToken, refreshToken };
  }

  /**
   * Issue an access token
   *
   * @param userId
   * @param email
   * @returns
   */
  async issueAccessToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });

    return accessToken;
  }

  /**
   * Issue a refresh token
   *
   * @param userId
   */
  async issueRefreshToken(userId: number): Promise<string> {
    const refreshToken = randomToken.generate(32);
    const refreshTokenExpiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7,
    ); // 1 week

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
        refreshTokenExpiresAt,
      },
    });

    return refreshToken;
  }

  async checkRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    // Check refresh token is set
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token is missing.');
    }
    // Find user by refresh token
    const user = await this.prismaService.user.findFirst({
      where: {
        refreshToken,
      },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Refresh token is invalid.');
    }
    // If refresh token is expired throw exception
    if (new Date(Date.now()) > user.refreshTokenExpiresAt) {
      throw new ForbiddenException('Refresh token is expired.');
    }
    // Generate new tokens
    const accessToken = await this.issueAccessToken(user.id, user.email);
    const newRefreshToken = await this.issueRefreshToken(user.id);
    // Return new tokens
    return { accessToken, newRefreshToken };
  }
}
