import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  QueryPropertiesDto,
  UpdatePropertyStatusDto,
} from "./dto/properties.dto";
import { Prisma, PropertyStatus } from "@prisma/client";

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  private defaultIncludes = {
    images: {
      orderBy: { displayOrder: "asc" as const },
    },
    province: {
      select: { id: true, nameArabic: true, nameEnglish: true },
    },
    cityRel: {
      select: { id: true, nameArabic: true, nameEnglish: true },
    },
    districtRel: {
      select: { id: true, nameArabic: true, nameEnglish: true },
    },
    _count: {
      select: {
        appointments: true,
        inquiries: true,
      },
    },
  };

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0621-\u064A\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  private async generateUniqueCode(): Promise<string> {
    const lastProperty = await this.prisma.property.findFirst({
      orderBy: { createdAt: "desc" },
      select: { code: true },
    });

    if (!lastProperty || !lastProperty.code.startsWith("ESH-")) {
      return "ESH-1001";
    }

    const numericPart = parseInt(lastProperty.code.replace("ESH-", ""), 10);
    if (isNaN(numericPart)) {
      return `ESH-${Date.now().toString().slice(-4)}`;
    }

    return `ESH-${numericPart + 1}`;
  }

  private async generateUniqueSlug(baseText: string, currentId?: string): Promise<string> {
    let slug = this.slugify(baseText);
    if (!slug) {
      slug = `property-${Date.now()}`;
    }

    let existing = await this.prisma.property.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (currentId && existing.id === currentId)) {
      return slug;
    }

    let counter = 1;
    let candidate = `${slug}-${counter}`;
    while (true) {
      existing = await this.prisma.property.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing || (currentId && existing.id === currentId)) {
        return candidate;
      }
      counter++;
      candidate = `${slug}-${counter}`;
    }
  }

  // ================= ADMIN LIST =================
  async findAll(query: QueryPropertiesDto) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      purpose,
      status,
      hasDiscount,
      featured,
      provinceId,
      cityId,
      districtId,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.PropertyWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { areaName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (purpose) where.purpose = purpose;
    if (status) where.status = status;
    if (featured !== undefined) where.featured = String(featured) === "true";
    if (provinceId) where.provinceId = provinceId;
    if (cityId) where.cityId = cityId;
    if (districtId) where.districtId = districtId;

    if (String(hasDiscount) === "true") {
      where.originalPrice = { not: null };
      where.discountPercentage = { gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {};
      if (minArea !== undefined) where.area.gte = minArea;
      if (maxArea !== undefined) where.area.lte = maxArea;
    }

    if (bedrooms !== undefined) {
      where.residentialBedrooms = bedrooms;
    }

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: this.defaultIncludes,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ================= ADMIN GET ONE =================
  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: this.defaultIncludes,
    });

    if (!property) {
      throw new NotFoundException("العقار غير موجود");
    }

    return property;
  }

  // ================= CREATE PROPERTY =================
  async create(dto: CreatePropertyDto) {
    const code = dto.code || (await this.generateUniqueCode());
    const slug = dto.slug
      ? await this.generateUniqueSlug(dto.slug)
      : await this.generateUniqueSlug(dto.title);

    // Discount calculations
    let calculatedPrice = dto.price;
    let originalPrice = dto.originalPrice;
    let discountPercentage = dto.discountPercentage;

    if (originalPrice && discountPercentage && discountPercentage > 0) {
      calculatedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
    } else if (originalPrice && calculatedPrice && originalPrice > calculatedPrice) {
      discountPercentage = Math.round(((originalPrice - calculatedPrice) / originalPrice) * 100);
    } else {
      originalPrice = undefined;
      discountPercentage = undefined;
    }

    // Process images
    const imagesData = (dto.images || []).map((img, idx) => ({
      url: img.url,
      caption: img.caption,
      isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
      displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
    }));

    // Ensure at least one is primary if images exist
    if (imagesData.length > 0 && !imagesData.some((i) => i.isPrimary)) {
      imagesData[0].isPrimary = true;
    }

    return this.prisma.property.create({
      data: {
        code,
        title: dto.title,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
        category: dto.category,
        purpose: dto.purpose,
        status: dto.status || PropertyStatus.PUBLISHED,
        price: calculatedPrice,
        currency: dto.currency || "ر.س",
        originalPrice,
        discountPercentage,
        area: dto.area,
        areaUnit: dto.areaUnit || "م²",
        maintenanceFee: dto.maintenanceFee,

        country: dto.country || "المملكة العربية السعودية",
        city: dto.city,
        areaName: dto.areaName,
        streetAddress: dto.streetAddress,
        latitude: dto.latitude,
        longitude: dto.longitude,

        provinceId: dto.provinceId,
        cityId: dto.cityId,
        districtId: dto.districtId,

        // Specs
        residentialBedrooms: dto.residentialBedrooms,
        residentialBathrooms: dto.residentialBathrooms,
        residentialLivingRooms: dto.residentialLivingRooms,
        residentialFloor: dto.residentialFloor,
        residentialTotalFloors: dto.residentialTotalFloors,
        residentialFurnishing: dto.residentialFurnishing,

        commercialCategory: dto.commercialCategory,
        commercialSuitableActivity: dto.commercialSuitableActivity,
        commercialRoomsCount: dto.commercialRoomsCount,
        commercialFloor: dto.commercialFloor,

        landClassification: dto.landClassification,
        waterAvailability: dto.waterAvailability,
        waterSource: dto.waterSource,

        amenities: dto.amenities || [],
        seoTitle: dto.seoTitle,
        metaDescription: dto.metaDescription,
        slug,
        featured: dto.featured || false,

        images: {
          create: imagesData,
        },
      },
      include: this.defaultIncludes,
    });
  }

  // ================= UPDATE PROPERTY =================
  async update(id: string, dto: UpdatePropertyDto) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("العقار غير موجود");
    }

    const slug = dto.slug && dto.slug !== existing.slug
      ? await this.generateUniqueSlug(dto.slug, id)
      : existing.slug;

    // Discount calculations
    let calculatedPrice = dto.price ?? Number(existing.price);
    let originalPrice = dto.originalPrice;
    let discountPercentage = dto.discountPercentage;

    if (originalPrice && discountPercentage && discountPercentage > 0) {
      calculatedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
    } else if (originalPrice && calculatedPrice && originalPrice > calculatedPrice) {
      discountPercentage = Math.round(((originalPrice - calculatedPrice) / originalPrice) * 100);
    } else {
      originalPrice = null as unknown as number;
      discountPercentage = null as unknown as number;
    }

    return this.prisma.$transaction(async (tx) => {
      // If images provided, update them
      if (dto.images) {
        await tx.propertyImage.deleteMany({ where: { propertyId: id } });
        const imagesData = dto.images.map((img, idx) => ({
          propertyId: id,
          url: img.url,
          caption: img.caption,
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
          displayOrder: img.displayOrder !== undefined ? img.displayOrder : idx,
        }));
        if (imagesData.length > 0 && !imagesData.some((i) => i.isPrimary)) {
          imagesData[0].isPrimary = true;
        }
        await tx.propertyImage.createMany({ data: imagesData });
      }

      return tx.property.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.shortDescription && { shortDescription: dto.shortDescription }),
          ...(dto.fullDescription && { fullDescription: dto.fullDescription }),
          ...(dto.category && { category: dto.category }),
          ...(dto.purpose && { purpose: dto.purpose }),
          ...(dto.status && { status: dto.status }),
          price: calculatedPrice,
          ...(dto.currency && { currency: dto.currency }),
          originalPrice: originalPrice === null ? null : originalPrice,
          discountPercentage: discountPercentage === null ? null : discountPercentage,
          ...(dto.area && { area: dto.area }),
          ...(dto.areaUnit && { areaUnit: dto.areaUnit }),
          ...(dto.maintenanceFee !== undefined && { maintenanceFee: dto.maintenanceFee }),

          ...(dto.city && { city: dto.city }),
          ...(dto.areaName && { areaName: dto.areaName }),
          ...(dto.streetAddress !== undefined && { streetAddress: dto.streetAddress }),
          ...(dto.latitude !== undefined && { latitude: dto.latitude }),
          ...(dto.longitude !== undefined && { longitude: dto.longitude }),

          ...(dto.provinceId !== undefined && { provinceId: dto.provinceId }),
          ...(dto.cityId !== undefined && { cityId: dto.cityId }),
          ...(dto.districtId !== undefined && { districtId: dto.districtId }),

          ...(dto.residentialBedrooms !== undefined && { residentialBedrooms: dto.residentialBedrooms }),
          ...(dto.residentialBathrooms !== undefined && { residentialBathrooms: dto.residentialBathrooms }),
          ...(dto.residentialLivingRooms !== undefined && { residentialLivingRooms: dto.residentialLivingRooms }),
          ...(dto.residentialFloor !== undefined && { residentialFloor: dto.residentialFloor }),
          ...(dto.residentialTotalFloors !== undefined && { residentialTotalFloors: dto.residentialTotalFloors }),
          ...(dto.residentialFurnishing !== undefined && { residentialFurnishing: dto.residentialFurnishing }),

          ...(dto.commercialCategory !== undefined && { commercialCategory: dto.commercialCategory }),
          ...(dto.commercialSuitableActivity !== undefined && { commercialSuitableActivity: dto.commercialSuitableActivity }),
          ...(dto.commercialRoomsCount !== undefined && { commercialRoomsCount: dto.commercialRoomsCount }),
          ...(dto.commercialFloor !== undefined && { commercialFloor: dto.commercialFloor }),

          ...(dto.landClassification !== undefined && { landClassification: dto.landClassification }),
          ...(dto.waterAvailability !== undefined && { waterAvailability: dto.waterAvailability }),
          ...(dto.waterSource !== undefined && { waterSource: dto.waterSource }),

          ...(dto.amenities && { amenities: dto.amenities }),
          ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
          ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
          slug,
          ...(dto.featured !== undefined && { featured: dto.featured }),
        },
        include: this.defaultIncludes,
      });
    });
  }

  // ================= UPDATE STATUS =================
  async updateStatus(id: string, dto: UpdatePropertyStatusDto) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العقار غير موجود");

    return this.prisma.property.update({
      where: { id },
      data: { status: dto.status },
      include: this.defaultIncludes,
    });
  }

  // ================= TOGGLE FEATURED =================
  async toggleFeatured(id: string, featured: boolean) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العقار غير موجود");

    return this.prisma.property.update({
      where: { id },
      data: { featured },
      include: this.defaultIncludes,
    });
  }

  // ================= DELETE PROPERTY =================
  async delete(id: string) {
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العقار غير موجود");

    await this.prisma.property.delete({ where: { id } });
    return { success: true, message: `تم حذف العقار (${existing.title}) بنجاح` };
  }

  // ================= PUBLIC WEBSITE METHODS =================
  async findPublicProperties(query: QueryPropertiesDto) {
    // Only published properties for public website
    const modifiedQuery = { ...query, status: PropertyStatus.PUBLISHED };
    return this.findAll(modifiedQuery);
  }

  async findBySlug(slug: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
      include: this.defaultIncludes,
    });

    if (!property || property.status !== PropertyStatus.PUBLISHED) {
      throw new NotFoundException("العقار المطلوب غير متوفر حالياً");
    }

    // Increment views count asynchronously
    await this.prisma.property.update({
      where: { id: property.id },
      data: { viewsCount: { increment: 1 } },
    });

    return property;
  }

  async getFeatured() {
    return this.prisma.property.findMany({
      where: { status: PropertyStatus.PUBLISHED, featured: true },
      include: this.defaultIncludes,
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  }

  async getDiscountOffers() {
    return this.prisma.property.findMany({
      where: {
        status: PropertyStatus.PUBLISHED,
        originalPrice: { not: null },
        discountPercentage: { gt: 0 },
      },
      include: this.defaultIncludes,
      take: 8,
      orderBy: { discountPercentage: "desc" },
    });
  }
}
