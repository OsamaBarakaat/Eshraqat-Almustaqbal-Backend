import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { CmsService } from "./cms.service";
import {
  CreateFaqDto,
  UpdateFaqDto,
  CreatePageDto,
  UpdatePageDto,
  CreateSocialLinkDto,
  UpdateSocialLinkDto,
  UpdateHomepageContentDto,
  UpdateContactSettingsDto,
  UpdateSeoDefaultsDto,
} from "./dto/cms.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { ModuleType, ActionType } from "@prisma/client";

@ApiTags("Website Content CMS")
@Controller("cms")
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ================= PUBLIC WEBSITE ENDPOINTS =================
  @Public()
  @Get("public/bootstrap")
  @ApiOperation({ summary: "Get all public website configuration in one call (Hero, Contact, SEO, Social, Pages, FAQs)" })
  getPublicBootstrap() {
    return this.cmsService.getPublicBootstrap();
  }

  @Public()
  @Get("public/pages/:slug")
  @ApiOperation({ summary: "Get single published website page by slug (e.g. privacy-policy, terms-conditions, about-us)" })
  getPublicPage(@Param("slug") slug: string) {
    return this.cmsService.findPageBySlug(slug, true);
  }

  @Public()
  @Get("public/faqs")
  @ApiOperation({ summary: "Get published FAQs for website accordion" })
  getPublicFaqs() {
    return this.cmsService.findAllFaqs(true);
  }

  // ================= ADMIN HOMEPAGE CONTENT =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("homepage")
  @ApiOperation({ summary: "Get homepage hero banner and badge content" })
  getHomepageContent() {
    return this.cmsService.getHomepageContent();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.edit] })
  @Put("homepage")
  @ApiOperation({ summary: "Update homepage hero banner, texts, and CTA button" })
  updateHomepageContent(@Body() dto: UpdateHomepageContentDto) {
    return this.cmsService.updateHomepageContent(dto);
  }

  // ================= ADMIN CONTACT SETTINGS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("contact")
  @ApiOperation({ summary: "Get company contact settings, phones, and working hours" })
  getContactSettings() {
    return this.cmsService.getContactSettings();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.edit] })
  @Put("contact")
  @ApiOperation({ summary: "Update company contact info and location map URL" })
  updateContactSettings(@Body() dto: UpdateContactSettingsDto) {
    return this.cmsService.updateContactSettings(dto);
  }

  // ================= ADMIN SEO DEFAULTS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("seo")
  @ApiOperation({ summary: "Get default website SEO meta tags and social card image" })
  getSeoDefaults() {
    return this.cmsService.getSeoDefaults();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.edit] })
  @Put("seo")
  @ApiOperation({ summary: "Update default SEO title, meta description, and keywords" })
  updateSeoDefaults(@Body() dto: UpdateSeoDefaultsDto) {
    return this.cmsService.updateSeoDefaults(dto);
  }

  // ================= ADMIN FAQs =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("faqs")
  @ApiOperation({ summary: "Get all FAQs for admin management" })
  findAllFaqs() {
    return this.cmsService.findAllFaqs(false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.create] })
  @Post("faqs")
  @ApiOperation({ summary: "Create a new FAQ entry" })
  createFaq(@Body() dto: CreateFaqDto) {
    return this.cmsService.createFaq(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.edit] })
  @Put("faqs/:id")
  @ApiOperation({ summary: "Update an FAQ entry" })
  updateFaq(@Param("id") id: string, @Body() dto: UpdateFaqDto) {
    return this.cmsService.updateFaq(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.delete] })
  @Delete("faqs/:id")
  @ApiOperation({ summary: "Delete an FAQ entry" })
  deleteFaq(@Param("id") id: string) {
    return this.cmsService.deleteFaq(id);
  }

  // ================= ADMIN WEBSITE PAGES =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("pages")
  @ApiOperation({ summary: "Get all website pages" })
  findAllPages() {
    return this.cmsService.findAllPages(false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("pages/:slug")
  @ApiOperation({ summary: "Get website page by slug" })
  findPageBySlug(@Param("slug") slug: string) {
    return this.cmsService.findPageBySlug(slug, false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.create] })
  @Post("pages")
  @ApiOperation({ summary: "Create a new website page" })
  createPage(@Body() dto: CreatePageDto) {
    return this.cmsService.createPage(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.edit] })
  @Put("pages/:id")
  @ApiOperation({ summary: "Update website page title, rich HTML content, or publication status" })
  updatePage(@Param("id") id: string, @Body() dto: UpdatePageDto) {
    return this.cmsService.updatePage(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.delete] })
  @Delete("pages/:id")
  @ApiOperation({ summary: "Delete website page" })
  deletePage(@Param("id") id: string) {
    return this.cmsService.deletePage(id);
  }

  // ================= ADMIN SOCIAL LINKS =================
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.view] })
  @Get("social-links")
  @ApiOperation({ summary: "Get all social media channels" })
  findAllSocialLinks() {
    return this.cmsService.findAllSocialLinks(false);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.create] })
  @Post("social-links")
  @ApiOperation({ summary: "Add a social media channel" })
  createSocialLink(@Body() dto: CreateSocialLinkDto) {
    return this.cmsService.createSocialLink(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.edit] })
  @Put("social-links/:id")
  @ApiOperation({ summary: "Update social media link" })
  updateSocialLink(@Param("id") id: string, @Body() dto: UpdateSocialLinkDto) {
    return this.cmsService.updateSocialLink(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions({ module: ModuleType.websiteContent, actions: [ActionType.delete] })
  @Delete("social-links/:id")
  @ApiOperation({ summary: "Delete a social media channel" })
  deleteSocialLink(@Param("id") id: string) {
    return this.cmsService.deleteSocialLink(id);
  }
}
