import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Counter, CounterSchema } from "src/Schemas/Counter.schema";
import { Helper, HelperSchema } from "src/Schemas/Helper.schema";
import { HelperService } from "./helper.service";
import { HelperController } from "./helper.controller";

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: Helper.name,
                schema: HelperSchema
            },
            {
                name: Counter.name,
                schema: CounterSchema
            }
        ])
    ],
    providers:[HelperService],
    controllers: [HelperController],
    
})

export class HelperModule{}