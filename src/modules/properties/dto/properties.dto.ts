import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { PropertyCategory, PropertyPurpose, PropertyStatus, FurnishingStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class PropertyImageDto {
  @ApiProperty({ example: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9" })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: "صورة الواجهة الرئيسية" })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreatePropertyDto {
  @ApiPropertyOptional({ example: "ESH-1045" })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: "فيلا مودرن فاخرة بحي النرجس" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "فيلا مودرن تشطيب فندقي مع مسبح ومصعد راكب" })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({ example: "<p>تفاصيل الفيلا بالكامل...</p>" })
  @IsString()
  @IsNotEmpty()
  fullDescription: string;

  @ApiProperty({ enum: PropertyCategory, example: PropertyCategory.RESIDENTIAL })
  @IsEnum(PropertyCategory)
  @IsNotEmpty()
  category: PropertyCategory;

  @ApiProperty({ enum: PropertyPurpose, example: PropertyPurpose.SALE })
  @IsEnum(PropertyPurpose)
  @IsNotEmpty()
  purpose: PropertyPurpose;

  @ApiPropertyOptional({ enum: PropertyStatus, default: PropertyStatus.PUBLISHED })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  // Pricing & Discounts
  @ApiProperty({ example: 3150000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ default: "ر.س" })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 3500000, description: "Original price before discount" })
  @IsNumber()
  @Min(0)
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional({ example: 10, description: "Discount percentage (e.g. 10 for 10%)" })
  @IsNumber()
  @Min(1)
  @Max(99)
  @IsOptional()
  discountPercentage?: number;

  @ApiProperty({ example: 450 })
  @IsNumber()
  @Min(1)
  area: number;

  @ApiPropertyOptional({ default: "م²" })
  @IsString()
  @IsOptional()
  areaUnit?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  maintenanceFee?: number;

  // Location
  @ApiPropertyOptional({ default: "المملكة العربية السعودية" })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: "الرياض" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: "حي النرجس" })
  @IsString()
  @IsNotEmpty()
  areaName: string;

  @ApiPropertyOptional({ example: "شارع التخصصي متفرع من طريق الملك سلمان" })
  @IsString()
  @IsOptional()
  streetAddress?: string;

  @ApiPropertyOptional({ example: 24.7136 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 46.6753 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  districtId?: string;

  // Adaptive Specs - Residential
  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  residentialBedrooms?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsNumber()
  @IsOptional()
  residentialBathrooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  residentialLivingRooms?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  residentialFloor?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  residentialTotalFloors?: number;

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsEnum(FurnishingStatus)
  @IsOptional()
  residentialFurnishing?: FurnishingStatus;

  // Adaptive Specs - Commercial
  @ApiPropertyOptional({ example: "مكتب" })
  @IsString()
  @IsOptional()
  commercialCategory?: string;

  @ApiPropertyOptional({ example: "شركات تقنية أو استشارات" })
  @IsString()
  @IsOptional()
  commercialSuitableActivity?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @IsOptional()
  commercialRoomsCount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  commercialFloor?: number;

  // Adaptive Specs - Agricultural
  @ApiPropertyOptional({ example: "زراعية مروية" })
  @IsString()
  @IsOptional()
  landClassification?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  waterAvailability?: boolean;

  @ApiPropertyOptional({ example: "بئر ارتوازي متدفق" })
  @IsString()
  @IsOptional()
  waterSource?: string;

  // Amenities
  @ApiPropertyOptional({ example: ["مسبح خاص", "مصعد", "غرفة سائق", "حديقة"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  // SEO
  @ApiPropertyOptional({ example: "فيلا مودرن فاخرة للبيع في حي النرجس الرياض" })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ example: "فيلا مودرن استثنائية للبيع بحي النرجس شمال الرياض..." })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ example: "luxury-modern-villa-narjis-riyadh" })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  // Media
  @ApiPropertyOptional({ type: [PropertyImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyImageDto)
  @IsOptional()
  images?: PropertyImageDto[];
}

export class UpdatePropertyDto extends CreatePropertyDto {}

export class UpdatePropertyStatusDto {
  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.PUBLISHED })
  @IsEnum(PropertyStatus)
  @IsNotEmpty()
  status: PropertyStatus;
}

export class ToggleFeaturedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  featured: boolean;
}

export class QueryPropertiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PropertyCategory })
  @IsEnum(PropertyCategory)
  @IsOptional()
  category?: PropertyCategory;

  @ApiPropertyOptional({ enum: PropertyPurpose })
  @IsEnum(PropertyPurpose)
  @IsOptional()
  purpose?: PropertyPurpose;

  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: "Filter properties with active discount" })
  @IsOptional()
  hasDiscount?: boolean;

  @ApiPropertyOptional({ description: "Filter featured properties" })
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  provinceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  districtId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minArea?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxArea?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bedrooms?: number;
}
