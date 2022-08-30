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
import { AccessJwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/user/decorator';
import { LeaseDto } from './dto';
import { LeaseService } from './lease.service';

@Controller('leases')
export class LeaseController {
  constructor(private leaseService: LeaseService) {}
  @HttpCode(HttpStatus.OK)
  @Get()
  getLeases() {
    return this.leaseService.getLeases();
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('user')
  getUserLeases(@GetUser('id') userId: number) {
    return this.leaseService.getUserLeases(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getLease(@Param('id', ParseIntPipe) id: number) {
    return this.leaseService.getLease(id);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('user/:id')
  getUserLease(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.leaseService.getUserLease(userId, id);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  store(@GetUser('id') userId: number, @Body() dto: LeaseDto) {
    return this.leaseService.store(userId, dto);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LeaseDto,
  ) {
    return this.leaseService.update(userId, id, dto);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@GetUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.leaseService.delete(userId, id);
  }
}
