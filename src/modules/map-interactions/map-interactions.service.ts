import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { QueryMapInteractionsDto } from "./dto/query-map-interactions.dto";

@Injectable()
export class MapInteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * تسجيل تفاعل عميل مع خريطة عقار مع تطبيق حماية التكرار والسبام (Throttling / Debounce)
   */
  async recordInteraction(clientId: string, propertyId: string) {
    if (!clientId || !propertyId) {
      throw new BadRequestException("معرف العميل ومعرف العقار مطلوبان لتسجيل التفاعل");
    }

    // التحقق من وجود العميل
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, phone: true, email: true },
    });
    if (!client) {
      throw new NotFoundException("حساب العميل غير موجود أو تم حذفه");
    }

    // التحقق من وجود العقار
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true, code: true },
    });
    if (!property) {
      throw new NotFoundException("العقار غير موجود أو غير متاح");
    }

    // مهلة منع التكرار والضغط العشوائي (15 ثانية بين كل ضغطة لنفس العميل ونفس العقار)
    const throttleWindow = new Date(Date.now() - 15 * 1000);
    const recentInteraction = await this.prisma.propertyMapInteraction.findFirst({
      where: {
        clientId,
        propertyId,
        createdAt: { gte: throttleWindow },
      },
    });

    if (recentInteraction) {
      // إرجاع نجاح صامت دون إضافة سجل مكرر في قاعدة البيانات
      return {
        success: true,
        throttled: true,
        message: "تم تسجيل التفاعل مسبقاً خلال الثواني القليلة الماضية",
        data: recentInteraction,
      };
    }

    // إنشاء سجل التفاعل الجديد
    const interaction = await this.prisma.propertyMapInteraction.create({
      data: {
        clientId,
        propertyId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            region: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            code: true,
            category: true,
            purpose: true,
            city: true,
            areaName: true,
            googleMapsUrl: true,
          },
        },
      },
    });

    // تحديث آخر نشاط للعميل
    await this.prisma.client.update({
      where: { id: clientId },
      data: { lastActivityAt: new Date() },
    });

    return {
      success: true,
      throttled: false,
      message: "تم تسجيل التفاعل مع الخريطة بنجاح",
      data: interaction,
    };
  }

  /**
   * استرجاع جميع تفاعلات الخريطة للوحة التحكم مع الفلترة والبحث
   */
  async findAll(query: QueryMapInteractionsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { client: { name: { contains: searchTerm, mode: "insensitive" } } },
        { client: { phone: { contains: searchTerm } } },
        { client: { email: { contains: searchTerm, mode: "insensitive" } } },
        { property: { title: { contains: searchTerm, mode: "insensitive" } } },
        { property: { code: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.propertyMapInteraction.count({ where }),
      this.prisma.propertyMapInteraction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              region: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              code: true,
              category: true,
              purpose: true,
              city: true,
              areaName: true,
              streetAddress: true,
              googleMapsUrl: true,
              price: true,
              currency: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * إحصائيات التفاعل مع الخرائط
   */
  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalInteractions, todayInteractions, uniqueClientsCount] = await Promise.all([
      this.prisma.propertyMapInteraction.count(),
      this.prisma.propertyMapInteraction.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.propertyMapInteraction.groupBy({
        by: ["clientId"],
      }),
    ]);

    return {
      totalInteractions,
      todayInteractions,
      uniqueClients: uniqueClientsCount.length,
    };
  }
}
