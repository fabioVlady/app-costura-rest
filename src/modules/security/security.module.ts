import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../security/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    // JwtAuthGuard, RolesGuard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }, {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class SecurityModule { }
