import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Req() req, @Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password, req.ip, req.headers['user-agent']);
  }

  @Post('logout')
  async logout(@Req() req, @Body() body: { refreshToken: string }) {
    const accessToken = req.headers.authorization?.split(' ')[1]; // Extraer `accessToken`
    return this.authService.logout(accessToken, body.refreshToken);
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
