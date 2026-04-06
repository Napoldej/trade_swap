import { IsString, IsIn } from 'class-validator';
import { Role } from '../../infrastructure/generated/prisma/enums';

export class ChangeRoleDto {
  @IsString()
  @IsIn(['TRADER', 'VERIFIER', 'ADMIN'])
  role: Role;
}
