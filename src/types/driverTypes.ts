export interface FileData {
  name: string;
  url: string | null;
}

export interface PersonalRequirements {
  profilePicture: FileData;
  nationality: string;
  pwd: number;
  pwdFile: FileData;
  vaccinationCertificate: FileData;
  vaccinationCertificateConsent: boolean;
  emergencyContactName: string;
  emergencyContactAddress: string;
  emergencyContactMobNum: string;
  emergencyRelationship: string;
  driverLicenseFront: FileData;
  driverLicenseBack: FileData;
  driverLicenseNumber: string;
  driverLicenseExpDate: string;
  documentType: string;
  documentImg: FileData;
  privacyNotice: boolean;
  codeOfConduct: boolean;
  termsOfService: boolean;
  declarations: boolean;
}

export interface OperatorDocuments {
  name: string;
  url: string;
}

export interface VehicleOwnership {
  ownershipId: string;
  description: string;
  operatorsFullName: string;
  operatorsAddress: string;
  operatorsMobileNumber: string;
  operatorDocuments: OperatorDocuments;
}

export interface TransportRequirements {
  plateNumber: string;
  carColor: string;
  carBrand: string;
  carModel: string;
}

export interface Driver {
  _id: string;
  id: string;
  firstName?: string;
  surName?: string;
  name: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  mobnum?: string;
  caseNum?: string;
  status: string;
  type: string;
  carType: string;
  zone: string;
  personalRequirements: PersonalRequirements;
  transportRequirements: TransportRequirements;
  rating: number | null;
}
