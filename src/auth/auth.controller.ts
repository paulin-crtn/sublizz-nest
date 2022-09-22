/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { isEmail } from 'class-validator';
import striptags from 'striptags';
import { GetUser } from '../user/decorator';
import { AuthService } from './auth.service';
import { ResCookie } from './decorator';
import { PasswordResetDto, SignInDto, SignUpDto } from './dto';
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
  async signUp(@Body() dto: SignUpDto) {
    return await this.authService.signUp(dto);
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
    return await this.authService.logout(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('confirm-email')
  async confirmUserEmail(
    @Query('emailVerificationId', ParseIntPipe) emailVerificationId: number,
    @Query('token') token: string,
  ) {
    const tokenSanitized = striptags(token);
    if (!tokenSanitized) {
      throw new BadRequestException('Token is missing');
    }
    return await this.authService.confirmUserEmail(
      emailVerificationId,
      tokenSanitized,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('reset-password')
  async issuePasswordResetToken(@Query('email') email: string) {
    if (!isEmail(email)) {
      throw new BadRequestException('Email is not valid.');
    }
    return await this.authService.issuePasswordResetToken(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetUserPassword(@Body() dto: PasswordResetDto) {
    return await this.authService.resetUserPassword(dto);
  }
}
