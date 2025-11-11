export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  isadmin: boolean;
  isactive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}
