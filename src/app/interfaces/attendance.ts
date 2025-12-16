export interface Break {
  start: string;
  end?: string;
}

export interface Attendance {
    _id?: string;    
    operatorId: string;
    date: Date;
    entryTime: string;
    exitTime?: string;
    breaks: Break[];
    notes?: string;
}