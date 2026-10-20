import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { ClientsService } from "./clients.service";
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateClientStatusDto,
  AddTimelineEventDto,
  AssignClientEmployeeDto,
  QueryClientsDto,
} from "./dto/clients.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ModuleType, ActionType } from "@prisma/client";
import type { User } from "@prisma/client";

@ApiTags("Clients & CRM Leads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "Get all CRM leads with stage, budget, and source filters" })
  findAll(@Query() query: QueryClientsDto) {
    return this.clientsService.findAll(query);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.view] })
  @Get(":id")
  @ApiOperation({ summary: "Get client full CRM profile with interactive timeline events" })
  findOne(@Param("id") id: string) {
    return this.clientsService.findOne(id);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.create] })
  @Post()
  @ApiOperation({ summary: "Create a new CRM client / lead" })
  create(@Body() dto: CreateClientDto, @CurrentUser() user: User) {
    return this.clientsService.create(dto, user.name);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.edit] })
  @Put(":id")
  @ApiOperation({ summary: "Update client contact information, preferences, or budget" })
  update(@Param("id") id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.edit] })
  @Patch(":id/status")
  @ApiOperation({ summary: "Move client across CRM stages (NEW -> CONTACTED -> QUALIFIED -> CONVERTED -> LOST)" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateClientStatusDto, @CurrentUser() user: User) {
    return this.clientsService.updateStatus(id, dto, user.name);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.edit] })
  @Post(":id/timeline")
  @ApiOperation({ summary: "Log call, note, or meeting event into client timeline" })
  addTimelineEvent(@Param("id") id: string, @Body() dto: AddTimelineEventDto, @CurrentUser() user: User) {
    return this.clientsService.addTimelineEvent(id, dto, user.name);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.assign] })
  @Patch(":id/assign")
  @ApiOperation({ summary: "Assign sales consultant to lead" })
  assignEmployee(@Param("id") id: string, @Body() dto: AssignClientEmployeeDto, @CurrentUser() user: User) {
    return this.clientsService.assignEmployee(id, dto, user.name);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.delete] })
  @Delete(":id")
  @ApiOperation({ summary: "Delete client" })
  delete(@Param("id") id: string) {
    return this.clientsService.delete(id);
  }
}
