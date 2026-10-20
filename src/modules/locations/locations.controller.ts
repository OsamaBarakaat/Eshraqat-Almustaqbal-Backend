import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { LocationsService } from "./locations.service";
import {
  CreateProvinceDto,
  UpdateProvinceDto,
  CreateCityDto,
  UpdateCityDto,
  CreateDistrictDto,
  UpdateDistrictDto,
} from "./dto/locations.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Locations (Provinces, Cities, Districts)")
@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Get enabled Saudi location hierarchy for website filters and dropdowns" })
  getPublicHierarchy() {
    return this.locationsService.getHierarchy(true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "Get full location hierarchy for admin management" })
  getAllHierarchy(@Query("onlyEnabled") onlyEnabled?: boolean) {
    return this.locationsService.getHierarchy(onlyEnabled === true);
  }

  // ================= PROVINCES =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.create] })
  @Post("provinces")
  @ApiOperation({ summary: "Create a new province" })
  createProvince(@Body() dto: CreateProvinceDto) {
    return this.locationsService.createProvince(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.edit] })
  @Put("provinces/:id")
  @ApiOperation({ summary: "Update province details or toggle enabled" })
  updateProvince(@Param("id") id: string, @Body() dto: UpdateProvinceDto) {
    return this.locationsService.updateProvince(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.delete] })
  @Delete("provinces/:id")
  @ApiOperation({ summary: "Delete province (prevented if properties linked)" })
  deleteProvince(@Param("id") id: string) {
    return this.locationsService.deleteProvince(id);
  }

  // ================= CITIES =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.create] })
  @Post("cities")
  @ApiOperation({ summary: "Create a new city inside a province" })
  createCity(@Body() dto: CreateCityDto) {
    return this.locationsService.createCity(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.edit] })
  @Put("cities/:id")
  @ApiOperation({ summary: "Update city details or toggle enabled" })
  updateCity(@Param("id") id: string, @Body() dto: UpdateCityDto) {
    return this.locationsService.updateCity(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.delete] })
  @Delete("cities/:id")
  @ApiOperation({ summary: "Delete city (prevented if properties linked)" })
  deleteCity(@Param("id") id: string) {
    return this.locationsService.deleteCity(id);
  }

  // ================= DISTRICTS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.create] })
  @Post("districts")
  @ApiOperation({ summary: "Create a new district inside a city" })
  createDistrict(@Body() dto: CreateDistrictDto) {
    return this.locationsService.createDistrict(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.edit] })
  @Put("districts/:id")
  @ApiOperation({ summary: "Update district details or toggle enabled" })
  updateDistrict(@Param("id") id: string, @Body() dto: UpdateDistrictDto) {
    return this.locationsService.updateDistrict(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.locations, actions: [ActionType.delete] })
  @Delete("districts/:id")
  @ApiOperation({ summary: "Delete district (prevented if properties linked)" })
  deleteDistrict(@Param("id") id: string) {
    return this.locationsService.deleteDistrict(id);
  }
}
