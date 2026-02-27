import { IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * DTO específico para reasignar el rol de un usuario existente.
 */
export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
