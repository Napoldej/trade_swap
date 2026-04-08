import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token);
        (request as any).user = {
          userId: payload.sub,
          username: payload.username,
          role: payload.role,
        };
      } catch {
        // Invalid token — treat as unauthenticated
      }
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const fromCookie = (request.cookies as Record<string, string>)?.access_token;
    if (fromCookie) return fromCookie;

    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
