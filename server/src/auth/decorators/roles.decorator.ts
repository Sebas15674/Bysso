import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; // Importar el enum Role de Prisma

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
