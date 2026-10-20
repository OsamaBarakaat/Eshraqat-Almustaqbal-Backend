import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import { AppModule } from "../src/app.module";
import { TransformResponseInterceptor } from "../src/common/interceptors/transform-response.interceptor";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter";

const server: Express = express();
let isInitialized = false;

async function bootstrapServer(): Promise<Express> {
  if (!isInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      }),
    );

    app.enableCors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    });

    app.setGlobalPrefix("api/v1");

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

    // Swagger OpenAPI Documentation with CDN assets for Vercel
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
      customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
      customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js",
      ],
      customCss: `
        .topbar { background-color: #032e2b !important; }
        .swagger-ui .topbar .download-url-wrapper { display: none !important; }
      `,
    });

    await app.init();
    isInitialized = true;
  }

  return server;
}

export default async function handler(req: Request, res: Response) {
  const appInstance = await bootstrapServer();
  return appInstance(req, res);
}
