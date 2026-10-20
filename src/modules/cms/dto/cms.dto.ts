import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsEnum, IsUrl } from "class-validator";
import { FaqCategory, SocialPlatform } from "@prisma/client";

// ================= FAQs =================
export class CreateFaqDto {
  @ApiProperty({ example: "ما هي خطوات شراء عقار عبر شركة إشراقة المستقبل؟" })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: "تبدأ الخطوات باختيار العقار المناسب، ثم حجز موعد معاينة ميداني مع مستشارنا..." })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional({ enum: FaqCategory, default: FaqCategory.GENERAL })
  @IsEnum(FaqCategory)
  @IsOptional()
  category?: FaqCategory;
}

export class UpdateFaqDto extends CreateFaqDto {}

// ================= WEBSITE PAGES =================
export class CreatePageDto {
  @ApiProperty({ example: "privacy-policy" })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: "سياسة الخصوصية وسرية المعلومات" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "<h2>مقدمة</h2><p>نحن في إشراقة المستقبل نلتزم بحماية خصوصيتك...</p>" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional({ example: "سياسة الخصوصية | إشراقة المستقبل" })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: "تعرف على كيفية جمع واستخدام وحماية بياناتك..." })
  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class UpdatePageDto {
  @ApiPropertyOptional({ example: "سياسة الخصوصية وسرية المعلومات" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: "<p>محتوى الصفحة المحدث...</p>" })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaDescription?: string;
}

// ================= SOCIAL LINKS =================
export class CreateSocialLinkDto {
  @ApiProperty({ enum: SocialPlatform, example: SocialPlatform.WHATSAPP })
  @IsEnum(SocialPlatform)
  @IsNotEmpty()
  platform: SocialPlatform;

  @ApiProperty({ example: "واتساب خدمة العملاء" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "https://wa.me/966500000000" })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateSocialLinkDto extends CreateSocialLinkDto {}

// ================= HOMEPAGE CONTENT =================
export class UpdateHomepageContentDto {
  @ApiProperty({ example: "نحو غدٍ مشرق.. عقارك الأفضل في انتظارك" })
  @IsString()
  @IsNotEmpty()
  heroTitle: string;

  @ApiProperty({ example: "نخبة من أرقى العقارات والفلل السكنية والتجارية في المملكة العربية السعودية" })
  @IsString()
  @IsNotEmpty()
  heroSubtitle: string;

  @ApiPropertyOptional({ default: "استكشف العقارات" })
  @IsString()
  @IsOptional()
  ctaLabel?: string;

  @ApiPropertyOptional({ default: "/properties" })
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiProperty({ example: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" })
  @IsString()
  @IsNotEmpty()
  heroBannerImage: string;

  @ApiPropertyOptional({ default: "إشراقة المستقبل نحو غدٍ مشرق" })
  @IsString()
  @IsOptional()
  badgeText?: string;
}

// ================= CONTACT SETTINGS =================
export class UpdateContactSettingsDto {
  @ApiProperty({ example: "شركة إشراقة المستقبل للعقارات" })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: "+966 11 000 0000" })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiPropertyOptional({ example: "+966 50 000 0000" })
  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @ApiProperty({ example: "info@eshraqat-future.sa" })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "طريق الملك فهد، حي الصحافة، الرياض، المملكة العربية السعودية" })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: "السبت - الخميس: 9:00 ص - 9:00 م" })
  @IsString()
  @IsNotEmpty()
  workingHours: string;

  @ApiPropertyOptional({ example: "https://maps.google.com/?q=24.7136,46.6753" })
  @IsString()
  @IsOptional()
  locationMapUrl?: string;
}

// ================= SEO DEFAULTS =================
export class UpdateSeoDefaultsDto {
  @ApiProperty({ example: "إشراقة المستقبل للعقارات | نحو غدٍ مشرق" })
  @IsString()
  @IsNotEmpty()
  websiteTitle: string;

  @ApiProperty({ example: "منصة إشراقة المستقبل الرائدة في تقديم أرقى الحلول العقارية بالمملكة العربية السعودية..." })
  @IsString()
  @IsNotEmpty()
  defaultMetaDescription: string;

  @ApiProperty({ example: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" })
  @IsString()
  @IsNotEmpty()
  socialSharingImage: string;

  @ApiProperty({ example: "عقارات الرياض, فلل للبيع, إشراقة المستقبل, شقق فاخرة, استثمار عقاري" })
  @IsString()
  @IsNotEmpty()
  defaultKeywords: string;
}
