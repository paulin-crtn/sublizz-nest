import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          let refreshToken = request?.cookies['refresh_token'];
          if (!refreshToken) {
            return null;
          }
          return refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; refreshToken: string }) {
    // Find the user by id
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });
    // If user does not exist throw exception
    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }
    // Compare password
    const isRefreshTokenCorrect = await argon.verify(
      user.refreshTokenHash,
      payload.refreshToken,
    );
    // If password incorrect throw exception
    if (!isRefreshTokenCorrect) {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    // Return user
    return user;
  }
}
