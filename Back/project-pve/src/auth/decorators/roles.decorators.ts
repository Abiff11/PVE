import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
/**
 * Decorador reutilizable para anotar los roles que pueden acceder al handler.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
