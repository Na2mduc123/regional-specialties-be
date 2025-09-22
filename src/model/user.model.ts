export interface User {
  id: string; // 5 ký tự số
  username: string;
  password: string;
  email?: string;
  role?: "user" | "admin";
  avatar?: string;
  created_at?: Date;
  updated_at?: Date;
}
