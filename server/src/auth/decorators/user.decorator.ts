import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type RequestUser = {
  id: string;
  email: string;
  sub: string;
  role: string;
  avatar_url?: string;
  iat: number;
  exp: number;
};

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as RequestUser;
  },
);
