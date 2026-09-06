import type {User}  from "./user";

export interface AuthResponse {
  success: boolean;
  user: User;
  sessionToken: string;
}