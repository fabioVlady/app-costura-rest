import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // console.log('🚀 RolesGuard ejecutado');
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Acceso denegado.');
    // console.log('🚀 Usuario autenticado', user);
    const tieneRol = user.roles.some((rol: string) => requiredRoles.includes(rol));
    // console.log('🚀 permisos de usuario', tieneRol);
    if (!tieneRol) throw new ForbiddenException('No tienes permisos.');
    return true;
  }
}
