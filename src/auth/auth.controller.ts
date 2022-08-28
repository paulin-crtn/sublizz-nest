/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { SignInDto, SignUpDto } from './dto';
import { AccessJwtGuard, RefreshJwtGuard } from './guard';

/* -------------------------------------------------------------------------- */
/*                                  CONSTANT                                  */
/* -------------------------------------------------------------------------- */
const COOKIE_NAME = 'refresh_token';
const COOKIE_OPTIONS = {
  path: '/',
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'dev',
  // domain: 'sublizz.com',
};

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signUp(dto);
    response.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(dto);
    response.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@GetUser('id') userId: number) {
    await this.authService.logout(userId);
    return;
  }

  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @GetUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, newRefreshToken } =
      await this.authService.refreshTokens(user);
    response.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }
}
