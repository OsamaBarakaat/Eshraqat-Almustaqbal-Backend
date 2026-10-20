import {
  PrismaClient,
  RoleCode,
  ModuleType,
  ActionType,
  PropertyCategory,
  PropertyPurpose,
  PropertyStatus,
  FurnishingStatus,
  AppointmentStatus,
  LeadStatus,
  LeadSource,
  InquiryStatus,
  InquiryType,
  FaqCategory,
  SocialPlatform,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding for Eshraqat Al-Mustaqbal...");

  // 1. Roles and Permissions
  console.log("Creating System Roles & Permissions Matrix...");

  const allModules: ModuleType[] = [
    "properties",
    "projects",
    "clients",
    "inquiries",
    "appointments",
    "websiteContent",
    "reports",
    "team",
    "settings",
    "locations",
  ];

  const allActions: ActionType[] = [
    "view",
    "create",
    "edit",
    "delete",
    "publish",
    "assign",
    "managePermissions",
  ];

  // Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { code: RoleCode.SUPER_ADMIN },
    update: {},
    create: {
      code: RoleCode.SUPER_ADMIN,
      titleArabic: "مدير عام النظام",
      description: "صلاحيات مطلقة لإدارة كامل وحدات النظام والمستخدمين والصلاحيات",
      isSystem: true,
      permissions: {
        create: allModules.map((module) => ({
          module,
          actions: allActions,
        })),
      },
    },
  });

  // Manager Role
  await prisma.role.upsert({
    where: { code: RoleCode.MANAGER },
    update: {},
    create: {
      code: RoleCode.MANAGER,
      titleArabic: "مدير العمليات",
      description: "إدارة العقارات والعملاء والمعاينات ومتابعة تقارير المبيعات",
      isSystem: true,
      permissions: {
        create: allModules
          .filter((m) => m !== "settings")
          .map((module) => ({
            module,
            actions: ["view", "create", "edit", "publish", "assign"] as ActionType[],
          })),
      },
    },
  });

  // Sales Agent Role
  await prisma.role.upsert({
    where: { code: RoleCode.SALES_AGENT },
    update: {},
    create: {
      code: RoleCode.SALES_AGENT,
      titleArabic: "مستشار مبيعات",
      description: "استعراض العقارات ومتابعة المعاينات والتواصل مع العملاء والرد على الاستفسارات",
      isSystem: true,
      permissions: {
        create: [
          { module: "properties", actions: ["view"] },
          { module: "appointments", actions: ["view", "create", "edit"] },
          { module: "clients", actions: ["view", "create", "edit"] },
          { module: "inquiries", actions: ["view", "edit"] },
        ],
      },
    },
  });

  // Content Editor Role
  await prisma.role.upsert({
    where: { code: RoleCode.CONTENT_EDITOR },
    update: {},
    create: {
      code: RoleCode.CONTENT_EDITOR,
      titleArabic: "محرر محتوى المنصة",
      description: "إدارة وتحديث محتوى الموقع، الشروط والأحكام، الأسئلة الشائعة، والروابط",
      isSystem: true,
      permissions: {
        create: [
          { module: "websiteContent", actions: ["view", "create", "edit", "delete", "publish"] },
          { module: "properties", actions: ["view"] },
        ],
      },
    },
  });

  // 2. Default Super Admin User
  console.log("Creating Default Super Admin User...");
  const hashedPassword = await bcrypt.hash("Eshraqat@2026", 10);

  const defaultAdmin = await prisma.user.upsert({
    where: { email: "admin@eshraqat.sa" },
    update: {
      passwordHash: hashedPassword,
      roleId: superAdminRole.id,
    },
    create: {
      email: "admin@eshraqat.sa",
      passwordHash: hashedPassword,
      name: "م. أسامة (المدير العام)",
      phone: "+966 50 123 4567",
      roleId: superAdminRole.id,
      department: "الإدارة العامة",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  });

  // 3. Saudi Geographic Hierarchy
  console.log("Seeding Saudi Provinces, Cities & Districts...");

  // Province: Riyadh
  const riyadhProv = await prisma.province.upsert({
    where: { nameArabic: "منطقة الرياض" },
    update: {},
    create: {
      nameArabic: "منطقة الرياض",
      nameEnglish: "Riyadh Province",
      country: "المملكة العربية السعودية",
      sortOrder: 1,
    },
  });

  // Riyadh City
  const riyadhCity = await prisma.city.upsert({
    where: {
      provinceId_nameArabic: {
        provinceId: riyadhProv.id,
        nameArabic: "مدينة الرياض",
      },
    },
    update: {},
    create: {
      provinceId: riyadhProv.id,
      nameArabic: "مدينة الرياض",
      nameEnglish: "Riyadh City",
      sortOrder: 1,
    },
  });

  const riyadhDistricts = [
    { ar: "حي النرجس", en: "An Narjis" },
    { ar: "حي الياسمين", en: "Al Yasmin" },
    { ar: "حي الملقا", en: "Al Malqa" },
    { ar: "حي حطين", en: "Hittin" },
    { ar: "حي العليا", en: "Al Olaya" },
  ];

  for (const dist of riyadhDistricts) {
    await prisma.district.upsert({
      where: {
        cityId_nameArabic: {
          cityId: riyadhCity.id,
          nameArabic: dist.ar,
        },
      },
      update: {},
      create: {
        cityId: riyadhCity.id,
        nameArabic: dist.ar,
        nameEnglish: dist.en,
      },
    });
  }

  // Al-Kharj City
  const kharjCity = await prisma.city.upsert({
    where: {
      provinceId_nameArabic: {
        provinceId: riyadhProv.id,
        nameArabic: "الخرج",
      },
    },
    update: {},
    create: {
      provinceId: riyadhProv.id,
      nameArabic: "الخرج",
      nameEnglish: "Al Kharj",
      sortOrder: 2,
    },
  });

  await prisma.district.upsert({
    where: {
      cityId_nameArabic: {
        cityId: kharjCity.id,
        nameArabic: "حي الروضة",
      },
    },
    update: {},
    create: {
      cityId: kharjCity.id,
      nameArabic: "حي الروضة",
      nameEnglish: "Ar Rawdah",
    },
  });

  // Province: Makkah
  const makkahProv = await prisma.province.upsert({
    where: { nameArabic: "منطقة مكة المكرمة" },
    update: {},
    create: {
      nameArabic: "منطقة مكة المكرمة",
      nameEnglish: "Makkah Province",
      country: "المملكة العربية السعودية",
      sortOrder: 2,
    },
  });

  const jeddahCity = await prisma.city.upsert({
    where: {
      provinceId_nameArabic: {
        provinceId: makkahProv.id,
        nameArabic: "مدينة جدة",
      },
    },
    update: {},
    create: {
      provinceId: makkahProv.id,
      nameArabic: "مدينة جدة",
      nameEnglish: "Jeddah City",
      sortOrder: 1,
    },
  });

  const jeddahDistricts = [
    { ar: "حي الشاطئ", en: "Al Shati" },
    { ar: "أبحر الشمالية", en: "North Obhur" },
  ];

  for (const dist of jeddahDistricts) {
    await prisma.district.upsert({
      where: {
        cityId_nameArabic: {
          cityId: jeddahCity.id,
          nameArabic: dist.ar,
        },
      },
      update: {},
      create: {
        cityId: jeddahCity.id,
        nameArabic: dist.ar,
        nameEnglish: dist.en,
      },
    });
  }

  // 4. Sample Properties with Discount and Multi-Images
  console.log("Seeding Featured Properties with Discounts...");

  const distNargis = await prisma.district.findFirst({
    where: { nameArabic: "حي النرجس" },
  });

  await prisma.property.upsert({
    where: { code: "ESH-1001" },
    update: {},
    create: {
      code: "ESH-1001",
      title: "فيلا مستقلة فاخرة بحمام سباحة خاص بحي النرجس شمال الرياض",
      shortDescription: "فيلا مستقلة راقية تشطيب ألترا مودرن مع مسبح خاص وحديقة بإطلالة مفتوحة.",
      fullDescription: "فيلا استثنائية للبيع في أرقى أحياء شمال الرياض (حي النرجس). مساحة البناء 550 م²، تتكون من 3 طوابق مع مصعد إيطالي مؤسس، 5 غرف نوم رئيسية (أجنحة ماستر)، مجلس رجال فخم، صالة طعام مستقلة، مطبخ مفتوح ومطبخ خدمات، غرفة خادمة وغرفة سائق، ومسبح مغطى بنظام تدفئة ذكي.",
      category: PropertyCategory.RESIDENTIAL,
      purpose: PropertyPurpose.SALE,
      status: PropertyStatus.PUBLISHED,
      price: 6460000,
      originalPrice: 6800000,
      discountPercentage: 5,
      currency: "ر.س",
      area: 550,
      areaUnit: "م²",
      maintenanceFee: 15000,
      country: "المملكة العربية السعودية",
      city: "مدينة الرياض",
      areaName: "حي النرجس",
      streetAddress: "شمال طريق الملك سلمان، حي النرجس، الكيلو الثاني",
      latitude: 24.8451,
      longitude: 46.6892,
      provinceId: riyadhProv.id,
      cityId: riyadhCity.id,
      districtId: distNargis?.id,
      residentialBedrooms: 5,
      residentialBathrooms: 6,
      residentialLivingRooms: 3,
      residentialFloor: 1,
      residentialTotalFloors: 3,
      residentialFurnishing: FurnishingStatus.FURNISHED,
      amenities: [
        "حمام سباحة",
        "حديقة خاصة",
        "تكييف مركزي",
        "موقف سيارات خاص",
        "أمن وحراسة 24/7",
        "غرفة خادمة",
        "كاميرات مراقبة",
        "مصعد كهربائي",
      ],
      seoTitle: "فيلا مستقلة فاخرة للبيع بحي النرجس شمال الرياض | إشراقة المستقبل",
      metaDescription: "امتلك فيلا أحلامك في حي النرجس بالرياض مع إشراقة المستقبل للعقارات.",
      slug: "luxury-villa-an-narjis-riyadh-1001",
      featured: true,
      viewsCount: 1420,
      inquiriesCount: 28,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            caption: "الواجهة الخارجية والحديقة",
            isPrimary: true,
            displayOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            caption: "صالة الاستقبال الرئيسية",
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // 5. CMS Defaults
  console.log("Seeding CMS Defaults (Homepage, FAQs, Social, Contact)...");

  await prisma.homepageContent.upsert({
    where: { id: "default-home" },
    update: {},
    create: {
      id: "default-home",
      heroTitle: "إشراقة المستقبل نحو غدٍ مشرق",
      heroSubtitle: "بوابتك العقارية الأولى في المملكة العربية السعودية لاكتشاف أرقى الفيلات، الشقق الفاخرة، والفرص الاستثمارية الكبرى.",
      ctaLabel: "استكشف أحدث العقارات",
      ctaLink: "/properties",
      heroBannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      badgeText: "وجهتك الاستثمارية الموثوقة بالمملكة",
    },
  });

  await prisma.contactSetting.upsert({
    where: { id: "default-contact" },
    update: {},
    create: {
      id: "default-contact",
      companyName: "شركة إشراقة المستقبل للعقارات",
      contactPhone: "+966 11 456 7890",
      secondaryPhone: "+966 50 123 4567",
      email: "info@eshraqat-future.sa",
      address: "طريق الملك فهد، حي الملقا، برج الملقا التجاري - الدور التاسع، الرياض",
      workingHours: "السبت - الخميس: 9:00 ص - 9:00 م | الجمعة: 4:00 م - 9:00 م",
    },
  });

  await prisma.seoDefault.upsert({
    where: { id: "default-seo" },
    update: {},
    create: {
      id: "default-seo",
      websiteTitle: "إشراقة المستقبل للعقارات | نحو غدٍ مشرق",
      defaultMetaDescription: "منصة إشراقة المستقبل العقارية الرائدة بالمملكة العربية السعودية لبيع وشراء وتأجير العقارات السكنية والتجارية والاستثمارية.",
      socialSharingImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      defaultKeywords: "عقارات الرياض, فلل للبيع, شقق للايجار, عقارات السعودية, إشراقة المستقبل, استثمار عقاري",
    },
  });

  // Website Pages
  await prisma.websitePage.upsert({
    where: { slug: "privacy-policy" },
    update: {},
    create: {
      slug: "privacy-policy",
      title: "سياسة الخصوصية وسرية المعلومات",
      content: "تولي شركة إشراقة المستقبل للعقارات أهمية بالغة لسرية وحماية بيانات عملائها الكرام...",
      published: true,
      metaTitle: "سياسة الخصوصية | إشراقة المستقبل للعقارات",
      metaDescription: "تعرف على سياسة الخصوصية وسرية المعلومات في منصة إشراقة المستقبل.",
    },
  });

  await prisma.websitePage.upsert({
    where: { slug: "terms-conditions" },
    update: {},
    create: {
      slug: "terms-conditions",
      title: "الشروط والأحكام العامة",
      content: "أهلاً بكم في منصة إشراقة المستقبل للعقارات. يخضع استخدامك للمنصة للشروط والأحكام الآتية...",
      published: true,
      metaTitle: "الشروط والأحكام | إشراقة المستقبل للعقارات",
      metaDescription: "الشروط والأحكام المنظمة للتعاملات العقارية عبر منصة إشراقة المستقبل.",
    },
  });

  // Social Links
  const socialLinks = [
    { platform: SocialPlatform.WHATSAPP, title: "واتساب المبيعات المباشر", url: "https://wa.me/966501234567" },
    { platform: SocialPlatform.INSTAGRAM, title: "حساب إنستغرام الرسمي", url: "https://instagram.com/eshraqat_future" },
    { platform: SocialPlatform.X, title: "منصة إكس (تويتر)", url: "https://x.com/eshraqat_future" },
    { platform: SocialPlatform.LINKEDIN, title: "صفحة لينكد إن", url: "https://linkedin.com/company/eshraqat-future" },
  ];

  for (const s of socialLinks) {
    await prisma.socialLink.create({
      data: s,
    });
  }

  // FAQs
  const sampleFaqs = [
    {
      question: "ما هي خطوات شراء عقار عبر منصة إشراقة المستقبل؟",
      answer: "تبدأ العملية باستعراض العقارات المتاحة، ثم حجز موعد معاينة ميداني، يليه التواصل مع مستشار المبيعات لإتمام الفحص والتفاوض وتوقيع عقد الشراء وتوثيقه رسمياً.",
      category: FaqCategory.BUYING,
      displayOrder: 1,
    },
    {
      question: "هل تقدمون خدمات المعاينة الميدانية المجانية؟",
      answer: "نعم، كافة المعاينات العقارية مجانية بالكامل ومصحوبة بمستشار عقاري معتمد لمساعدتك في اتخاذ القرار المناسب.",
      category: FaqCategory.GENERAL,
      displayOrder: 2,
    },
  ];

  for (const faq of sampleFaqs) {
    await prisma.faq.create({
      data: faq,
    });
  }

  console.log("✅ Database Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
