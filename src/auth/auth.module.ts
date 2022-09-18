import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessJwtStrategy, RefreshJwtStrategy } from './strategy';

// Source : https://www.youtube.com/watch?v=GHTA143_b-s
// Source : https://www.youtube.com/watch?v=uAKzFhE3rxU

@Module({
  imports: [
    JwtModule.register({}),
    UserModule,
    EmailVerificationModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessJwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
