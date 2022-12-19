import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

/**
 * Simple GET / endpoint
 * This is because AWS pings this route to check the status of the application.
 */
@Controller()
export class RootController {
  @HttpCode(HttpStatus.OK)
  @Get()
  async get() {
    return { status: 200, message: 'App is working' };
  }
}
