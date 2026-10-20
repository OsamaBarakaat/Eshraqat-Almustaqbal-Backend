import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { ModuleType, ActionType } from "@prisma/client";

export class CreateAuditLogDto {
  @ApiPropertyOptional()
  actorId?: string;

  @ApiProperty({ example: "م. أسامة" })
  actorName: string;

  @ApiProperty({ example: "SUPER_ADMIN" })
  actorRole: string;

  @ApiProperty({ example: "إضافة عقار جديد" })
  action: string;

  @ApiProperty({ example: "property" })
  targetType: string;

  @ApiPropertyOptional()
  targetId?: string;

  @ApiProperty({ example: "ESH-1004 - فيلا فاخرة" })
  targetTitle: string;

  @ApiPropertyOptional()
  details?: string;

  @ApiPropertyOptional()
  ipAddress?: string;
}

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

  @Post()
  @ApiOperation({ summary: "Create an administrative audit log entry" })
  create(@Body() dto: CreateAuditLogDto) {
    return this.auditService.log(dto);
  }
}
