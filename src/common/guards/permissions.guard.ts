import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY, RequiredPermission } from "../decorators/require-permissions.decorator";
import { RoleCode } from "@prisma/client";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException("غير مسموح: لا توجد بيانات للمستخدم أو الدور الوظيفي");
    }

    // Super Admin has full unrestricted access
    if (user.role.code === RoleCode.SUPER_ADMIN) {
      return true;
    }

    // Check permissions array inside user.role
    const userPermissions = user.role.permissions || [];
    const modulePerm = userPermissions.find(
      (p: { module: string; actions: string[] }) => p.module === requiredPermission.module,
    );

    if (!modulePerm) {
      throw new ForbiddenException(`ليس لديك صلاحية الوصول إلى قسم (${requiredPermission.module})`);
    }

    const neededActions = requiredPermission.actions || (requiredPermission.action ? [requiredPermission.action] : []);
    const hasRequiredAction = neededActions.some((action) => modulePerm.actions.includes(action));

    if (!hasRequiredAction) {
      throw new ForbiddenException(
        `ليس لديك صلاحية (${neededActions.join(", ")}) على قسم (${requiredPermission.module})`,
      );
    }

    return true;
  }
}
