import type { UserRole } from "@domain/constants/user-role.constant";
import type { UserProfile } from "@entities/user-profile";

export interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  password: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  banned: boolean;
  profiles: UserProfile[];
}
