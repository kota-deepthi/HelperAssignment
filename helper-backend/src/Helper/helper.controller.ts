import {BadRequestException,Body,Controller,Delete,Get,HttpException,Param,Patch,Post,UploadedFiles,UseInterceptors,
  UsePipes,ValidationPipe} from "@nestjs/common";
import { HelperService } from "./helper.service";
import { CreateHelperDto } from "./dto/CreateHelper.dto";
import mongoose from "mongoose";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { extname } from "path";

@Controller('helper')
export class HelperController {
  constructor(private helperService: HelperService) {}

  @Post('add-helper')
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'profilePicUrl', maxCount: 1 },
      { name: 'kycDocUrl', maxCount: 1 },
      { name: 'additionalDoc', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    },
  ))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createHelper(
    @Body() createHelperDto: CreateHelperDto,
    @UploadedFiles() files: {
      profilePicUrl?: Express.Multer.File[];
      kycDocUrl?: Express.Multer.File[];
      additionalDoc?: Express.Multer.File[];
    },
  ) {
    if (!files.kycDocUrl || files.kycDocUrl.length === 0) {
      throw new BadRequestException('kycDocUrl file is required');
    }

    const finalHelper = {
      ...createHelperDto,
      profilePicUrl: files.profilePicUrl?.[0]?.filename,
      kycDocUrl: files.kycDocUrl?.[0]?.filename,
      additionalDoc: files.additionalDoc?.[0]?.filename,
    };

    console.log('Final Payload:', finalHelper);
    return this.helperService.createHelper(finalHelper);
  }

  @Get()
  getHelpers() {
    return this.helperService.getHelpers();
  }

  @Get(':id')
  async getHelperByID(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Helper not found', 404);
    const helper = await this.helperService.getHelperById(id);
    if (!helper) throw new HttpException('Helper not found', 404);
    return helper;
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'profilePicUrl', maxCount: 1 },
      { name: 'kycDocUrl', maxCount: 1 },
      { name: 'additionalDoc', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    },
  ))
  async updateHelper(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: {
      profilePicUrl?: Express.Multer.File[];
      kycDocUrl?: Express.Multer.File[];
      additionalDoc?: Express.Multer.File[];
    },
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('Invalid Helper ID', 404);
    }

    const helper = await this.helperService.getHelperById(id);
    if (!helper) {
      throw new HttpException('Helper not found', 404);
    }

    const updatePayload: Partial<CreateHelperDto> = {
      ...helper.toObject(),
    };

    const validationPipe = new ValidationPipe();

    try {
      const validatedBody = await validationPipe.transform(body, {
        metatype: CreateHelperDto,
        type: 'body',
      });
      Object.assign(updatePayload, validatedBody);
    } catch (e) {
      throw new BadRequestException(e.getResponse());
    }

    if (files.profilePicUrl && files.profilePicUrl.length > 0) {
      updatePayload['profilePicUrl'] = files.profilePicUrl[0].filename;
    }
    if (files.kycDocUrl && files.kycDocUrl.length > 0) {
      updatePayload['kycDocUrl'] = files.kycDocUrl[0].filename;
    }
    if (files.additionalDoc && files.additionalDoc.length > 0) {
      updatePayload['additionalDoc'] = files.additionalDoc[0].filename;
    }

    const updatedHelper = await this.helperService.updateHelper(id, updatePayload);

    if (!updatedHelper) {
      throw new HttpException('Helper not found after update', 404);
    }
    return updatedHelper;
  }

  @Delete(':id')
  async deleteHelper(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid Helper ID', 404);
    const deletedHelper = await this.helperService.deleteHelper(id);
    if (!deletedHelper) throw new HttpException('Helper not found', 404);
    return { message: 'Helper deleted successfully' };
  }

  @Post('searchFilter')
  async searchFilter(@Body() filter: {service: string[], organisation: string[], search: string}){
    return this.helperService.searchFilter(filter)
  }
}