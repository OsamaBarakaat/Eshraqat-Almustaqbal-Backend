import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { Resend } from "resend";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CustomerRegisterDto,
  CustomerLoginDto,
  CustomerForgotPasswordDto,
  CustomerResetPasswordDto,
  ReviewRecoveryRequestDto,
  QueryRecoveryRequestsDto,
} from "./dto/customer-auth.dto";
import { normalizeSaudiPhone, isEmail } from "../../common/utils/phone.util";
import { LeadStatus, LeadSource, TimelineEventType, PasswordRecoveryStatus } from "@prisma/client";

@Injectable()
export class CustomerAuthService {
  private resend: Resend | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const resendKey = this.configService.get<string>("RESEND_API_KEY");
    if (resendKey) {
      this.resend = new Resend(resendKey);
    }
  }

  // ==========================================
  // CUSTOMER REGISTRATION
  // ==========================================
  async register(dto: CustomerRegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("كلمة المرور وتأكيد كلمة المرور غير متطابقتين");
    }

    const phoneResult = normalizeSaudiPhone(dto.phone);
    if (!phoneResult.isValid) {
      throw new BadRequestException(phoneResult.error);
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check email uniqueness
    const existingEmail = await this.prisma.client.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (existingEmail) {
      throw new ConflictException("البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول");
    }

    // Check phone uniqueness
    const existingPhone = await this.prisma.client.findUnique({
      where: { phone: phoneResult.normalized },
    });
    if (existingPhone) {
      throw new ConflictException("رقم الجوال مسجل مسبقاً، يرجى تسجيل الدخول");
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim();

    const client = await this.prisma.client.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        name: fullName,
        email: normalizedEmail,
        phone: phoneResult.normalized,
        region: dto.region.trim(),
        passwordHash,
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE_INQUIRY,
        notes: "تم إنشاء الحساب عبر الموقع الإلكتروني الرسمي",
        timeline: {
          create: {
            type: TimelineEventType.NOTE,
            title: "تسجيل حساب عميل جديد",
            description: `تم إنشاء حساب جديد بنجاح للعميل (${fullName}) من منطقة (${dto.region.trim()})`,
            authorName: "النظام الإلكتروني",
          },
        },
      },
    });

    const token = await this.generateCustomerToken(client);

    return {
      message: "تم إنشاء حسابك بنجاح ومرحباً بك في إشراقة المستقبل",
      user: this.sanitizeClient(client),
      token,
    };
  }

  // ==========================================
  // CUSTOMER LOGIN
  // ==========================================
  async login(dto: CustomerLoginDto) {
    const rawIdentifier = dto.identifier.trim();
    let client = null;

    if (rawIdentifier.includes("@") || isEmail(rawIdentifier)) {
      client = await this.prisma.client.findFirst({
        where: { email: { equals: rawIdentifier.toLowerCase(), mode: "insensitive" } },
      });
    } else {
      const phoneResult = normalizeSaudiPhone(rawIdentifier);
      if (!phoneResult.isValid) {
        throw new UnauthorizedException("البريد الإلكتروني/رقم الجوال أو كلمة المرور غير صحيحة");
      }
      client = await this.prisma.client.findUnique({
        where: { phone: phoneResult.normalized },
      });
    }

    if (!client || !client.passwordHash) {
      throw new UnauthorizedException("البريد الإلكتروني/رقم الجوال أو كلمة المرور غير صحيحة");
    }

    const isMatch = await bcrypt.compare(dto.password, client.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException("البريد الإلكتروني/رقم الجوال أو كلمة المرور غير صحيحة");
    }

    await this.prisma.client.update({
      where: { id: client.id },
      data: { lastActivityAt: new Date() },
    });

    const token = await this.generateCustomerToken(client);

    return {
      message: "تم تسجيل الدخول بنجاح",
      user: this.sanitizeClient(client),
      token,
    };
  }

  // ==========================================
  // FORGOT PASSWORD REQUEST
  // ==========================================
  async requestPasswordRecovery(dto: CustomerForgotPasswordDto) {
    const rawIdentifier = dto.identifier.trim();
    let client = null;

    if (rawIdentifier.includes("@") || isEmail(rawIdentifier)) {
      client = await this.prisma.client.findFirst({
        where: { email: { equals: rawIdentifier.toLowerCase(), mode: "insensitive" } },
      });
    } else {
      const phoneResult = normalizeSaudiPhone(rawIdentifier);
      if (phoneResult.isValid) {
        client = await this.prisma.client.findUnique({
          where: { phone: phoneResult.normalized },
        });
      }
    }

    if (!client) {
      // Generic success to prevent account enumeration
      return {
        success: true,
        message:
          "إذا كان الحساب مسجلاً لدينا، فقد تم إرسال طلب استعادة كلمة المرور لمراجعة الإدارة بنجاح.",
      };
    }

    // Check if there is already a PENDING request
    const existingPending = await this.prisma.passwordRecoveryRequest.findFirst({
      where: {
        clientId: client.id,
        status: PasswordRecoveryStatus.PENDING,
      },
    });

    if (existingPending) {
      return {
        success: true,
        message:
          "طلب استعادة كلمة المرور قيد المراجعة حالياً من قبل الإدارة. سيتم إرسال رابط التعيين فور اعتماده.",
        requestId: existingPending.id,
      };
    }

    const request = await this.prisma.passwordRecoveryRequest.create({
      data: {
        clientId: client.id,
        requestedEmail: client.email || rawIdentifier,
        requestedPhone: client.phone,
        status: PasswordRecoveryStatus.PENDING,
      },
    });

    // Add note to client timeline
    await this.prisma.clientTimelineEvent.create({
      data: {
        clientId: client.id,
        type: TimelineEventType.NOTE,
        title: "طلب استعادة كلمة المرور",
        description: `قام العميل بتقديم طلب استعادة كلمة المرور عبر الموقع الإلكتروني (رقم الطلب: ${request.id.slice(0, 8)})`,
        authorName: "الموقع الإلكتروني",
      },
    });

    return {
      success: true,
      message:
        "تم تسجيل طلب استعادة كلمة المرور بنجاح. سيقوم فريق الإدارة بمراجعته وإرسال رابط التعيين إلى بريدك الإلكتروني.",
      requestId: request.id,
    };
  }

  // ==========================================
  // ADMIN DASHBOARD WORKFLOW: LIST REQUESTS
  // ==========================================
  async getRecoveryRequests(query: QueryRecoveryRequestsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { requestedEmail: { contains: s, mode: "insensitive" } },
        { requestedPhone: { contains: s } },
        { client: { name: { contains: s, mode: "insensitive" } } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.passwordRecoveryRequest.count({ where }),
      this.prisma.passwordRecoveryRequest.findMany({
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
              email: true,
              phone: true,
              region: true,
              createdAt: true,
            },
          },
          reviewedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
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

  // ==========================================
  // ADMIN DASHBOARD WORKFLOW: APPROVE / REJECT
  // ==========================================
  async reviewRecoveryRequest(
    id: string,
    dto: ReviewRecoveryRequestDto,
    reviewerUser: { id: string; name: string },
  ) {
    const request = await this.prisma.passwordRecoveryRequest.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!request) {
      throw new NotFoundException("طلب استعادة كلمة المرور غير موجود");
    }

    if (request.status !== PasswordRecoveryStatus.PENDING) {
      throw new BadRequestException("لا يمكن تعديل هذا الطلب لأنه تمت معالجته مسبقاً");
    }

    const websiteBaseUrl =
      this.configService.get<string>("WEBSITE_PUBLIC_URL") ||
      "https://eshraqat-al-mustaqbal-website.vercel.app";

    if (dto.status === "APPROVED") {
      // 1. Generate or use admin-specified password
      const newPlainPassword =
        dto.newPassword && dto.newPassword.trim().length >= 6
          ? dto.newPassword.trim()
          : `Esh@${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Hash and directly set the client's new password
      const passwordHash = await bcrypt.hash(newPlainPassword, 10);
      await this.prisma.client.update({
        where: { id: request.clientId },
        data: { passwordHash },
      });

      // 3. Update the recovery request
      const updated = await this.prisma.passwordRecoveryRequest.update({
        where: { id },
        data: {
          status: PasswordRecoveryStatus.APPROVED,
          reviewedByUserId: reviewerUser.id,
          reviewedAt: new Date(),
          adminNotes: dto.adminNotes
            ? `${dto.adminNotes} (تم تعيين الرمز: ${newPlainPassword})`
            : `تم تعيين كلمة المرور الجديدة بواسطة الإدارة: ${newPlainPassword}`,
        },
        include: {
          client: true,
          reviewedByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 4. Format WhatsApp message and direct click-to-chat URL
      const rawPhone = request.client.phone || request.requestedPhone || "";
      const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
      const whatsappText = `مرحباً أستاذ ${request.client.name} 🌸\nبناءً على طلب استعادة حسابكم لدى *شركة إشراقة المستقبل العقارية*، تم تعيين كلمة المرور الجديدة لحسابكم بنجاح:\n\n🔑 *كلمة المرور الجديدة:* \`${newPlainPassword}\`\n\n🌐 *رابط الدخول للموقع:*\n${websiteBaseUrl}\n\nنتمنى لكم تجربة مميزة وممتعة! ✨`;
      const whatsappUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`
        : "";

      // 5. Add timeline event
      await this.prisma.clientTimelineEvent.create({
        data: {
          clientId: request.clientId,
          type: TimelineEventType.NOTE,
          title: "إعادة تعيين كلمة المرور بواسطة الإدارة",
          description: `قام المسؤول (${reviewerUser.name}) بتعيين كلمة مرور جديدة للعميل (${newPlainPassword}) وإرسالها عبر الواتساب.`,
          authorName: reviewerUser.name,
        },
      });

      return {
        ...updated,
        reviewedBy: updated.reviewedByUser,
        newPassword: newPlainPassword,
        clientPhone: request.client.phone,
        clientName: request.client.name,
        whatsappText,
        whatsappUrl,
        message: "تم تعيين كلمة المرور الجديدة للعميل بنجاح وجاهزة للإرسال عبر واتساب",
      };
    } else {
      const updated = await this.prisma.passwordRecoveryRequest.update({
        where: { id },
        data: {
          status: PasswordRecoveryStatus.REJECTED,
          reviewedByUserId: reviewerUser.id,
          reviewedAt: new Date(),
          adminNotes: dto.adminNotes || "تم رفض الطلب من قبل الإدارة",
        },
      });

      await this.prisma.clientTimelineEvent.create({
        data: {
          clientId: request.clientId,
          type: TimelineEventType.NOTE,
          title: "رفض استعادة كلمة المرور",
          description: `تم رفض طلب استعادة كلمة المرور بواسطة المسؤول (${reviewerUser.name}). السبب: ${dto.adminNotes || "بدون ملاحظات"}`,
          authorName: reviewerUser.name,
        },
      });

      return {
        success: true,
        message: "تم رفض طلب استعادة كلمة المرور",
        request: updated,
      };
    }
  }

  // ==========================================
  // VERIFY RESET TOKEN
  // ==========================================
  async verifyResetToken(token: string) {
    if (!token || typeof token !== "string") {
      throw new BadRequestException("رمز التحقق غير صالح");
    }

    const request = await this.prisma.passwordRecoveryRequest.findUnique({
      where: { resetToken: token },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!request || request.status !== PasswordRecoveryStatus.APPROVED) {
      throw new BadRequestException("رابط استعادة كلمة المرور غير صالح أو تم استخدامه مسبقاً");
    }

    if (request.resetTokenExpiresAt && new Date() > request.resetTokenExpiresAt) {
      throw new BadRequestException("انتهت صلاحية رابط استعادة كلمة المرور (أكثر من 24 ساعة). يرجى تقديم طلب جديد.");
    }

    return {
      valid: true,
      clientName: request.client.name,
      clientEmail: request.client.email,
    };
  }

  // ==========================================
  // RESET PASSWORD EXECUTION
  // ==========================================
  async resetPassword(dto: CustomerResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("كلمة المرور وتأكيد كلمة المرور غير متطابقتين");
    }

    const request = await this.prisma.passwordRecoveryRequest.findUnique({
      where: { resetToken: dto.token },
      include: { client: true },
    });

    if (!request || request.status !== PasswordRecoveryStatus.APPROVED) {
      throw new BadRequestException("رابط الاستعادة غير صالح أو تم استخدامه مسبقاً");
    }

    if (request.resetTokenExpiresAt && new Date() > request.resetTokenExpiresAt) {
      throw new BadRequestException("انتهت صلاحية الرابط، يرجى تقديم طلب جديد");
    }

    const newPasswordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction(async (tx) => {
      // 1. Update client password
      await tx.client.update({
        where: { id: request.clientId },
        data: {
          passwordHash: newPasswordHash,
          lastActivityAt: new Date(),
        },
      });

      // 2. Mark request as COMPLETED and invalidate token
      await tx.passwordRecoveryRequest.update({
        where: { id: request.id },
        data: {
          status: PasswordRecoveryStatus.COMPLETED,
          resetToken: null,
          usedAt: new Date(),
        },
      });

      // 3. Log timeline event
      await tx.clientTimelineEvent.create({
        data: {
          clientId: request.clientId,
          type: TimelineEventType.NOTE,
          title: "تم تغيير كلمة المرور بنجاح",
          description: "تم تعيين كلمة مرور جديدة واستخدام الرابط المعتمد بنجاح",
          authorName: "الموقع الإلكتروني",
        },
      });
    });

    return {
      success: true,
      message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
    };
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private async generateCustomerToken(client: any) {
    const payload = {
      sub: client.id,
      email: client.email,
      phone: client.phone,
      name: client.name,
      type: "CUSTOMER",
    };

    return this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>("JWT_SECRET") ||
        "eshraqat-almustaqbal-ultra-secure-jwt-secret-key-2026",
      expiresIn: "30d" as any,
    });
  }

  private sanitizeClient(client: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...clean } = client;
    return clean;
  }
}
