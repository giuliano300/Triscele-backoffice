export interface Attendance {
    _id?: string;    
    operatorId: string;
    date: Date;
    entryTime: string;
    exitTime?: string;
    lunchStart?: string;
    lunchEnd?: string;
    notes?: string;
}