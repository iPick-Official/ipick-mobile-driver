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

export const personalInfoFields = (args: {
  firstName: string;
  surName: string;
  mobileNumber: string;
  email: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  caseNumber: string;
  refs: Record<string, RefObject<string>>;
  setters: Record<string, (v: string) => void>;
}): FieldItem[] => [
  {
    label: "First Name",
    value: args.firstName,
    setter: args.setters.setFirstName,
    ref: args.refs.firstNameRef,
    capitalize: true,
  },
  {
    label: "Last Name",
    value: args.surName,
    setter: args.setters.setSurName,
    ref: args.refs.surNameRef,
    capitalize: true,
  },
  {
    label: "Mobile Number",
    value: args.mobileNumber,
    setter: args.setters.setMobileNumber,
    ref: args.refs.mobileNumberRef,
    type: "tel",
    inputMode: "numeric",
    maxLength: 10,
    disable: true,
  },
  {
    label: "Email",
    value: args.email,
    setter: args.setters.setEmail,
    ref: args.refs.emailRef,
    type: "email",
    inputMode: "email",
  },
  {
    label: "Address",
    value: args.address,
    setter: args.setters.setAddress,
    ref: args.refs.addressRef,
    capitalize: true,
  },
  {
    label: "City",
    value: args.city,
    setter: args.setters.setCity,
    ref: args.refs.cityRef,
    capitalize: true,
  },
  {
    label: "Province",
    value: args.province,
    setter: args.setters.setProvince,
    ref: args.refs.provinceRef,
    capitalize: true,
  },
  {
    label: "Zip Code",
    value: args.zipCode,
    setter: args.setters.setZipCode,
    ref: args.refs.zipCodeRef,
    type: "text",
    inputMode: "numeric",
  },
  {
    label: "LTFRB Case Number",
    value: args.caseNumber,
    setter: args.setters.setCaseNumber,
    ref: args.refs.caseNumberRef,
    type: "text",
    inputMode: "numeric",
  },
];
