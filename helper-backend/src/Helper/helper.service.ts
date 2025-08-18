import { Injectable, Options } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Helper } from "src/Schemas/Helper.schema";
import { CreateHelperDto } from "./dto/CreateHelper.dto";
import { Counter } from "src/Schemas/Counter.schema";
import { filter } from "rxjs";

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

   async searchFilter({service = [],organisation = [],search = ''}: {service?: string[] | string; organisation?: string[] | string;search?: string;}) {
  const serviceArr = Array.isArray(service) ? service : service ? [service] : [];
  const orgArr = Array.isArray(organisation) ? organisation : organisation ? [organisation] : [];
  search = search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
  return this.helperModel.aggregate([
    {
      $match: {
        $and: [
            {
                $or: [
                { fullName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                {
                    $expr: {
                    $regexMatch: {
                        input: { $toString: '$employeeCode' },
                        regex: search,
                    },
                    },
                },
                ],
            },
            ...(serviceArr.length ? [{ serviceType: { $in: serviceArr } }] : []),
            ...(orgArr.length ? [{ organisationName: { $in: orgArr } }] : []),
            ],
        },
        },
    ]);
    }
}