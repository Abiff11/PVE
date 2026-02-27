

// auth/auth.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/**
 * Controlador para exponer los endpoints de autenticación.
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/signin -> devuelve el access token JWT.
   */
  @Post('signin')
  async signin(
    @Body() body: { username: string; password: string },
    @Req() req: Request,
  ) {
    const ip = this.getClientIp(req);
    return this.authService.signin(body.username, body.password, ip);
  }

  /**
   * POST /auth/logout -> registra la salida del usuario autenticado.
   */
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request) {
    const user = req.user as { id?: number; username?: string };
    const ip = this.getClientIp(req);
    return this.authService.logout(
      { id: user?.id, username: user?.username },
      ip,
    );
  }

  private getClientIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip;
  }
}
