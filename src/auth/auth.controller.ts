/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { ResCookie } from './decorator/set-cookie.decorator';
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
  async signUp(@Body() dto: SignUpDto, @ResCookie() response: any) {
    const { accessToken, refreshToken } = await this.authService.signUp(dto);
    response.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() dto: SignInDto, @ResCookie() response: any) {
    const { accessToken, refreshToken } = await this.authService.signIn(dto);
    response.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }

  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@GetUser() user: User, @ResCookie() response: any) {
    const { accessToken, newRefreshToken } =
      await this.authService.refreshTokens(user);
    response.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@GetUser('id') userId: number) {
    await this.authService.logout(userId);
    return;
  }
}
