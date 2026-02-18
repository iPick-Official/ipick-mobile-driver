export interface FileData {
  name: string;
  url?: string;
}

export interface PersonalRequirements {
  profilePicture?: FileData | null;
  nationality: string;
  pwdFile?: FileData | null;
  vaccinationCertificate?: FileData | null;
  vaccinationCertificateConsent: boolean;
  emergencyContactName: string;
  emergencyContactAddress: string;
  emergencyContactMobNum: string;
  emergencyRelationship: string;
  driverLicenseFront?: FileData | null;
  driverLicenseBack?: FileData | null;
  driverLicenseNumber: string;
  driverLicenseExpDate: string;
  documentType: string;
  documentImg?: FileData | null;
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
