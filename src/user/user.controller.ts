import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AccessJwtGuard } from 'src/auth/guard';
import { GetUser } from './decorator';

@Controller('users')
export class UserController {
  @UseGuards(AccessJwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
