import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateInquiryDto,
  ReplyInquiryDto,
  UpdateInquiryStatusDto,
  AssignInquiryEmployeeDto,
  QueryInquiriesDto,
} from "./dto/inquiries.dto";
import { Prisma, InquiryStatus, InquiryType, LeadStatus, LeadSource, TimelineEventType } from "@prisma/client";

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  private inquiryIncludes = {
    relatedProperty: {
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
  };

  private mapInquiryResponse(inq: any) {
    return {
      id: inq.id,
      senderName: inq.senderName,
      senderPhone: inq.senderPhone,
      senderEmail: inq.senderEmail,
      type: inq.type,
      relatedPropertyId: inq.relatedPropertyId,
      relatedPropertyTitle: inq.relatedProperty?.title || null,
      relatedPropertyCode: inq.relatedProperty?.code || null,
      subject: inq.subject,
      message: inq.message,
      status: inq.status,
      assignedEmployeeId: inq.assignedEmployeeId,
      assignedEmployeeName: inq.assignedEmployee?.name || null,
      replyNotes: inq.replyNotes,
      submittedAt: inq.submittedAt.toISOString(),
      repliedAt: inq.repliedAt ? inq.repliedAt.toISOString() : null,
    };
  }

  async findAll(query: QueryInquiriesDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      relatedPropertyId,
      assignedEmployeeId,
      sortBy = "submittedAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.InquiryWhereInput = {};

    if (search) {
      where.OR = [
        { senderName: { contains: search, mode: "insensitive" } },
        { senderPhone: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (relatedPropertyId) where.relatedPropertyId = relatedPropertyId;
    if (assignedEmployeeId) where.assignedEmployeeId = assignedEmployeeId;

    const actualSortBy =
      !query.sortBy || query.sortBy === "createdAt" ? "submittedAt" : query.sortBy;

    const [rawItems, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        include: this.inquiryIncludes,
        skip,
        take: limit,
        orderBy: { [actualSortBy]: sortOrder },
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      items: rawItems.map((inq) => this.mapInquiryResponse(inq)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: this.inquiryIncludes,
    });

    if (!inquiry) throw new NotFoundException("طلب الاستفسار غير موجود");
    return this.mapInquiryResponse(inquiry);
  }

  async findClientInquiries(email?: string, phone?: string) {
    if (!email && !phone) return [];

    const where: Prisma.InquiryWhereInput = {
      OR: [
        ...(email ? [{ senderEmail: { equals: email.trim().toLowerCase(), mode: "insensitive" as const } }] : []),
        ...(phone ? [{ senderPhone: { equals: phone.trim() } }] : []),
      ],
    };

    const raw = await this.prisma.inquiry.findMany({
      where,
      include: this.inquiryIncludes,
      orderBy: { submittedAt: "asc" },
    });

    return raw.map((inq) => this.mapInquiryResponse(inq));
  }

  async create(dto: CreateInquiryDto) {
    const name = (dto.senderName || dto.customerName || "زائر الموقع").trim();
    const phone = (dto.senderPhone || dto.customerPhone || "لم يحدد بعد").trim();
    const email = (dto.senderEmail || dto.customerEmail || "").trim().toLowerCase() || undefined;

    // Resolve intelligent inquiry type if not provided or left as default
    let inquiryType: InquiryType = dto.type || InquiryType.GENERAL_CONTACT;
    const sub = (dto.subject || "").toLowerCase();
    if (!dto.type || dto.type === InquiryType.GENERAL_CONTACT) {
      if (dto.relatedPropertyId || sub.includes("عقار") || sub.includes("معاينة") || sub.includes("فيلا") || sub.includes("شقة")) {
        inquiryType = InquiryType.PROPERTY_INQUIRY;
      } else if (sub.includes("استثمار") || sub.includes("شراكة") || sub.includes("تسويق") || sub.includes("بيع") || sub.includes("إدارة")) {
        inquiryType = InquiryType.PARTNERSHIP;
      } else if (sub.includes("تمويل") || sub.includes("سعر") || sub.includes("حاسبة") || sub.includes("أسعار") || sub.includes("تكلفة")) {
        inquiryType = InquiryType.PRICE_REQUEST;
      }
    }

    // If related to a property, check property exists and increment property inquiriesCount
    if (dto.relatedPropertyId) {
      const property = await this.prisma.property.findUnique({
        where: { id: dto.relatedPropertyId },
      });
      if (property) {
        await this.prisma.property.update({
          where: { id: dto.relatedPropertyId },
          data: { inquiriesCount: { increment: 1 } },
        });
      }
    }

    const created = await this.prisma.inquiry.create({
      data: {
        senderName: name,
        senderPhone: phone,
        senderEmail: email,
        type: inquiryType,
        relatedPropertyId: dto.relatedPropertyId,
        subject: dto.subject || "استفسار من الموقع",
        message: dto.message,
      },
      include: this.inquiryIncludes,
    });

    // Auto-sync or create CRM lead
    try {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          OR: [
            ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
            { phone: { equals: phone } },
          ],
        },
      });

      if (existingClient) {
        await this.prisma.client.update({
          where: { id: existingClient.id },
          data: {
            ...(dto.relatedPropertyId && { interestedPropertyId: dto.relatedPropertyId }),
            lastActivityAt: new Date(),
            timeline: {
              create: {
                type: TimelineEventType.INQUIRY,
                title: `استفسار جديد: ${dto.subject || "استفسار"}`,
                description: dto.message,
                authorName: "نظام الموقع الإلكتروني",
              },
            },
          },
        });
      } else {
        await this.prisma.client.create({
          data: {
            name,
            phone,
            email,
            status: LeadStatus.NEW,
            source: LeadSource.WEBSITE_INQUIRY,
            interestedPropertyId: dto.relatedPropertyId || undefined,
            notes: `استفسار: ${dto.subject} - ${dto.message.slice(0, 100)}`,
            timeline: {
              create: {
                type: TimelineEventType.INQUIRY,
                title: `عميل جديد عبر استفسار: ${dto.subject || "استفسار"}`,
                description: dto.message,
                authorName: "نظام الموقع الإلكتروني",
              },
            },
          },
        });
      }
    } catch (crmErr) {
      console.warn("Failed to auto-create client from inquiry:", crmErr);
    }

    return this.mapInquiryResponse(created);
  }

  async reply(id: string, dto: ReplyInquiryDto) {
    const existing = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("طلب الاستفسار غير موجود");

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: {
        replyNotes: dto.replyNotes,
        status: InquiryStatus.REPLIED,
        repliedAt: new Date(),
      },
      include: this.inquiryIncludes,
    });

    return this.mapInquiryResponse(updated);
  }

  async updateStatus(id: string, dto: UpdateInquiryStatusDto) {
    const existing = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("طلب الاستفسار غير موجود");

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: { status: dto.status },
      include: this.inquiryIncludes,
    });

    return this.mapInquiryResponse(updated);
  }

  async assignEmployee(id: string, dto: AssignInquiryEmployeeDto) {
    const [inquiry, employee] = await Promise.all([
      this.prisma.inquiry.findUnique({ where: { id } }),
      this.prisma.user.findUnique({ where: { id: dto.assignedEmployeeId } }),
    ]);

    if (!inquiry) throw new NotFoundException("طلب الاستفسار غير موجود");
    if (!employee) throw new BadRequestException("الموظف المحدد غير موجود");

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: { assignedEmployeeId: dto.assignedEmployeeId },
      include: this.inquiryIncludes,
    });

    return this.mapInquiryResponse(updated);
  }

  async delete(id: string) {
    const existing = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("طلب الاستفسار غير موجود");

    await this.prisma.inquiry.delete({ where: { id } });
    return { success: true, message: "تم حذف الاستفسار بنجاح" };
  }
}
