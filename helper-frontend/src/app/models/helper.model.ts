interface Helper {
    _id: string;
    employeeCode: number;
    employeeIDurl: string;
    profilePicUrl: string;
    serviceType: string;
    organisationName: string;
    fullName: string;
    language: string[];
    gender: string;
    countryCode: string;
    phoneNumber: string;
    email?: string;
    vehicleType: string;
    vehicleNumber?: string;
    docType: string;
    kycDocUrl: string;
    additionalDoc?: string;
    additionalDocType?: string;
    DOJ: Date;
}

export default Helper;