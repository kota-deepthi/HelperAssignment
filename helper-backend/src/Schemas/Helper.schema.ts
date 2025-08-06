import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Helper{
    @Prop({unique: true, required: true})
    employeeCode: number

    @Prop({required: true})
    employeeIDurl: string

    @Prop()
    profilePicUrl? : string

    @Prop({required: true})
    serviceType: string

    @Prop({required: true})
    organisationName: string

    @Prop({required: true})
    fullName: string

    @Prop({required: true})
    language: Array<string>

    @Prop({required: true})
    gender: string

    @Prop({required: true})
    countryCode: string

    @Prop({required: true})
    phoneNumber: string
    
    @Prop()
    email? : string

    @Prop()
    vehicleType? : string

    @Prop({required: true})
    docType: string

    @Prop({required: true})
    kycDocUrl: string

    @Prop()
    additionalDoc? : string

    @Prop({default: new Date()})
    DOJ? : Date
}

export const HelperSchema = SchemaFactory.createForClass(Helper)
