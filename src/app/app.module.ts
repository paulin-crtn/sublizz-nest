import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RootModule } from './root/root.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LeaseModule } from './lease/lease.module';
import { MailModule } from './mail/mail.module';
import { LeaseReportModule } from './lease-report/lease-report.module';
import { LeaseFavoriteModule } from './lease-favorite/lease-favorite.module';
import { HelpUsModule } from './help-us/help-us.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationMessageModule } from './conversation-message/conversation-message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RootModule,
    AuthModule,
    UserModule,
    LeaseModule,
    MailModule,
    LeaseReportModule,
    LeaseFavoriteModule,
    HelpUsModule,
    ConversationModule,
    ConversationMessageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
