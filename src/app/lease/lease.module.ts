import { Module } from '@nestjs/common';
import { LeaseService } from './lease.service';
import { LeaseController } from './lease.controller';

@Module({
  providers: [LeaseService],
  controllers: [LeaseController],
})
export class LeaseModule {}
