// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../users/entities/user.entity';

/**
 * Estrategia de Passport encargada de decodificar y validar JWT Bearer.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Pasa al request el usuario basico que vive en el token.
   */
  async validate(payload: {
    sub: number;
    username: string;
    role: UserRole;
  }) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
