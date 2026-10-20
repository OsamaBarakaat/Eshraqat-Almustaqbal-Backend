import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { PropertiesService } from "./properties.service";
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  QueryPropertiesDto,
  UpdatePropertyStatusDto,
  ToggleFeaturedDto,
} from "./dto/properties.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Properties (Real Estate Units)")
@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ================= PUBLIC WEBSITE ENDPOINTS =================
  @Public()
  @Get("public")
  @ApiOperation({ summary: "Public property search and listing with discount/specs filters" })
  findPublic(@Query() query: QueryPropertiesDto) {
    return this.propertiesService.findPublicProperties(query);
  }

  @Public()
  @Get("public/featured")
  @ApiOperation({ summary: "Get featured properties for homepage showcase" })
  getFeatured() {
    return this.propertiesService.getFeatured();
  }

  @Public()
  @Get("public/discounts")
  @ApiOperation({ summary: "Get properties with active special discount offers" })
  getDiscounts() {
    return this.propertiesService.getDiscountOffers();
  }

  @Public()
  @Get("public/:slug")
  @ApiOperation({ summary: "Get single property public details by slug and track views" })
  findBySlug(@Param("slug") slug: string) {
    return this.propertiesService.findBySlug(slug);
  }

  // ================= ADMIN DASHBOARD ENDPOINTS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "Admin property listing with complete filtering and pagination" })
  findAll(@Query() query: QueryPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.view] })
  @Get(":id")
  @ApiOperation({ summary: "Get full property details for admin editing" })
  findOne(@Param("id") id: string) {
    return this.propertiesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.create] })
  @Post()
  @ApiOperation({ summary: "Create property with adaptive specs, discount, and gallery images" })
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.edit] })
  @Put(":id")
  @ApiOperation({ summary: "Update property specifications, prices, discounts, and gallery" })
  update(@Param("id") id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.publish] })
  @Patch(":id/status")
  @ApiOperation({ summary: "Update property status (PUBLISHED, DRAFT, ARCHIVED, SOLD, RENTED)" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdatePropertyStatusDto) {
    return this.propertiesService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.edit] })
  @Patch(":id/featured")
  @ApiOperation({ summary: "Toggle property featured flag for homepage carousel" })
  toggleFeatured(@Param("id") id: string, @Body() dto: ToggleFeaturedDto) {
    return this.propertiesService.toggleFeatured(id, dto.featured);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.properties, actions: [ActionType.delete] })
  @Delete(":id")
  @ApiOperation({ summary: "Delete a property and cascade its images and appointments" })
  delete(@Param("id") id: string) {
    return this.propertiesService.delete(id);
  }
}
