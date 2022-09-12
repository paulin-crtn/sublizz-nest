import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt',
) {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    // Find the user by id
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }
    // If user's email is not verified throw exception
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Email must be verified.');
    }
    // Return user
    delete user.passwordHash;
    delete user.refreshTokenHash;
    return user;
  }
}
