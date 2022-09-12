import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

// Source : https://notiz.dev/blog/send-emails-with-nestjs

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailtrap.io',
        port: 2525,
        secure: false,
        auth: {
          user: '247da8e8f58325',
          pass: 'ec9f2da88139b3',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
