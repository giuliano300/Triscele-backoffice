export interface Attendance {
    _id: string;    
    operatorId: string;
    date: Date;
    entryTime: string;
    exitTime?: string;
    notes?: string;
}