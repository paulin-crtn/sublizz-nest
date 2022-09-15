import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AccessJwtGuard } from 'src/auth/guard';
import { GetUser } from './decorator';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessJwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, userId, dto);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.userService.delete(id, userId);
  }
}
