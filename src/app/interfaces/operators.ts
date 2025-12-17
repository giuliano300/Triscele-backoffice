import { Permission } from "./permissions";

export interface Operators {
  _id?: string;  
  businessName: string;
  name: string;
  lastName: string;
  birthDate: string;
  mobile: string;
  status: number;
  email: string;
  fiscalCode: string;
  permissions: Permission[];
  address: string;
  zipCode: string;
  province: string;
  city: string;
  pwd: string;
  sectorId: string;
  startTime: string;
  endTime: string;
  numberOfHolidays: number;
  numberOfPermissions: number;
  remainingNumberOfHolidays?: number;
  remainingNumberOfPermissions?: number;
}