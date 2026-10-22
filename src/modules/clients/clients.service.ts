import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateClientDto,
  UpdateClientDto,
  UpdateClientStatusDto,
  AddTimelineEventDto,
  AssignClientEmployeeDto,
  QueryClientsDto,
  SyncClientWebsiteDto,
} from "./dto/clients.dto";
import { Prisma, TimelineEventType, LeadStatus, LeadSource } from "@prisma/client";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  private clientIncludes = {
    interestedProperty: {
      select: {
        id: true,
        code: true,
        title: true,
      },
    },
    assignedEmployee: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    timeline: {
      orderBy: { createdAt: "desc" as const },
    },
  };

  private mapClientResponse(c: any) {
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      status: c.status,
      source: c.source,
      budgetMin: c.budgetMin ? Number(c.budgetMin) : null,
      budgetMax: c.budgetMax ? Number(c.budgetMax) : null,
      preferredCategory: c.preferredCategory,
      preferredLocation: c.preferredLocation,
      interestedPropertyId: c.interestedPropertyId,
      interestedPropertyTitle: c.interestedProperty?.title || null,
      assignedEmployeeId: c.assignedEmployeeId,
      assignedEmployeeName: c.assignedEmployee?.name || null,
      notes: c.notes,
      timeline: (c.timeline || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        description: t.description,
        timestamp: t.createdAt.toISOString(),
        authorName: t.authorName,
      })),
      lastActivityAt: c.lastActivityAt,
      createdAt: c.createdAt,
    };
  }

  async findAll(query: QueryClientsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      source,
      preferredCategory,
      assignedEmployeeId,
      sortBy = "lastActivityAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.ClientWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (source) where.source = source;
    if (preferredCategory) where.preferredCategory = preferredCategory;
    if (assignedEmployeeId) where.assignedEmployeeId = assignedEmployeeId;

    const [rawItems, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: this.clientIncludes,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      items: rawItems.map((c) => this.mapClientResponse(c)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: this.clientIncludes,
    });

    if (!client) throw new NotFoundException("العميل غير موجود");
    return this.mapClientResponse(client);
  }

  async syncFromWebsite(dto: SyncClientWebsiteDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check if client exists by email or phone
    const existing = await this.prisma.client.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedEmail, mode: "insensitive" } },
          ...(dto.phone ? [{ phone: { equals: dto.phone.trim() } }] : []),
        ],
      },
      include: this.clientIncludes,
    });

    if (existing) {
      const updated = await this.prisma.client.update({
        where: { id: existing.id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.phone && (!existing.phone || existing.phone === "لم يحدد بعد") && { phone: dto.phone }),
          ...(dto.interestedPropertyId && { interestedPropertyId: dto.interestedPropertyId }),
          lastActivityAt: new Date(),
          timeline: {
            create: {
              type: TimelineEventType.NOTE,
              title: "تسجيل دخول من الموقع",
              description: dto.notes || "قام العميل بتسجيل الدخول إلى حسابه في الموقع الإلكتروني",
              authorName: "نظام الموقع الإلكتروني",
            },
          },
        },
        include: this.clientIncludes,
      });

      return this.mapClientResponse(updated);
    }

    // Create brand new client from website authentication
    const fallbackName = dto.name?.trim() || normalizedEmail.split("@")[0];
    const fallbackPhone = dto.phone?.trim() || "لم يحدد بعد";

    const created = await this.prisma.client.create({
      data: {
        name: fallbackName,
        email: normalizedEmail,
        phone: fallbackPhone,
        status: LeadStatus.NEW,
        source: dto.source || LeadSource.WEBSITE_INQUIRY,
        interestedPropertyId: dto.interestedPropertyId || undefined,
        notes: dto.notes || "عميل مسجل عبر توثيق البريد الإلكتروني (OTP) في الموقع الرسمي",
        lastActivityAt: new Date(),
        timeline: {
          create: {
            type: TimelineEventType.STATUS_CHANGE,
            title: "تسجيل عميل جديد من الموقع",
            description: "تم توثيق الحساب وتسجيل الدخول بنجاح عبر رمز التحقق OTP",
            authorName: "نظام الموقع الإلكتروني",
          },
        },
      },
      include: this.clientIncludes,
    });

    return this.mapClientResponse(created);
  }

  async create(dto: CreateClientDto, authorName = "النظام") {
    const client = await this.prisma.client.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        status: dto.status,
        source: dto.source,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        preferredCategory: dto.preferredCategory,
        preferredLocation: dto.preferredLocation,
        interestedPropertyId: dto.interestedPropertyId,
        assignedEmployeeId: dto.assignedEmployeeId,
        notes: dto.notes,
        timeline: {
          create: {
            type: TimelineEventType.STATUS_CHANGE,
            title: "تسجيل عميل جديد",
            description: `تم إضافة العميل بواسطة ${authorName}`,
            authorName,
          },
        },
      },
      include: this.clientIncludes,
    });

    return this.mapClientResponse(client);
  }

  async update(id: string, dto: UpdateClientDto) {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العميل غير موجود");

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        status: dto.status,
        source: dto.source,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        preferredCategory: dto.preferredCategory,
        preferredLocation: dto.preferredLocation,
        interestedPropertyId: dto.interestedPropertyId,
        assignedEmployeeId: dto.assignedEmployeeId,
        notes: dto.notes,
        lastActivityAt: new Date(),
      },
      include: this.clientIncludes,
    });

    return this.mapClientResponse(updated);
  }

  async updateStatus(id: string, dto: UpdateClientStatusDto, authorName: string) {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العميل غير موجود");

    const statusMap: Record<string, string> = {
      NEW: "جديد",
      CONTACTED: "تم التواصل",
      QUALIFIED: "مؤهل",
      CONVERTED: "تم التعاقد",
      LOST: "غير مهتم",
    };

    const statusTitle = `تغيير الحالة إلى (${statusMap[dto.status] || dto.status})`;
    const statusDesc = dto.reason ? `السبب/الملاحظة: ${dto.reason}` : `تم تحديث حالة العميل إلى ${statusMap[dto.status] || dto.status}`;

    return this.prisma.$transaction(async (tx) => {
      await tx.clientTimelineEvent.create({
        data: {
          clientId: id,
          type: TimelineEventType.STATUS_CHANGE,
          title: statusTitle,
          description: statusDesc,
          authorName,
        },
      });

      const updated = await tx.client.update({
        where: { id },
        data: {
          status: dto.status,
          lastActivityAt: new Date(),
        },
        include: this.clientIncludes,
      });

      return this.mapClientResponse(updated);
    });
  }

  async addTimelineEvent(id: string, dto: AddTimelineEventDto, authorName: string) {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العميل غير موجود");

    await this.prisma.clientTimelineEvent.create({
      data: {
        clientId: id,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        authorName,
      },
    });

    await this.prisma.client.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return this.findOne(id);
  }

  async assignEmployee(id: string, dto: AssignClientEmployeeDto, authorName: string) {
    const [client, employee] = await Promise.all([
      this.prisma.client.findUnique({ where: { id } }),
      this.prisma.user.findUnique({ where: { id: dto.assignedEmployeeId } }),
    ]);

    if (!client) throw new NotFoundException("العميل غير موجود");
    if (!employee) throw new BadRequestException("الموظف المحدد غير موجود");

    return this.prisma.$transaction(async (tx) => {
      await tx.clientTimelineEvent.create({
        data: {
          clientId: id,
          type: TimelineEventType.STATUS_CHANGE,
          title: "إسناد العميل لموظف",
          description: `تم إسناد إدارة العميل إلى المستشار العقاري (${employee.name}) بواسطة ${authorName}`,
          authorName,
        },
      });

      const updated = await tx.client.update({
        where: { id },
        data: {
          assignedEmployeeId: dto.assignedEmployeeId,
          lastActivityAt: new Date(),
        },
        include: this.clientIncludes,
      });

      return this.mapClientResponse(updated);
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("العميل غير موجود");

    await this.prisma.client.delete({ where: { id } });
    return { success: true, message: `تم حذف العميل (${existing.name}) بنجاح` };
  }
}
