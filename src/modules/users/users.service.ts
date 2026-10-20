import { Injectable, BadRequestException, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto, ResetUserPasswordDto, QueryUsersDto } from "./dto/users.dto";
import * as bcrypt from "bcrypt";
import { Prisma, RoleCode } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    avatar: true,
    department: true,
    status: true,
    roleId: true,
    lastActiveAt: true,
    createdAt: true,
    updatedAt: true,
    role: {
      select: {
        id: true,
        code: true,
        titleArabic: true,
        description: true,
        permissions: {
          select: {
            module: true,
            actions: true,
          },
        },
      },
    },
  };

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 20, search, roleId, status, sortBy = "createdAt", sortOrder = "desc" } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: this.userSelect,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException("البريد الإلكتروني مسجل مسبقاً في النظام");
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new BadRequestException("الدور الوظيفي المحدد غير موجود");
    }

    const defaultPassword = dto.password || "Eshraqat@2026";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        department: dto.department,
        roleId: dto.roleId,
        passwordHash,
      },
      select: this.userSelect,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException("البريد الإلكتروني مسجل لمستخدم آخر");
      }
    }

    if (dto.roleId && dto.roleId !== user.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) {
        throw new BadRequestException("الدور الوظيفي المحدد غير موجود");
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email.toLowerCase() }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.roleId && { roleId: dto.roleId }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: this.userSelect,
    });
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: this.userSelect,
    });
  }

  async resetPassword(id: string, dto: ResetUserPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, refreshToken: null },
    });

    return { success: true, message: "تم إعادة تعيين كلمة المرور بنجاح" };
  }

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException("لا يمكنك حذف حسابك الشخصي");
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    // If Super Admin, check if there's at least another active Super Admin
    if (user.role.code === RoleCode.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: {
          role: { code: RoleCode.SUPER_ADMIN },
          status: "ACTIVE",
        },
      });

      if (superAdminCount <= 1) {
        throw new BadRequestException("لا يمكن حذف آخر مدير عام نشط في النظام");
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: `تم حذف الموظف (${user.name}) بنجاح` };
  }
}
