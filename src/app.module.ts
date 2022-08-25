import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LeaseModule } from './lease/lease.module';

@Module({
  imports: [PrismaModule, LeaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
