import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Extrae el token de `Authorization: Bearer <TOKEN>`
      ignoreExpiration: false, // ✅ No permite tokens expirados
      secretOrKey: configService.get<string>('JWT_SECRET'), // ✅ Obtiene `JWT_SECRET` de `ConfigService`
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token inválido');
    }
    return { id: payload.sub, username: payload.username, roles: payload.roles };
  }
}
