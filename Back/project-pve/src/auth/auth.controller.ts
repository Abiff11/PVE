

// auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Controlador minimal para exponer el endpoint de inicio de sesion.
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/signin -> devuelve el access token JWT.
   */
  @Post('signin')
  async signin(@Body() body: { username: string; password: string }) {
    return this.authService.signin(body.username, body.password);
  }
}
