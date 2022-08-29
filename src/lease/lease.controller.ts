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
  index() {
    return this.leaseService.index();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  show(@Param('id', ParseIntPipe) id: number) {
    return this.leaseService.show(id);
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
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
    @Body() dto: LeaseDto,
  ) {
    return this.leaseService.update(userId, dto);
  }

  @UseGuards(AccessJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.leaseService.delete(id);
  }
}
