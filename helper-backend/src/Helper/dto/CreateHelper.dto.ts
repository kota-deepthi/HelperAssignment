import { Type } from "class-transformer"
import { IsArray, IsDate, IsEmail, isEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateHelperDto{
    @IsOptional()
    profilePicurl? : string

    @IsString()
    @IsNotEmpty()
    serviceType: string

    @IsString()
    @IsNotEmpty()
    organisationName: string

    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsNotEmpty()
    @IsArray()
    language: Array<string>

    @IsString()
    @IsNotEmpty()
    gender: string

    @IsString()
    @IsNotEmpty()
    phone: string
    
    @IsOptional()
    @IsEmail()
    email? : string

    @IsOptional()
    vehicleType? : string

    @IsString()
    @IsNotEmpty()
    docType: string

    @IsString()
    @IsNotEmpty()
    KYCDocurl: string

    @IsOptional()
    additionalDoc? : string

    @IsOptional()
    @Type(()=>Date) //gotta know why this is used
    @IsDate()
    DOJ? : Date
}