interface FileObject {
  name: string;
  url: string;
}

interface PersonalRequirements {
  profilePicture: FileObject;
  nationality: string;
  pwd: number;
  pwdFile: FileObject;
  nbiFile: FileObject;
  licenseFile: FileObject;
  vaccinationCertificate: FileObject;
  vaccinationCertificateConsent: boolean;
  emergencyContactName: string;
  emergencyContactAddress: string;
  emergencyContactMobNum: string;
  emergencyContactRelationship: string;
  driverLicenseFront: FileObject;
  driverLicenseBack: FileObject;
  driverLicenseNumber: string;
  driverLicenseExpDate: string;
  documentType: string;
  documentImg: FileObject;
  privacyNotice: boolean;
  codeOfConduct: boolean;
  termsOfService: boolean;
  declarations: boolean;
}

interface VehicleOwnership {
  ownershipId: string;
  description: string;
  operatorsFullName: string;
  operatorsAddress: string;
  operatorsMobileNumber: string;
  operatorDocuments: FileObject;
}

interface TransportRequirements {
  vehicleOwnership: VehicleOwnership;
  plateNumber: string;
  orNumber: string;
  crNumber: string;
  carColor: string;
  carBrand: string;
  carModel: string;
  ownerDocuments: FileObject;
  operatorsDocument: FileObject;
  vehicleOR: FileObject;
  vehicleCR: FileObject;
  vehicleSalesInvoice: FileObject;
  authorizationLetterPageOne: FileObject;
  authorizationLetterPageTwo: FileObject;
  sPAPageOne: FileObject;
  sPAPageTwo: FileObject;
  ltfrbDocType: string;
  pAPageOne: FileObject;
  pAPageTwo: FileObject;
  cPCPageOne: FileObject;
  cPCPageTwo: FileObject;
  mEPAPageOne: FileObject;
  mEPAPageTwo: FileObject;
  pAMI: FileObject;
}

interface DriverPayload {
  firstName: string;
  surName: string;
  name: string;
  email: string;
  mobnum: string;
  caseNum: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  password: string;
  type: string;
  status: string;
  referralCode: string;
  carType: string;
  zone: string;
  id: string;
  personalRequirements: PersonalRequirements;
  transportRequirements: TransportRequirements;
}

const generateAlphaNumeric = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

interface BuildDriverPayloadParams {
  carType: string;
  firstName: string;
  surName: string;
  email: string;
  lastTenDigits: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  password: string;
  caseNum: string;
}

export function buildDriverPayload({
  carType,
  firstName,
  surName,
  email,
  lastTenDigits,
  address,
  city,
  province,
  zipCode,
  password,
  caseNum,
}: BuildDriverPayloadParams): DriverPayload {
  return {
    firstName,
    surName,
    name: `${firstName} ${surName}`,
    email,
    mobnum: lastTenDigits,
    caseNum,
    address,
    city,
    province,
    zipCode,
    password: password,
    type: "driver",
    status: "pending",
    referralCode: "",
    carType,
    zone: "",
    id: generateAlphaNumeric(),
    personalRequirements: {
      profilePicture: { name: "", url: "" },
      nationality: "",
      pwd: 0,
      pwdFile: { name: "", url: "" },
      nbiFile: { name: "", url: "" },
      licenseFile: { name: "", url: "" },
      vaccinationCertificate: { name: "", url: "" },
      vaccinationCertificateConsent: false,
      emergencyContactName: "",
      emergencyContactAddress: "",
      emergencyContactMobNum: "",
      emergencyContactRelationship: "",
      driverLicenseFront: { name: "", url: "" },
      driverLicenseBack: { name: "", url: "" },
      driverLicenseNumber: "",
      driverLicenseExpDate: "",
      documentType: "",
      documentImg: { name: "", url: "" },
      privacyNotice: false,
      codeOfConduct: false,
      termsOfService: false,
      declarations: false,
    },
    transportRequirements: {
      vehicleOwnership: {
        ownershipId: "",
        description: "",
        operatorsFullName: "",
        operatorsAddress: "",
        operatorsMobileNumber: "",
        operatorDocuments: { name: "", url: "" },
      },
      plateNumber: "",
      orNumber: "",
      crNumber: "",
      carColor: "",
      carBrand: "",
      carModel: "",
      ownerDocuments: { name: "", url: "" },
      operatorsDocument: { name: "", url: "" },
      vehicleOR: { name: "", url: "" },
      vehicleCR: { name: "", url: "" },
      vehicleSalesInvoice: { name: "", url: "" },
      authorizationLetterPageOne: { name: "", url: "" },
      authorizationLetterPageTwo: { name: "", url: "" },
      sPAPageOne: { name: "", url: "" },
      sPAPageTwo: { name: "", url: "" },
      ltfrbDocType: "",
      pAPageOne: { name: "", url: "" },
      pAPageTwo: { name: "", url: "" },
      cPCPageOne: { name: "", url: "" },
      cPCPageTwo: { name: "", url: "" },
      mEPAPageOne: { name: "", url: "" },
      mEPAPageTwo: { name: "", url: "" },
      pAMI: { name: "", url: "" },
    },
  };
}
