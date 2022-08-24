import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PropertyModule } from './property/property.module';

@Module({
  imports: [PrismaModule, PropertyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
