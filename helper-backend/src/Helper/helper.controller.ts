import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { HelperService } from "./helper.service";
import { CreateHelperDto } from "./dto/CreateHelper.dto";
import mongoose from "mongoose";

@Controller('helper')
export class HelperController{
    constructor(private helperService: HelperService){}
    @Post('add-helper')
    @UsePipes(new ValidationPipe())
    createHelper(@Body() createHelperDto: CreateHelperDto){
        console.log(createHelperDto);
        return this.helperService.createHelper(createHelperDto);
    }

    @Get()
    getHelpers(){
        return this.helperService.getHelpers();
    }

    @Get(':id')
    async getHelperByID(@Param('id') id: string){
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if(!isValid) throw new HttpException('Helper not found', 404);
        const helper = await this.helperService.getHelperById(id)
        if(!helper) throw new HttpException('Helper not found', 404);
        return helper;
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe())
    async updateHelper(@Param('id') id: string, @Body() createHelperDto: CreateHelperDto) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid Helper', 404);
        const updatedHelper = await this.helperService.updateHelper(id, createHelperDto);
        if (!updatedHelper) throw new HttpException('Helper not found', 404);
        return updatedHelper;
    }

    @Delete(':id')
    async deleteHelper(@Param('id') id: string){
        const isValid = mongoose.Types.ObjectId.isValid(id);
        if (!isValid) throw new HttpException('Invalid Helper', 404);
        const deletedHelper = await this.helperService.deleteHelper(id);
        if (!deletedHelper) throw new HttpException('Helper not found', 404);
        return;
    }
}
