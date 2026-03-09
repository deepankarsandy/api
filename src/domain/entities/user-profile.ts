export interface UserProfile {
  id: number;
  userId: number;
  isDefault: boolean;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  slug: string | null;
  themePreference: string | null;
  timezone: string | null;
  language: string | null;
  createdAt: Date;
  updatedAt: Date;
}
