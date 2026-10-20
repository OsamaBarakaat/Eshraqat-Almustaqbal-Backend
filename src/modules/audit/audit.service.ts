import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { Prisma } from "@prisma/client";

export interface CreateAuditLogParams {
  actorId?: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetTitle: string;
  details?: string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      return await this.prisma.auditLog.create({
        data: params,
      });
    } catch {
      // Do not crash main flow if audit log insertion fails
    }
  }

  async findAll(query: PaginationQueryDto & { targetType?: string; actorId?: string }) {
    const { page = 1, limit = 20, search, targetType, actorId, sortBy = "createdAt", sortOrder = "desc" } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (search) {
      where.OR = [
        { actorName: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { targetTitle: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
      ];
    }

    if (targetType) where.targetType = targetType;
    if (actorId) where.actorId = actorId;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.auditLog.count({ where }),
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
}
