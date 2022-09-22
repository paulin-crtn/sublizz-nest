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
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { LeaseDto } from './dto';
import { LeaseService } from './lease.service';

@Controller('leases')
export class LeaseController {
  constructor(private leaseService: LeaseService) {}
  @HttpCode(HttpStatus.OK)
  @Get()
  async getLeases() {
    return await this.leaseService.getLeases();
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUserLeases(@GetUser('id') userId: number) {
    return await this.leaseService.getUserLeases(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getLease(@Param('id', ParseIntPipe) id: number) {
    return await this.leaseService.getLease(id);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async store(@GetUser('id') userId: number, @Body() dto: LeaseDto) {
    return await this.leaseService.store(userId, dto);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LeaseDto,
  ) {
    return await this.leaseService.update(id, userId, dto);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.leaseService.delete(id, userId);
  }
}
