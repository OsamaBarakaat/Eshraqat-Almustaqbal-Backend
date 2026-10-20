import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { InquiriesService } from "./inquiries.service";
import {
  CreateInquiryDto,
  ReplyInquiryDto,
  UpdateInquiryStatusDto,
  AssignInquiryEmployeeDto,
  QueryInquiriesDto,
} from "./dto/inquiries.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Inquiries (Contact & Property Leads)")
@Controller("inquiries")
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  // ================= PUBLIC WEBSITE ENDPOINT =================
  @Public()
  @Post("submit")
  @ApiOperation({ summary: "Submit a new contact or property inquiry from the website" })
  submitFromWebsite(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  // ================= ADMIN DASHBOARD ENDPOINTS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.view] })
  @Get()
  @ApiOperation({ summary: "Get all customer inquiries with filtering by status and type" })
  findAll(@Query() query: QueryInquiriesDto) {
    return this.inquiriesService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.view] })
  @Get(":id")
  @ApiOperation({ summary: "Get single inquiry details" })
  findOne(@Param("id") id: string) {
    return this.inquiriesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.create] })
  @Post()
  @ApiOperation({ summary: "Create an inquiry manually from admin dashboard" })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.edit] })
  @Patch(":id/reply")
  @ApiOperation({ summary: "Log reply notes to inquiry and mark as replied" })
  reply(@Param("id") id: string, @Body() dto: ReplyInquiryDto) {
    return this.inquiriesService.reply(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.edit] })
  @Patch(":id/status")
  @ApiOperation({ summary: "Update inquiry status (NEW, IN_PROGRESS, REPLIED, CLOSED)" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.inquiriesService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.assign] })
  @Patch(":id/assign")
  @ApiOperation({ summary: "Assign sales agent to inquiry" })
  assignEmployee(@Param("id") id: string, @Body() dto: AssignInquiryEmployeeDto) {
    return this.inquiriesService.assignEmployee(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.inquiries, actions: [ActionType.delete] })
  @Delete(":id")
  @ApiOperation({ summary: "Delete an inquiry" })
  delete(@Param("id") id: string) {
    return this.inquiriesService.delete(id);
  }
}
