import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LeaseModule } from './lease/lease.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, LeaseModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
