import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ResCookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    response.passthrough = true;
    return response;
  },
);
