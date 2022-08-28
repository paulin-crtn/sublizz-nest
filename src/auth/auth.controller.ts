/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { JwtGuard } from './guard';

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

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout() {}

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, newRefreshToken } =
      await this.authService.checkRefreshToken(request.cookies?.refresh_token);
    response.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);
    return { access_token: accessToken };
  }
}
