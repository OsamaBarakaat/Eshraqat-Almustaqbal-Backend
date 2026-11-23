import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { MapInteractionsService } from "./map-interactions.service";
import { CreateMapInteractionDto } from "./dto/create-map-interaction.dto";
import { QueryMapInteractionsDto } from "./dto/query-map-interactions.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ModuleType, ActionType } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@ApiTags("Map Interactions (التفاعل مع الخريطة)")
@Controller("map-interactions")
export class MapInteractionsController {
  constructor(
    private readonly mapInteractionsService: MapInteractionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ================= PUBLIC WEBSITE ENDPOINT (FOR LOGGED-IN CLIENTS) =================
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "تسجيل ضغط العميل على خريطة عقار مع مانع التكرار" })
  @ApiResponse({ status: 200, description: "تم تسجيل التفاعل بنجاح أو منعه بسبب التكرار السريع" })
  async recordInteraction(@Body() dto: CreateMapInteractionDto, @Req() req: any) {
    let resolvedClientId = dto.clientId;

    // محاولة استخراج هوية العميل من Bearer Token إذا وجد
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const secret =
          this.configService.get<string>("JWT_SECRET") ||
          "eshraqat-almustaqbal-ultra-secure-jwt-secret-key-2026";
        const decoded: any = this.jwtService.verify(token, { secret });
        if (decoded && (decoded.sub || decoded.id)) {
          resolvedClientId = decoded.sub || decoded.id;
        }
      } catch {
        // إذا فشل فك التوكن وكان dto.clientId غير متوفر
        if (!resolvedClientId) {
          throw new UnauthorizedException("جلسة الدخول غير صالحة أو منتهية، يرجى تسجيل الدخول مجدداً");
        }
      }
    }

    if (!resolvedClientId) {
      throw new UnauthorizedException("يجب تسجيل الدخول أولاً في الموقع لعرض الخريطة");
    }

    return this.mapInteractionsService.recordInteraction(resolvedClientId, dto.propertyId);
  }

  // ================= ADMIN DASHBOARD ENDPOINTS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.mapInteractions, actions: [ActionType.view] })
  @Get("admin")
  @ApiOperation({ summary: "استعراض سجل تفاعلات الخرائط للوحة التحكم مع الفلاتر والبحث" })
  findAll(@Query() query: QueryMapInteractionsDto) {
    return this.mapInteractionsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.mapInteractions, actions: [ActionType.view] })
  @Get("admin/stats")
  @ApiOperation({ summary: "إحصائيات تفاعل العملاء مع الخرائط" })
  getStats() {
    return this.mapInteractionsService.getStats();
  }
}
