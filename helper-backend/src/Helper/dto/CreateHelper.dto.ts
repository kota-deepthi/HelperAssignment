import { Type } from "class-transformer";
import {IsArray,IsDate,IsEmail,IsNotEmpty,IsOptional,IsString} from "class-validator";

export class CreateHelperDto {
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  organisationName: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsArray()
  @IsNotEmpty()
  language: string[];

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string

  @IsString()
  @IsNotEmpty()
  phoneNumber: string

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  vehicleType?: string;

  @IsOptional()
  vehicleNumber?: string;

  @IsString()
  @IsNotEmpty()
  docType: string;


  @IsOptional()
  @Type(() => Date)
  @IsDate()
  DOJ?: Date;
}
