export interface PermissionHoliday {
  _id: string;
  type: number;
  operatorId: string;
  startDate: Date;
  endDate: Date;
  startHour?: string;
  endHour?: string;
  reason?: string;
  accepted?: boolean;
  read?: boolean;
  rejectedReason?: string;
}
