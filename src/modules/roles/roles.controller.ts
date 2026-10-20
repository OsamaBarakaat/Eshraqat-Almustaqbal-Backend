import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto, UpdateRolePermissionsDto } from "./dto/roles.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Roles & Permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.view] })
  @ApiOperation({ summary: "Get all roles with their permissions and user counts" })
  @ApiResponse({ status: 200, description: "List of roles" })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(":id")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.view] })
  @ApiOperation({ summary: "Get role details by ID" })
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.managePermissions] })
  @ApiOperation({ summary: "Create a custom role with permissions matrix" })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Put(":id")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.managePermissions] })
  @ApiOperation({ summary: "Update role metadata and permission actions" })
  update(@Param("id") id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.managePermissions] })
  @ApiOperation({ summary: "Delete role if not a system role and has no active assigned users" })
  delete(@Param("id") id: string) {
    return this.rolesService.delete(id);
  }
}
