export interface Holiday {
  _id?: string;          // Mongo ID
  date: string;          // YYYY-MM-DD
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}