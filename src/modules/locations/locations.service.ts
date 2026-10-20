import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateProvinceDto,
  UpdateProvinceDto,
  CreateCityDto,
  UpdateCityDto,
  CreateDistrictDto,
  UpdateDistrictDto,
} from "./dto/locations.dto";

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async getHierarchy(onlyEnabled = false) {
    return this.prisma.province.findMany({
      where: onlyEnabled ? { enabled: true } : undefined,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { cities: true, properties: true },
        },
        cities: {
          where: onlyEnabled ? { enabled: true } : undefined,
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: { districts: true, properties: true },
            },
            districts: {
              where: onlyEnabled ? { enabled: true } : undefined,
              orderBy: { sortOrder: "asc" },
              include: {
                _count: {
                  select: { properties: true },
                },
              },
            },
          },
        },
      },
    });
  }

  // ================= PROVINCES =================
  async createProvince(dto: CreateProvinceDto) {
    const existing = await this.prisma.province.findUnique({
      where: { nameArabic: dto.nameArabic },
    });
    if (existing) {
      throw new ConflictException("المنطقة مضافة مسبقاً بنفس الاسم العربي");
    }

    return this.prisma.province.create({
      data: dto,
    });
  }

  async updateProvince(id: string, dto: UpdateProvinceDto) {
    const prov = await this.prisma.province.findUnique({ where: { id } });
    if (!prov) throw new NotFoundException("المنطقة غير موجودة");

    if (dto.nameArabic && dto.nameArabic !== prov.nameArabic) {
      const existing = await this.prisma.province.findUnique({
        where: { nameArabic: dto.nameArabic },
      });
      if (existing) throw new ConflictException("الاسم العربي مستخدم في منطقة أخرى");
    }

    return this.prisma.province.update({
      where: { id },
      data: dto,
    });
  }

  async deleteProvince(id: string) {
    const prov = await this.prisma.province.findUnique({
      where: { id },
      include: {
        _count: { select: { cities: true, properties: true } },
      },
    });

    if (!prov) throw new NotFoundException("المنطقة غير موجودة");

    if (prov._count.properties > 0) {
      throw new BadRequestException("لا يمكن حذف المنطقة لوجود عقارات مسجلة بها حالياً");
    }

    await this.prisma.province.delete({ where: { id } });
    return { success: true, message: `تم حذف المنطقة (${prov.nameArabic}) بنجاح` };
  }

  // ================= CITIES =================
  async createCity(dto: CreateCityDto) {
    const province = await this.prisma.province.findUnique({
      where: { id: dto.provinceId },
    });
    if (!province) throw new BadRequestException("المنطقة المختارة غير موجودة");

    const existing = await this.prisma.city.findFirst({
      where: { provinceId: dto.provinceId, nameArabic: dto.nameArabic },
    });
    if (existing) {
      throw new ConflictException("المدينة مسجلة مسبقاً داخل هذه المنطقة");
    }

    return this.prisma.city.create({
      data: dto,
    });
  }

  async updateCity(id: string, dto: UpdateCityDto) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException("المدينة غير موجودة");

    if (dto.nameArabic && dto.nameArabic !== city.nameArabic) {
      const existing = await this.prisma.city.findFirst({
        where: { provinceId: city.provinceId, nameArabic: dto.nameArabic },
      });
      if (existing) throw new ConflictException("اسم المدينة مستخدم مسبقاً في نفس المنطقة");
    }

    return this.prisma.city.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCity(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        _count: { select: { districts: true, properties: true } },
      },
    });

    if (!city) throw new NotFoundException("المدينة غير موجودة");

    if (city._count.properties > 0) {
      throw new BadRequestException("لا يمكن حذف المدينة لوجود عقارات مسجلة بها حالياً");
    }

    await this.prisma.city.delete({ where: { id } });
    return { success: true, message: `تم حذف المدينة (${city.nameArabic}) بنجاح` };
  }

  // ================= DISTRICTS =================
  async createDistrict(dto: CreateDistrictDto) {
    const city = await this.prisma.city.findUnique({
      where: { id: dto.cityId },
    });
    if (!city) throw new BadRequestException("المدينة المختارة غير موجودة");

    const existing = await this.prisma.district.findFirst({
      where: { cityId: dto.cityId, nameArabic: dto.nameArabic },
    });
    if (existing) {
      throw new ConflictException("الحي مسجل مسبقاً داخل هذه المدينة");
    }

    return this.prisma.district.create({
      data: dto,
    });
  }

  async updateDistrict(id: string, dto: UpdateDistrictDto) {
    const dist = await this.prisma.district.findUnique({ where: { id } });
    if (!dist) throw new NotFoundException("الحي غير موجود");

    if (dto.nameArabic && dto.nameArabic !== dist.nameArabic) {
      const existing = await this.prisma.district.findFirst({
        where: { cityId: dist.cityId, nameArabic: dto.nameArabic },
      });
      if (existing) throw new ConflictException("اسم الحي مستخدم مسبقاً في نفس المدينة");
    }

    return this.prisma.district.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDistrict(id: string) {
    const dist = await this.prisma.district.findUnique({
      where: { id },
      include: {
        _count: { select: { properties: true } },
      },
    });

    if (!dist) throw new NotFoundException("الحي غير موجود");

    if (dist._count.properties > 0) {
      throw new BadRequestException("لا يمكن حذف الحي لوجود عقارات مسجلة به حالياً");
    }

    await this.prisma.district.delete({ where: { id } });
    return { success: true, message: `تم حذف الحي (${dist.nameArabic}) بنجاح` };
  }
}
