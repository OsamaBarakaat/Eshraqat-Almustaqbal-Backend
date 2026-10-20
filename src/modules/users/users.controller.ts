import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto, ResetUserPasswordDto, QueryUsersDto } from "./dto/users.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ModuleType, ActionType } from "@prisma/client";
import type { User } from "@prisma/client";

@ApiTags("Team & Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.view] })
  @ApiOperation({ summary: "Get paginated list of team users" })
  @ApiResponse({ status: 200, description: "List of users" })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.view] })
  @ApiOperation({ summary: "Get user details by ID" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.create] })
  @ApiOperation({ summary: "Create a new team member" })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(":id")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.edit] })
  @ApiOperation({ summary: "Update team member profile" })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(":id/status")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.edit] })
  @ApiOperation({ summary: "Update team member account status" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }

  @Patch(":id/reset-password")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.edit] })
  @ApiOperation({ summary: "Reset team member password" })
  resetPassword(@Param("id") id: string, @Body() dto: ResetUserPasswordDto) {
    return this.usersService.resetPassword(id, dto);
  }

  @Delete(":id")
  @RequirePermissions({ module: ModuleType.team, actions: [ActionType.delete] })
  @ApiOperation({ summary: "Delete a team member" })
  delete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.usersService.delete(id, user.id);
  }
}
