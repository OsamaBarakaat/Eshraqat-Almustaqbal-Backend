import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
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

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // ================= FAQs =================
  async findAllFaqs(onlyPublished = false) {
    return this.prisma.faq.findMany({
      where: onlyPublished ? { published: true } : undefined,
      orderBy: { displayOrder: "asc" },
    });
  }

  async createFaq(dto: CreateFaqDto) {
    return this.prisma.faq.create({
      data: dto,
    });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    const existing = await this.prisma.faq.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("السؤال الشائع غير موجود");

    return this.prisma.faq.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFaq(id: string) {
    const existing = await this.prisma.faq.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("السؤال الشائع غير موجود");

    await this.prisma.faq.delete({ where: { id } });
    return { success: true, message: "تم حذف السؤال الشائع بنجاح" };
  }

  // ================= WEBSITE PAGES =================
  async findAllPages(onlyPublished = false) {
    return this.prisma.websitePage.findMany({
      where: onlyPublished ? { published: true } : undefined,
      orderBy: { updatedAt: "desc" },
    });
  }

  async findPageBySlug(slug: string, onlyPublished = false) {
    const page = await this.prisma.websitePage.findUnique({
      where: { slug },
    });

    if (!page || (onlyPublished && !page.published)) {
      throw new NotFoundException("الصفحة المطلوبة غير موجودة");
    }

    return page;
  }

  async createPage(dto: CreatePageDto) {
    const existing = await this.prisma.websitePage.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("يوجد صفحة أخرى مسجلة بنفس الرابط التعريفي (Slug)");
    }

    return this.prisma.websitePage.create({
      data: dto,
    });
  }

  async updatePage(id: string, dto: UpdatePageDto) {
    const existing = await this.prisma.websitePage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("الصفحة غير موجودة");

    return this.prisma.websitePage.update({
      where: { id },
      data: dto,
    });
  }

  async deletePage(id: string) {
    const existing = await this.prisma.websitePage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("الصفحة غير موجودة");

    await this.prisma.websitePage.delete({ where: { id } });
    return { success: true, message: "تم حذف الصفحة بنجاح" };
  }

  // ================= SOCIAL LINKS =================
  async findAllSocialLinks(onlyEnabled = false) {
    return this.prisma.socialLink.findMany({
      where: onlyEnabled ? { enabled: true } : undefined,
      orderBy: { displayOrder: "asc" },
    });
  }

  async createSocialLink(dto: CreateSocialLinkDto) {
    return this.prisma.socialLink.create({
      data: dto,
    });
  }

  async updateSocialLink(id: string, dto: UpdateSocialLinkDto) {
    const existing = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("رابط التواصل غير موجود");

    return this.prisma.socialLink.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSocialLink(id: string) {
    const existing = await this.prisma.socialLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("رابط التواصل غير موجود");

    await this.prisma.socialLink.delete({ where: { id } });
    return { success: true, message: "تم حذف رابط التواصل بنجاح" };
  }

  // ================= HOMEPAGE CONTENT =================
  async getHomepageContent() {
    let content = await this.prisma.homepageContent.findUnique({
      where: { id: "default-home" },
    });

    if (!content) {
      content = await this.prisma.homepageContent.create({
        data: {
          id: "default-home",
          heroTitle: "نحو غدٍ مشرق.. عقارك الأفضل في انتظارك",
          heroSubtitle: "نخبة من أرقى العقارات والفلل السكنية والتجارية في المملكة العربية السعودية",
          ctaLabel: "استكشف العقارات",
          ctaLink: "/properties",
          heroBannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          badgeText: "إشراقة المستقبل نحو غدٍ مشرق",
        },
      });
    }

    return content;
  }

  async updateHomepageContent(dto: UpdateHomepageContentDto) {
    return this.prisma.homepageContent.upsert({
      where: { id: "default-home" },
      create: {
        id: "default-home",
        ...dto,
      },
      update: dto,
    });
  }

  // ================= CONTACT SETTINGS =================
  async getContactSettings() {
    let contact = await this.prisma.contactSetting.findUnique({
      where: { id: "default-contact" },
    });

    if (!contact) {
      contact = await this.prisma.contactSetting.create({
        data: {
          id: "default-contact",
          companyName: "شركة إشراقة المستقبل للعقارات",
          contactPhone: "+966 11 000 0000",
          secondaryPhone: "+966 50 000 0000",
          email: "info@eshraqat-future.sa",
          address: "طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية",
          workingHours: "السبت - الخميس: 9:00 ص - 9:00 م",
          locationMapUrl: "https://maps.google.com/?q=24.7136,46.6753",
        },
      });
    }

    return contact;
  }

  async updateContactSettings(dto: UpdateContactSettingsDto) {
    return this.prisma.contactSetting.upsert({
      where: { id: "default-contact" },
      create: {
        id: "default-contact",
        ...dto,
      },
      update: dto,
    });
  }

  // ================= SEO DEFAULTS =================
  async getSeoDefaults() {
    let seo = await this.prisma.seoDefault.findUnique({
      where: { id: "default-seo" },
    });

    if (!seo) {
      seo = await this.prisma.seoDefault.create({
        data: {
          id: "default-seo",
          websiteTitle: "إشراقة المستقبل للعقارات | نحو غدٍ مشرق",
          defaultMetaDescription: "منصة إشراقة المستقبل الرائدة في تقديم أرقى الحلول والفرص العقارية بالمملكة العربية السعودية.",
          socialSharingImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          defaultKeywords: "عقارات الرياض, فلل للبيع, إشراقة المستقبل, شقق تمليك, عقارات السعودية",
        },
      });
    }

    return seo;
  }

  async updateSeoDefaults(dto: UpdateSeoDefaultsDto) {
    return this.prisma.seoDefault.upsert({
      where: { id: "default-seo" },
      create: {
        id: "default-seo",
        ...dto,
      },
      update: dto,
    });
  }

  // ================= PUBLIC FULL BOOTSTRAP =================
  async getPublicBootstrap() {
    const [homepage, contact, seo, socialLinks, pages, faqs] = await Promise.all([
      this.getHomepageContent(),
      this.getContactSettings(),
      this.getSeoDefaults(),
      this.findAllSocialLinks(true),
      this.prisma.websitePage.findMany({
        where: { published: true },
        select: { id: true, slug: true, title: true, updatedAt: true },
      }),
      this.findAllFaqs(true),
    ]);

    return {
      homepage,
      contact,
      seo,
      socialLinks,
      pages,
      faqs,
    };
  }
}
