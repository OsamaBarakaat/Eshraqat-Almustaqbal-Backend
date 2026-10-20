import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as path from "path";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  );

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://eshraqat-almustaqbal.vercel.app",
        "https://eshraqat-al-mustaqbal-dashboard.vercel.app",
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Swagger)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === "*") return true;
        if (allowed.includes("*")) {
          const regex = new RegExp(`^${allowed.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`);
          return regex.test(origin);
        }
        return allowed === origin;
      });

      if (isAllowed || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: Origin not allowed"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  });

  // Global API Prefix
  app.setGlobalPrefix("api/v1");

  // Static files for local uploads fallback
  app.useStaticAssets(path.join(process.cwd(), "public"), {
    prefix: "/",
  });

  // Global pipes, interceptors, and filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle("إشراقة المستقبل للعقارات | Real Estate Backend API")
    .setDescription(
      "RESTful API documentation powering the Admin Dashboard and Public Customer Website of Eshraqat Al-Mustaqbal Real Estate.",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your Bearer Token to authorize administrative endpoints",
      },
      "BearerAuth",
    )
    .addTag("Authentication", "Authentication, Login, Refresh Token, Profile")
    .addTag("Roles & Permissions", "RBAC roles and fine-grained module action matrix")
    .addTag("Team & Users", "Staff management, role assignments, account statuses")
    .addTag("Properties (Real Estate Units)", "Property inventory, adaptive specs, discounts, and public search")
    .addTag("Locations (Provinces, Cities, Districts)", "Saudi geographic hierarchy and property counters")
    .addTag("Appointments (Property Viewings)", "Viewing requests, status confirmations, and agent assignments")
    .addTag("Clients & CRM Leads", "CRM lead pipeline, conversion stages, and activity timeline")
    .addTag("Inquiries (Contact & Property Leads)", "Customer inquiries, price requests, and reply records")
    .addTag("Website Content CMS", "Homepage banner, FAQs, legal pages, social links, contact settings, SEO")
    .addTag("Media & File Upload", "Supabase storage and file upload endpoints")
    .addTag("Dashboard Metrics & Analytics", "KPI counters, property distributions, and real-time activity")
    .addTag("Audit Logs", "Administrative actions audit trail")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    customSiteTitle: "إشراقة المستقبل للعقارات | API Docs",
    customCss: `
      .topbar { background-color: #032e2b !important; }
      .swagger-ui .topbar .download-url-wrapper { display: none !important; }
    `,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Eshraqat Al-Mustaqbal Backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger API Documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
