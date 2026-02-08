import { RefObject } from "react";

export type FieldItem = {
  label: string;
  value: string;
  setter: (v: string) => void;
  ref: RefObject<string>;
  capitalize?: boolean;
  type?: string;
  inputMode?: any;
  maxLength?: number;
  disable?: boolean;
};

export const personalReqFields = (args: {
  emergencyContactName: string;
  emergencyContactAddress: string;
  emergencyContactMobNum: string;
  emergencyRelationship: string;
  driverLicenseNumber: string;
  driverLicenseExpDate: string;
  documentType: string;

  refs: Record<string, RefObject<string>>;
  setters: Record<string, (v: string) => void>;
}): FieldItem[] => [
  {
    label: "License Number",
    value: args.driverLicenseNumber,
    setter: args.setters.setDriverLicenseNumber,
    ref: args.refs.driverLicenseNumberRef,
  },
  {
    label: "License Expiration",
    value: args.driverLicenseExpDate,
    setter: args.setters.setDriverLicenseExpDate,
    ref: args.refs.driverLicenseExpDateRef,
    type: "date",
  },
  {
    label: "Document Type",
    value: args.documentType,
    setter: args.setters.setDocumentType,
    ref: args.refs.documentTypeRef,
  },
  {
    label: "Contact Person",
    value: args.emergencyContactName,
    setter: args.setters.setEmergencyContactName,
    ref: args.refs.emergencyContactNameRef,
  },
  {
    label: "Address",
    value: args.emergencyContactAddress,
    setter: args.setters.setEmergencyContactAddress,
    ref: args.refs.emergencyContactAddressRef,
    capitalize: true,
  },
  {
    label: "Phone",
    value: args.emergencyContactMobNum,
    setter: args.setters.setEmergencyContactMobNum,
    ref: args.refs.emergencyContactMobNumRef,
    inputMode: "tel",
  },
  {
    label: "Relationship",
    value: args.emergencyRelationship,
    setter: args.setters.setEmergencyRelationship,
    ref: args.refs.emergencyRelationshipRef,
    capitalize: true,
  },
];
