import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LeaseModule } from './lease/lease.module';
import { MailModule } from './mail/mail.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    LeaseModule,
    MailModule,
    EmailVerificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
