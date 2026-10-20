import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateInquiryDto,
  ReplyInquiryDto,
  UpdateInquiryStatusDto,
  AssignInquiryEmployeeDto,
  QueryInquiriesDto,
} from "./dto/inquiries.dto";
import { Prisma, InquiryStatus } from "@prisma/client";

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

  async create(dto: CreateInquiryDto) {
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
        senderName: dto.senderName,
        senderPhone: dto.senderPhone,
        senderEmail: dto.senderEmail,
        type: dto.type,
        relatedPropertyId: dto.relatedPropertyId,
        subject: dto.subject,
        message: dto.message,
      },
      include: this.inquiryIncludes,
    });

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
