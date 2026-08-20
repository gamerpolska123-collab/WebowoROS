import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!token) {
      client.disconnect(true);
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, email: true, isActive: true },
      });

      if (!user || !user.isActive) {
        client.disconnect(true);
        throw new UnauthorizedException('User not found or inactive');
      }

      client.user = {
        userId: user.id,
        role: user.role,
        email: user.email,
      };

      return true;
    } catch (err: unknown) {
      client.disconnect(true);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
