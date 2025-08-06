import { Injectable, Options } from "@nestjs/common";
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

    async updateHelper(id: string, updateData: Partial<CreateHelperDto>){
        return await this.helperModel.findByIdAndUpdate(id, updateData, {new:true})
    }

    deleteHelper(id: string){
        return this.helperModel.findByIdAndDelete(id);
    }

    getHelperByName(search: string){
        return this.helperModel.find({fullName: {$regex: search, $options: 'i'}})
    }

    getHelperByPhone(search: string){
        return this.helperModel.find({phoneNumber: {$regex: search, $options: 'i'}})
    }

    getHelperByEmpID(search: string){
        return this.helperModel.find({$expr:{
            $regexMatch : {
                input : {$toString: '$employeeCode'},
                regex: search
            }
        }})
    }

    async getHelperByFilter(filter: { service: string[], organisation: string[] }) {
        const query: any = {};
        if(filter.service && filter.service.length > 0) {
            query.serviceType = { $in:filter.service };
        }
        if(filter.organisation && filter.organisation.length > 0) {
            query.organisationName = { $in:filter.organisation };
        }
        return await this.helperModel.find(query).exec(); 
    }

}