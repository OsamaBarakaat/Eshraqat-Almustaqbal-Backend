import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

export interface UploadResult {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private supabase: SupabaseClient | null = null;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseKey = this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    this.bucket = this.configService.get<string>("SUPABASE_STORAGE_BUCKET") || "properties";

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log("Initialized Supabase Storage client for media uploads.");
    } else {
      this.logger.warn("Supabase credentials not set or placeholder detected. Falling back to local file storage in public/uploads.");
    }
  }

  async uploadFile(file: Express.Multer.File, folder = "properties"): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException("لم يتم توفير أي ملف للرفع");
    }

    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueKey = `${folder}/${timestamp}-${cleanFileName}`;

    // 1. If Supabase configured, upload to Supabase Storage
    if (this.supabase) {
      try {
        const { error } = await this.supabase.storage
          .from(this.bucket)
          .upload(uniqueKey, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          this.logger.error(`Supabase upload failed: ${error.message}`);
          throw new BadRequestException(`فشل رفع الملف إلى التخزين السحابي: ${error.message}`);
        }

        const { data: publicUrlData } = this.supabase.storage
          .from(this.bucket)
          .getPublicUrl(uniqueKey);

        return {
          url: publicUrlData.publicUrl,
          filename: uniqueKey,
          mimetype: file.mimetype,
          size: file.size,
        };
      } catch (err) {
        this.logger.error(`Error uploading to Supabase: ${err.message}`);
        throw new BadRequestException("حدث خطأ أثناء رفع الملف إلى التخزين السحابي");
      }
    }

    // 2. Fallback to local storage (e.g. during local offline dev)
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFileName = `${timestamp}-${cleanFileName}`;
    const filePath = path.join(uploadDir, localFileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${folder}/${localFileName}`,
      filename: localFileName,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder = "properties"): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("لم يتم توفير أي ملفات للرفع");
    }

    const results: UploadResult[] = [];
    for (const file of files) {
      const res = await this.uploadFile(file, folder);
      results.push(res);
    }
    return results;
  }
}
