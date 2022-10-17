import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LeaseModule } from './lease/lease.module';
import { MailModule } from './mail/mail.module';
import { LeaseReportModule } from './lease-report/lease-report.module';
import { LeaseMessageModule } from './lease-message/lease-message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    LeaseModule,
    MailModule,
    LeaseReportModule,
    LeaseMessageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
