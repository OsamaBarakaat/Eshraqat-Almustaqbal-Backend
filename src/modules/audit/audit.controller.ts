import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @RequirePermissions({ module: ModuleType.reports, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "Get administrative audit trail logs" })
  @ApiQuery({ name: "targetType", required: false, example: "property" })
  @ApiQuery({ name: "actorId", required: false })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query("targetType") targetType?: string,
    @Query("actorId") actorId?: string,
  ) {
    return this.auditService.findAll({ ...query, targetType, actorId });
  }
}
