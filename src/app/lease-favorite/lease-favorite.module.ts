import { Module } from '@nestjs/common';
import { LeaseFavoriteService } from './lease-favorite.service';
import { LeaseFavoriteController } from './lease-favorite.controller';

@Module({
  providers: [LeaseFavoriteService],
  controllers: [LeaseFavoriteController]
})
export class LeaseFavoriteModule {}
