import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector, private readonly tokenblacklistService: TokenBlacklistService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    // 1️⃣ Verificar si el token está en la blacklist
    const isBlacklisted = await this.tokenblacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token invalidado');
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
