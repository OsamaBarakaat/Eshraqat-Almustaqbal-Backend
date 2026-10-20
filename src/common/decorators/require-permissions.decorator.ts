import { SetMetadata } from "@nestjs/common";
import { ModuleType, ActionType } from "@prisma/client";

export interface RequiredPermission {
  module: ModuleType;
  action?: ActionType;
  actions?: ActionType[];
}

export const PERMISSIONS_KEY = "permissions";

export const RequirePermission = (module: ModuleType, action: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, { module, action });

export const RequirePermissions = (permission: RequiredPermission) =>
  SetMetadata(PERMISSIONS_KEY, permission);
