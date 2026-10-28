import { Controller, Get, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { CustomerAuthService } from "./customer-auth.service";
import { ReviewRecoveryRequestDto, QueryRecoveryRequestsDto } from "./dto/customer-auth.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ModuleType, ActionType } from "@prisma/client";
import type { User } from "@prisma/client";

@ApiTags("Password Recovery Management (طلبات استعادة كلمة المرور للمشرفين)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("password-recovery")
export class PasswordRecoveryController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "عرض قائمة طلبات استعادة كلمة المرور مع فلتر الحالة والبحث" })
  @ApiResponse({ status: 200, description: "قائمة الطلبات وبيانات العملاء المرتبطة" })
  findAll(@Query() query: QueryRecoveryRequestsDto) {
    return this.customerAuthService.getRecoveryRequests(query);
  }

  @RequirePermissions({ module: ModuleType.clients, actions: [ActionType.edit] })
  @Patch(":id/review")
  @ApiOperation({ summary: "مراجعة واعتماد أو رفض طلب استعادة كلمة المرور" })
  @ApiResponse({ status: 200, description: "تم تحديث حالة الطلب بنجاح وتوليد الرابط الآمن عند الموافقة" })
  review(
    @Param("id") id: string,
    @Body() dto: ReviewRecoveryRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.customerAuthService.reviewRecoveryRequest(id, dto, {
      id: user.id,
      name: user.name,
    });
  }
}
