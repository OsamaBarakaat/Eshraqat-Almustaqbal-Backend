# إشراقة المستقبل للعقارات | Eshraqat Al-Mustaqbal Real Estate Backend

> **نحو غدٍ مشرق** — نظام الخادم وقواعد البيانات المتكامل لإدارة المنظومة العقارية بالكامل، ومصمم لتشغيل **لوحة التحكم الإدارية (Admin Dashboard)** و **موقع العملاء العام (Public Customer Website)**.

---

## 🏗️ نظرة عامة على المعمارية (Architecture & Principles)

تم بناء النظام كمعمارية برمجية متطورة تتبع معايير **Enterprise Clean Architecture** ومبادئ **SOLID**:
- **Framework:** [NestJS](https://nestjs.com/) (Modular Architecture, Dependency Injection).
- **ORM & Data Layer:** [Prisma ORM v6](https://www.prisma.io/) مع دعم كامل لقواعد بيانات **PostgreSQL** و **Supabase**.
- **Security & RBAC:** مصادقة هجينة عبر **JWT Access/Refresh Tokens** مع مصفوفة صلاحيات دقيقة على مستوى كل قسم وكل إجراء (`ModuleType` x `ActionType`).
- **File & Media Storage:** ربط مباشر مع **Supabase Storage** لرفع صور العقارات وصور الغلاف الرئيسية، مع وجود نظام Fallback للتخزين المحلي.
- **API Documentation:** توثيق تفاعلي فوري وشامل عبر **Swagger / OpenAPI** باللغتين العربية والإنجليزية.

---

## 📦 الوحدات والخدمات المشمولة (Core Modules)

| الوحدة (Module) | المسار (Prefix) | الوصف والدور |
|---|---|---|
| **Auth** | `/api/v1/auth` | تسجيل الدخول، تجديد الجلسات (Refresh Token)، واسترجاع بيانات الملف الشخصي والصلاحيات |
| **Roles & RBAC** | `/api/v1/roles` | إدارة الأدوار الوظيفية ومصفوفة الصلاحيات المرنة (Admin / Manager / Sales Agent / Content Editor) |
| **Team & Users** | `/api/v1/users` | إدارة حسابات الموظفين، تفعيل/تعطيل الحسابات، إعادة تعيين كلمات المرور |
| **Locations** | `/api/v1/locations` | الهرم الجغرافي للمملكة (المناطق -> المدن -> الأحياء) مع عدادات العقارات |
| **Properties** | `/api/v1/properties` | إدارة الوحدات العقارية، المواصفات التكيفية (سكني، تجاري، زراعي)، **ميزة الخصومات والعروض**، ومحرك البحث العام للموقع |
| **Media** | `/api/v1/media` | رفع صورة الغلاف الرئيسية وصور متعددة للعقار إلى Supabase Storage |
| **Appointments** | `/api/v1/appointments` | حجز وإدارة مواعيد المعاينات الميدانية وإسنادها للمستشارين العقاريين |
| **Clients & CRM** | `/api/v1/clients` | إدارة مسار العملاء المحتملين (Leads) وسجل التفاعلات الزمني التفاعلي (Timeline) |
| **Inquiries** | `/api/v1/inquiries` | استقبال استفسارات الموقع العام ورسائل التواصل والرد عليها |
| **Website CMS** | `/api/v1/cms` | التحكم الكامل في الموقع العام (بانر الهيرو، الأسئلة الشائعة، الصفحات القانونية، روابط التواصل، إعدادات SEO) |
| **Dashboard** | `/api/v1/dashboard` | الإحصائيات الشاملة، مؤشرات الأداء، وتوزيع العقارات |
| **Audit Logs** | `/api/v1/audit-logs` | سجل تدقيق العمليات الإدارية الحساسة |

---

## 🏷️ ميزة الخصومات والعروض الترويجية (Discount Engine)

تأتي وحدة العقارات مزودة بمحرك خصومات ذكي يدعم:
- السعر الأصلي قبل الخصم (`originalPrice`).
- السعر الفعلي بعد الخصم (`price`).
- نسبة الخصم المئوية (`discountPercentage`).
- احتساب تلقائي ثنائي الاتجاه:
  - عند إدخال السعر الأصلي ونسبة الخصم -> يُحسب السعر المخفض تلقائياً.
  - عند إدخال السعر الأصلي والسعر المخفض -> تُحسب نسبة الخصم تلقائياً.
- تصفيات سريعة لعروض التخفيضات:
  - `GET /api/v1/properties/public/discounts` (العروض المميزة للصفحة الرئيسية).
  - فلتر `hasDiscount=true` في قائمة العقارات.

---

## 🚀 البدء والتشغيل (Getting Started)

### 1. المتطلبات الأساسية
- Node.js >= 20.x
- pnpm >= 9.x
- قاعدة بيانات PostgreSQL (سواء محلياً أو سحابياً عبر Supabase).

### 2. إعداد المتغيرات البيئية (`.env`)
قم بنسخ ملف `.env.example` إلى `.env` وتحديث بيانات الاتصال:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require"
PORT=4000
JWT_ACCESS_SECRET="eshraqat_jwt_access_secret_2026_super_secure_key"
JWT_REFRESH_SECRET="eshraqat_jwt_refresh_secret_2026_super_secure_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Supabase Storage Configuration
SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"
SUPABASE_STORAGE_BUCKET="properties"

CORS_ORIGIN="http://localhost:3000,http://localhost:3001,https://eshraqat-almustaqbal.vercel.app"
```

### 3. توليد عميل Prisma وإنشاء الجداول
```bash
# توليد Prisma Client
pnpm prisma generate

# تطبيق المخطط على قاعدة البيانات
pnpm prisma db push

# زرع البيانات الأولية (أدوار النظام، المدير العام، المناطق، العقارات، والمحتوى)
pnpm prisma:seed
```

### 4. تشغيل خادم التطوير
```bash
pnpm start:dev
```

سيصبح الخادم متاحاً عبر الرابط:
- **API Base URL:** `http://localhost:4000/api/v1`
- **Swagger Documentation:** `http://localhost:4000/api/docs`

---

## 🔐 الحساب الافتراضي للمدير العام (Super Admin)

بعد تشغيل الـ Seed، يمكنك تسجيل الدخول للوحة التحكم أو اختبار الـ API عبر:
- **البريد الإلكتروني:** `admin@eshraqat.sa`
- **كلمة المرور:** `Eshraqat@2026`

---

## 🌐 نقاط النهاية العامة للموقع الإلكتروني (Public Website API)

تم تصميم النظام ليوفر نقاط نهاية عامة لا تتطلب توكن حماية لتشغيل موقع العملاء:
- `GET /api/v1/cms/public/bootstrap`: استرجاع كافة إعدادات الموقع بطلب واحد (الهيرو، وسائل التواصل، بيانات الاتصال، الروابط، إعدادات SEO).
- `GET /api/v1/properties/public`: تصفية وبحث العقارات المعروضة.
- `GET /api/v1/properties/public/featured`: العقارات المميزة لكاروسيل الواجهة.
- `GET /api/v1/properties/public/discounts`: عروض وخصومات العقارات.
- `GET /api/v1/properties/public/:slug`: تفاصيل العقار عبر الرابط المخصص مع زيادة عداد المشاهدات.
- `POST /api/v1/appointments/book`: حجز موعد معاينة ميدانية من صفحة العقار.
- `POST /api/v1/inquiries/submit`: إرسال رسائل تواصل واستفسارات عقارية.
- `GET /api/v1/locations/public`: شجرة المناطق والمدن والأحياء لخيارات البحث.
- `GET /api/v1/cms/public/pages/:slug`: استرجاع صفحات الشروط والخصوصية ومن نحن.

---

## 🛠️ الأوامر المتاحة (Available Scripts)

```bash
# بناء المشروع والتأكد من صحة الأنواع
pnpm build

# تشغيل التدقيق البرمجي
pnpm lint

# تشغيل الاختبارات
pnpm test
```
