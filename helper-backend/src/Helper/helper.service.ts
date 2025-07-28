import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Helper } from "src/Schemas/Helper.schema";
import { CreateHelperDto } from "./dto/CreateHelper.dto";
import { Counter } from "src/Schemas/Counter.schema";

@Injectable()
export class HelperService{
    constructor(@InjectModel(Helper.name) private helperModel: Model<Helper>,
        @InjectModel(Counter.name) private counterModel: Model<Counter>
    ){}

    async createHelper(CreateHelperDto: CreateHelperDto){

        const counter = await this.counterModel.findOneAndUpdate({name:'employeeCode'}, {$inc: {value:1}}, {new: true, upsert: true})
        const employeeCode = 10000+ counter.value
        const employeeIDurl = employeeCode.toString() 
        const newHelper = new this.helperModel({...CreateHelperDto, employeeCode, employeeIDurl});
        return newHelper.save()
    }

    getHelpers(){
        return this.helperModel.find();
    }
    
    getHelperById(id: string){
        return this.helperModel.findById(id);
    }

    async updateHelper(id: string, createHelperDto: CreateHelperDto){
        return await this.helperModel.findByIdAndUpdate(id, createHelperDto, {new:true})
    }

    deleteHelper(id: string){
        return this.helperModel.findByIdAndDelete(id);
    }
}