export interface Illness {
  _id: string;
  protocol: string;
  operatorId: string;
  start: Date;
  end: Date;
  read: boolean;
}
