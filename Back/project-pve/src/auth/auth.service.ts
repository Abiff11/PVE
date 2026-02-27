// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { BitacoraService } from '../bitacora/bitacora.service';

/**
 * Servicio de autenticacion. Valida credenciales y firma tokens JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly bitacoraService: BitacoraService,
  ) {}

  /**
   * Recibe user/pass, valida contra la base y regresa el access token.
   */
  async signin(username: string, password: string, ip?: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    await this.bitacoraService.log('USER_LOGIN', {
      description: 'Inicio de sesión exitoso',
      userId: user.id,
      username: user.username,
      metadata: { ip },
    });

    return {
      access_token: token,
    };
  }

  async logout(
    actor: { id?: number; username?: string } | undefined,
    ip?: string,
  ) {
    if (actor?.id) {
      await this.bitacoraService.log('USER_LOGOUT', {
        description: 'Cierre de sesión',
        userId: actor.id,
        username: actor.username,
        metadata: { ip },
      });
    }

    return { message: 'Logout registrado' };
  }
}
