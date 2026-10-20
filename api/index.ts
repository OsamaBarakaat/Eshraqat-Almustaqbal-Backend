import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import express, { Express } from "express";
import helmet from "helmet";
import { AppModule } from "../src/app.module";
import { TransformResponseInterceptor } from "../src/common/interceptors/transform-response.interceptor";
import { AllExceptionsFilter } from "../src/common/filters/all-exceptions.filter";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let cachedServer: Express | null = null;

const swaggerHtml = `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>إشراقة المستقبل للعقارات | API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .topbar { background-color: #032e2b !important; }
    .swagger-ui .topbar .download-url-wrapper { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/docs-json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const server: Express = express();

  // Root redirect & custom Swagger UI handler for 100% serverless reliability
  server.get(["/", "/api/docs", "/api/docs/"], (req, res, next) => {
    if (req.path === "/" || req.path === "") {
      return res.redirect("/api/docs");
    }
    if (req.path === "/api/docs" || req.path === "/api/docs/") {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(swaggerHtml);
    }
    next();
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
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

  // Swagger Documentation builder
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
  SwaggerModule.setup("api/docs", app, document);

  await app.init();
  cachedServer = server;
  return cachedServer;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrapServer();
  return server(req as any, res as any);
}
