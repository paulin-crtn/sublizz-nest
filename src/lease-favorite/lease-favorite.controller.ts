/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../auth/guard';
import { GetUser } from '../user/decorator';
import { StoreLeaseFavoriteDto } from './dto';
import { LeaseFavoriteEntity } from './entity';
import { LeaseFavoriteService } from './lease-favorite.service';

/* -------------------------------------------------------------------------- */
/*                                 CONTROLLER                                 */
/* -------------------------------------------------------------------------- */
@ApiTags('lease-favorites')
@Controller('lease-favorites')
@UseInterceptors(ClassSerializerInterceptor)
export class LeaseFavoriteController {
  constructor(private leaseFavoriteService: LeaseFavoriteService) {}

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get()
  async index(@GetUser('id') userId: number) {
    const leaseFavorites = await this.leaseFavoriteService.index(userId);
    return leaseFavorites.map(
      (leaseFavorite) => new LeaseFavoriteEntity(leaseFavorite as unknown),
    );
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async store(
    @GetUser('id') userId: number,
    @Body() dto: StoreLeaseFavoriteDto,
  ) {
    const leaseFavorite = await this.leaseFavoriteService.store(
      userId,
      dto.leaseId,
    );
    return new LeaseFavoriteEntity(leaseFavorite as unknown);
  }

  @UseGuards(AccessJwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    await this.leaseFavoriteService.delete(id, userId);
    return { statusCode: 200, message: 'Favorite lease deleted' };
  }
}
